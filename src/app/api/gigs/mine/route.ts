import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/middleware'

// GET /api/gigs/mine — get seller's own gigs
export const GET = requireAuth(async (req: NextRequest, auth) => {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || undefined
    const page = Number(searchParams.get('page') || 1)
    const limit = 20
    const offset = (page - 1) * limit

    let query = supabase
      .from('gigs')
      .select(`
        *,
        category:categories!category_id(id,name,slug),
        packages:gig_packages(id,package_type,name,price,delivery_days,revisions),
        gallery:gig_gallery(url,thumbnail_url,type,sort_order),
        tags:gig_tags(tag)
      `, { count: 'exact' })
      .eq('seller_id', auth.userId)
      .neq('status', 'deleted')
      .order('created_at', { ascending: false })

    if (status) query = query.eq('status', status)

    const { data: gigs, count, error } = await query.range(offset, offset + limit - 1)
    if (error) throw error

    return NextResponse.json({
      data: gigs,
      total: count,
      page,
      limit,
      has_more: (count || 0) > offset + limit,
      error: null,
    })
  } catch (error) {
    console.error('GET /api/gigs/mine error:', error)
    return NextResponse.json({ error: 'Failed to fetch your gigs' }, { status: 500 })
  }
})
