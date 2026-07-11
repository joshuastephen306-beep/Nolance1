import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireSeller, authenticate } from '@/lib/auth/middleware'
import { GigSearchFilters } from '@/types'

// ── GET /api/gigs — browse gigs ───────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(req.url)

    const filters: GigSearchFilters = {
      query: searchParams.get('q') || undefined,
      category_id: searchParams.get('category_id') || undefined,
      subcategory_id: searchParams.get('subcategory_id') || undefined,
      min_price: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
      max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
      delivery_days: searchParams.get('delivery_days') ? Number(searchParams.get('delivery_days')) : undefined,
      seller_level: searchParams.get('seller_level') as any || undefined,
      min_rating: searchParams.get('min_rating') ? Number(searchParams.get('min_rating')) : undefined,
      is_online: searchParams.get('is_online') === 'true' || undefined,
      sort: searchParams.get('sort') as any || 'best_selling',
      page: Number(searchParams.get('page') || 1),
      limit: Number(searchParams.get('limit') || 20),
    }

    const offset = ((filters.page || 1) - 1) * (filters.limit || 20)

    let query = supabase
      .from('gigs')
      .select(`
        *,
        seller:users!seller_id(id,username,display_name,profile_photo_url,country,is_online,
          seller_profile:seller_profiles(level,average_rating,total_reviews,response_time_hours)),
        category:categories!category_id(id,name,slug),
        packages:gig_packages(*),
        gallery:gig_gallery(url,thumbnail_url,type,sort_order),
        tags:gig_tags(tag)
      `, { count: 'exact' })
      .eq('status', 'active')

    // Filters
    if (filters.category_id) query = query.eq('category_id', filters.category_id)
    if (filters.subcategory_id) query = query.eq('subcategory_id', filters.subcategory_id)
    if (filters.min_rating) query = query.gte('average_rating', filters.min_rating)

    // Price filter on packages
    if (filters.min_price || filters.max_price) {
      // Note: In production use a proper join/subquery for price filtering
    }

    // Online seller filter
    if (filters.is_online) {
      // Filter by seller.is_online — handled via subquery in production
    }

    // Search
    if (filters.query) {
      query = query.textSearch('title', filters.query, { type: 'websearch' })
    }

    // Seller level filter
    if (filters.seller_level) {
      // In production: join with seller_profiles
    }

    // Sort
    switch (filters.sort) {
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
      case 'top_rated':
        query = query.order('average_rating', { ascending: false })
        break
      case 'best_selling':
      default:
        query = query.order('orders_count', { ascending: false })
        break
    }

    query = query.range(offset, offset + (filters.limit || 20) - 1)

    const { data: gigs, count, error } = await query
    if (error) throw error

    // Increment impressions for returned gigs
    if (gigs && gigs.length > 0) {
      const ids = gigs.map((g: any) => g.id)
      await supabase.rpc('increment_gig_impressions', { gig_ids: ids }).catch(() => {})
    }

    return NextResponse.json({
      data: gigs,
      total: count || 0,
      page: filters.page,
      limit: filters.limit,
      has_more: (count || 0) > (offset + (filters.limit || 20)),
      error: null,
    })
  } catch (error) {
    console.error('GET /api/gigs error:', error)
    return NextResponse.json({ error: 'Failed to fetch gigs' }, { status: 500 })
  }
}

// ── POST /api/gigs — create gig ───────────────────────────────
export const POST = requireSeller(async (req: NextRequest, auth) => {
  try {
    const supabase = createClient()
    const body = await req.json()
    const { title, category_id, subcategory_id, description, tags, packages, extras, faqs, requirements } = body

    // Validate
    if (!title || title.length > 80) {
      return NextResponse.json({ error: 'Gig title must be between 1 and 80 characters' }, { status: 400 })
    }
    if (!category_id) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 })
    }
    if (!description || description.length < 120) {
      return NextResponse.json({ error: 'Description must be at least 120 characters' }, { status: 400 })
    }

    // Check seller gig slot limit
    const { data: sellerProfile } = await supabase
      .from('seller_profiles')
      .select('active_gig_count, max_gig_slots')
      .eq('user_id', auth.userId)
      .single()

    if (sellerProfile && sellerProfile.active_gig_count >= sellerProfile.max_gig_slots) {
      return NextResponse.json({
        error: `You have reached your gig limit of ${sellerProfile.max_gig_slots}. Upgrade your seller level to create more gigs.`
      }, { status: 400 })
    }

    // Validate tags
    if (tags && tags.length > 14) {
      return NextResponse.json({ error: 'Maximum 14 tags allowed' }, { status: 400 })
    }
    for (const tag of (tags || [])) {
      if (tag.length > 20) return NextResponse.json({ error: `Tag "${tag}" exceeds 20 characters` }, { status: 400 })
      if (tag.trim().split(/\s+/).length > 3) return NextResponse.json({ error: `Tag "${tag}" exceeds 3 words` }, { status: 400 })
    }

    // Create gig
    const { data: gig, error: gigError } = await supabase
      .from('gigs')
      .insert({
        seller_id: auth.userId,
        title: title.trim(),
        category_id,
        subcategory_id: subcategory_id || null,
        description: description.trim(),
        status: 'pending', // Goes to review
      })
      .select()
      .single()

    if (gigError || !gig) {
      throw gigError
    }

    // Insert tags
    if (tags && tags.length > 0) {
      await supabase.from('gig_tags').insert(
        tags.map((tag: string) => ({ gig_id: gig.id, tag: tag.trim().toLowerCase() }))
      )
    }

    // Insert packages
    if (packages) {
      const packageRows = Object.entries(packages).map(([type, pkg]: [string, any]) => ({
        gig_id: gig.id,
        package_type: type,
        name: pkg.name,
        description: pkg.description,
        price: pkg.price,
        delivery_days: pkg.delivery_days,
        revisions: pkg.revisions,
        features: pkg.features || {},
      }))
      await supabase.from('gig_packages').insert(packageRows)
    }

    // Insert extras
    if (extras && extras.length > 0) {
      await supabase.from('gig_extras').insert(
        extras.slice(0, 5).map((e: any) => ({ gig_id: gig.id, ...e }))
      )
    }

    // Insert FAQs
    if (faqs && faqs.length > 0) {
      await supabase.from('gig_faqs').insert(
        faqs.slice(0, 10).map((f: any, i: number) => ({ gig_id: gig.id, ...f, sort_order: i }))
      )
    }

    // Insert requirements
    if (requirements && requirements.length > 0) {
      await supabase.from('gig_requirements').insert(
        requirements.map((r: any, i: number) => ({ gig_id: gig.id, ...r, sort_order: i }))
      )
    }

    // Send approval notification
    const { sendGigApprovedEmail } = await import('@/lib/email')
    const { data: userData } = await supabase.from('users').select('email,username').eq('id', auth.userId).single()
    if (userData) {
      // In production: queue this for after review. For now notify submission
    }

    return NextResponse.json({
      data: { gig, message: 'Gig submitted for review. It will be live within 24 hours.' },
      error: null,
    }, { status: 201 })

  } catch (error) {
    console.error('POST /api/gigs error:', error)
    return NextResponse.json({ error: 'Failed to create gig' }, { status: 500 })
  }
})
