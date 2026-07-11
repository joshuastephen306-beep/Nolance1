import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/middleware'

// GET /api/marketplace — browse listings
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(req.url)
    const page = Number(searchParams.get('page') || 1)
    const limit = Number(searchParams.get('limit') || 20)
    const offset = (page - 1) * limit
    const category = searchParams.get('category')
    const min_price = searchParams.get('min_price')
    const max_price = searchParams.get('max_price')
    const delivery_type = searchParams.get('delivery_type')
    const q = searchParams.get('q')
    const sort = searchParams.get('sort') || 'newest'

    let query = supabase.from('marketplace_listings').select(`
      *,
      seller:users!seller_id(id,username,display_name,profile_photo_url,country,
        seller_profile:seller_profiles(level,average_rating,total_reviews))
    `, { count: 'exact' }).eq('status', 'active')

    if (category) query = query.eq('category', category)
    if (min_price) query = query.gte('price', Number(min_price))
    if (max_price) query = query.lte('price', Number(max_price))
    if (delivery_type) query = query.eq('delivery_type', delivery_type)
    if (q) query = query.ilike('title', `%${q}%`)

    switch (sort) {
      case 'price_asc': query = query.order('price', { ascending: true }); break
      case 'price_desc': query = query.order('price', { ascending: false }); break
      case 'most_viewed': query = query.order('views', { ascending: false }); break
      default: query = query.order('created_at', { ascending: false })
    }

    const { data: listings, count } = await query.range(offset, offset + limit - 1)
    return NextResponse.json({ data: listings, total: count, page, limit, has_more: (count || 0) > offset + limit, error: null })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 })
  }
}

// POST /api/marketplace — create listing
export const POST = requireAuth(async (req: NextRequest, auth) => {
  try {
    const supabase = createClient()

    // Check marketplace access
    const { data: reg } = await supabase.from('section_registrations')
      .select('id').eq('user_id', auth.userId).eq('section', 'marketplace').single()
    if (!reg) return NextResponse.json({ error: 'Marketplace access required' }, { status: 403 })

    const body = await req.json()
    const { title, category, description, price, delivery_type, condition, screenshots, proof_of_ownership } = body

    if (!title || !category || !description || !price) {
      return NextResponse.json({ error: 'Title, category, description, and price are required' }, { status: 400 })
    }
    if (price < 1) return NextResponse.json({ error: 'Minimum price is $1' }, { status: 400 })

    // Slug generation
    const { slugify } = await import('@/utils')
    const baseSlug = slugify(title)
    const slug = `${baseSlug}-${Date.now()}`

    const { data: listing } = await supabase.from('marketplace_listings').insert({
      seller_id: auth.userId,
      title: title.trim(),
      slug,
      category,
      description: description.trim(),
      price,
      currency: 'USD',
      delivery_type: delivery_type || 'manual',
      condition: condition || null,
      screenshots: screenshots || [],
      proof_of_ownership: proof_of_ownership || null,
      status: 'pending', // Goes for review
      commission_rate: 5,
    }).select().single()

    return NextResponse.json({ data: { listing, message: 'Listing submitted for review' }, error: null }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 })
  }
})
