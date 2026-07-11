import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { authenticate, requireAuth } from '@/lib/auth/middleware'
import { getClearanceDays } from '@/utils'

// GET /api/marketplace/listing/[slug]
export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const supabase = createClient()

    const { data: listing, error } = await supabase
      .from('marketplace_listings')
      .select(`
        *,
        seller:users!seller_id(
          id, username, display_name, profile_photo_url, country, is_online,
          seller_profile:seller_profiles(level, average_rating, total_reviews, total_orders_completed)
        )
      `)
      .eq('slug', params.slug)
      .eq('status', 'active')
      .single()

    if (error || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Increment views
    await supabase.from('marketplace_listings')
      .update({ views: (listing.views || 0) + 1 })
      .eq('id', listing.id)

    return NextResponse.json({ data: listing, error: null })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch listing' }, { status: 500 })
  }
}

// POST /api/marketplace/listing/[slug]/purchase — buy listing
export const POST = requireAuth(async (req: NextRequest, auth) => {
  try {
    const supabase = createClient()
    const url = new URL(req.url)
    const slug = url.pathname.split('/')[4]
    const { payment_method } = await req.json()

    // Get listing
    const { data: listing } = await supabase
      .from('marketplace_listings')
      .select('*, seller:users!seller_id(email, username)')
      .eq('slug', slug)
      .eq('status', 'active')
      .single()

    if (!listing) return NextResponse.json({ error: 'Listing not found or no longer available' }, { status: 404 })
    if (listing.seller_id === auth.userId) return NextResponse.json({ error: 'You cannot buy your own listing' }, { status: 400 })

    // Check marketplace access
    const { data: reg } = await supabase
      .from('section_registrations')
      .select('id')
      .eq('user_id', auth.userId)
      .eq('section', 'marketplace')
      .single()

    if (!reg) return NextResponse.json({ error: 'Marketplace access required' }, { status: 403 })

    const commissionRate = listing.commission_rate / 100
    const commissionAmount = parseFloat((listing.price * commissionRate).toFixed(2))
    const sellerEarnings = parseFloat((listing.price - commissionAmount).toFixed(2))

    // Get clearance days for seller
    const { data: sellerProfile } = await supabase
      .from('seller_profiles')
      .select('level')
      .eq('user_id', listing.seller_id)
      .single()

    const { data: plusSub } = await supabase
      .from('nolance_plus_subscriptions')
      .select('id')
      .eq('user_id', listing.seller_id)
      .eq('is_active', true)
      .single()

    const clearanceDays = 2 // Marketplace always 1-2 days
    const clearsAt = new Date(Date.now() + clearanceDays * 24 * 60 * 60 * 1000)

    // Create marketplace order
    const { data: order, error: orderError } = await supabase
      .from('marketplace_orders')
      .insert({
        listing_id: listing.id,
        buyer_id: auth.userId,
        seller_id: listing.seller_id,
        amount: listing.price,
        commission_amount: commissionAmount,
        seller_earnings: sellerEarnings,
        status: 'held',
        clearance_days: clearanceDays,
        clears_at: clearsAt.toISOString(),
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Mark listing as sold if single-use
    await supabase.from('marketplace_listings').update({ status: 'sold' }).eq('id', listing.id)

    // Create earnings record
    await supabase.from('earnings').insert({
      seller_id: listing.seller_id,
      order_id: order.id,
      section: 'marketplace',
      gross_amount: listing.price,
      commission_rate: listing.commission_rate,
      commission_amount: commissionAmount,
      net_amount: sellerEarnings,
      clearance_status: 'pending',
      clearance_days: clearanceDays,
      clears_at: clearsAt.toISOString(),
    })

    // Notify seller
    await supabase.from('notifications').insert({
      user_id: listing.seller_id,
      type: 'payment',
      title: 'Your listing sold! 🎉',
      body: `"${listing.title}" was purchased. Earnings of $${sellerEarnings} will clear in ${clearanceDays} days.`,
      data: { listing_id: listing.id, order_id: order.id },
    })

    // Notify buyer with delivery instructions
    let deliveryMessage = ''
    if (listing.delivery_type === 'instant') {
      deliveryMessage = 'Your files are ready for download below.'
    } else {
      deliveryMessage = 'The seller will deliver your purchase within 24 hours. Check your messages.'
    }

    await supabase.from('notifications').insert({
      user_id: auth.userId,
      type: 'payment',
      title: 'Purchase successful!',
      body: `You bought "${listing.title}". ${deliveryMessage}`,
      data: { listing_id: listing.id, order_id: order.id },
    })

    return NextResponse.json({
      data: {
        order,
        message: 'Purchase successful!',
        delivery_type: listing.delivery_type,
        delivery_info: deliveryMessage,
      },
      error: null,
    }, { status: 201 })
  } catch (error) {
    console.error('Purchase error:', error)
    return NextResponse.json({ error: 'Failed to complete purchase' }, { status: 500 })
  }
})
