import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, authenticate } from '@/lib/auth/middleware'
import { slugify } from '@/utils'

// GET /api/directory — browse businesses
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(req.url)
    const page = Number(searchParams.get('page') || 1)
    const limit = Number(searchParams.get('limit') || 20)
    const offset = (page - 1) * limit
    const q = searchParams.get('q')
    const category = searchParams.get('category')
    const country = searchParams.get('country')
    const plan = searchParams.get('plan')

    let query = supabase.from('businesses').select(`
      id, name, slug, category, description, plan, logo_url, cover_url,
      website_url, phone, email, city, country, size, year_founded,
      is_verified, social_links, views, contact_count, created_at,
      owner:users!owner_id(id,username,display_name),
      service_needs:business_service_needs(id,title,description,is_active)
    `, { count: 'exact' })

    if (q) query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%`)
    if (category) query = query.ilike('category', `%${category}%`)
    if (country) query = query.eq('country', country)
    if (plan) query = query.eq('plan', plan)

    // Premium listings first, then standard, then free
    const { data: businesses, count } = await query
      .order('plan', { ascending: false })
      .order('views', { ascending: false })
      .range(offset, offset + limit - 1)

    // Increment views for results
    if (businesses && businesses.length > 0 && q) {
      const ids = businesses.map((b: any) => b.id)
      for (const id of ids) {
        await supabase.from('businesses').update({ views: supabase.rpc('increment_views') as any }).eq('id', id)
      }
    }

    return NextResponse.json({ data: businesses, total: count, page, limit, has_more: (count || 0) > offset + limit, error: null })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch businesses' }, { status: 500 })
  }
}

// POST /api/directory — register business
export const POST = requireAuth(async (req: NextRequest, auth) => {
  try {
    const supabase = createClient()
    const body = await req.json()
    const { name, category, description, website_url, phone, email, address, city, country, size, year_founded, social_links, plan } = body

    if (!name || !category) return NextResponse.json({ error: 'Business name and category are required' }, { status: 400 })

    const slug = `${slugify(name)}-${Date.now()}`

    const { data: business } = await supabase.from('businesses').insert({
      owner_id: auth.userId,
      name: name.trim(),
      slug,
      category: category.trim(),
      description: description?.trim() || null,
      plan: plan || 'free',
      website_url: website_url || null,
      phone: phone || null,
      email: email || null,
      address: address || null,
      city: city || null,
      country: country || null,
      size: size || null,
      year_founded: year_founded || null,
      social_links: social_links || {},
      is_verified: false,
    }).select().single()

    return NextResponse.json({ data: { business, message: 'Business profile created. Verification within 24 hours.' }, error: null }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to register business' }, { status: 500 })
  }
})
