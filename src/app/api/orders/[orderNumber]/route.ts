import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { authenticate } from '@/lib/auth/middleware'
import { getClearanceDays } from '@/utils'
import { sendOrderDeliveredEmail, sendOrderCompletedEmail } from '@/lib/email'

// GET /api/orders/[orderNumber]
export async function GET(req: NextRequest, { params }: { params: { orderNumber: string } }) {
  try {
    const auth = await authenticate(req)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createClient()
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        buyer:users!buyer_id(id,username,display_name,profile_photo_url,country),
        seller:users!seller_id(id,username,display_name,profile_photo_url,country,
          seller_profile:seller_profiles(level,average_rating,total_reviews)),
        gig:gigs(id,title,slug,description,gallery:gig_gallery(url,type)),
        package:gig_packages(*),
        extras:order_extras(*),
        deliveries:order_deliveries(*),
        revisions:order_revisions(*)
      `)
      .eq('order_number', params.orderNumber)
      .single()

    if (error || !order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    if (order.buyer_id !== auth.userId && order.seller_id !== auth.userId && auth.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json({ data: order, error: null })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}

// PATCH /api/orders/[orderNumber] — action on order
export async function PATCH(req: NextRequest, { params }: { params: { orderNumber: string } }) {
  try {
    const auth = await authenticate(req)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createClient()
    const body = await req.json()
    const { action, message, files } = body

    const { data: order } = await supabase.from('orders').select('*').eq('order_number', params.orderNumber).single()
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    const isBuyer = order.buyer_id === auth.userId
    const isSeller = order.seller_id === auth.userId

    // ── DELIVER ────────────────────────────────────────────
    if (action === 'deliver') {
      if (!isSeller) return NextResponse.json({ error: 'Only the seller can deliver' }, { status: 403 })
      if (!['active', 'revision'].includes(order.status)) {
        return NextResponse.json({ error: 'Order cannot be delivered in its current state' }, { status: 400 })
      }

      // Create delivery record
      await supabase.from('order_deliveries').insert({
        order_id: order.id,
        message: message || null,
        files: files || null,
        is_final: true,
      })

      // Update order status
      await supabase.from('orders').update({
        status: 'delivered',
        delivered_at: new Date().toISOString(),
      }).eq('id', order.id)

      // Notify buyer
      const [{ data: buyer }, { data: convData }] = await Promise.all([
        supabase.from('users').select('email,username').eq('id', order.buyer_id).single(),
        supabase.from('conversations').select('id').eq('order_id', order.id).single(),
      ])

      if (buyer) await sendOrderDeliveredEmail(buyer.email, buyer.username, order.order_number, order.title)

      // System message
      if (convData) {
        await supabase.from('messages').insert({
          conversation_id: convData.id,
          is_system_message: true,
          content: 'The seller has delivered the order. Please review and accept the delivery or request a revision.',
          message_type: 'system',
        })
      }

      return NextResponse.json({ data: { message: 'Order delivered successfully' }, error: null })
    }

    // ── ACCEPT / COMPLETE ──────────────────────────────────
    if (action === 'complete') {
      if (!isBuyer) return NextResponse.json({ error: 'Only the buyer can complete the order' }, { status: 403 })
      if (order.status !== 'delivered') return NextResponse.json({ error: 'Order has not been delivered yet' }, { status: 400 })

      const now = new Date()

      // Get seller level for clearance
      const { data: sellerProfile } = await supabase.from('seller_profiles').select('level').eq('user_id', order.seller_id).single()
      const { data: plusSub } = await supabase.from('nolance_plus_subscriptions').select('id').eq('user_id', order.seller_id).eq('is_active', true).single()
      const clearanceDays = getClearanceDays(sellerProfile?.level || 'new', !!plusSub)
      const clearsAt = new Date(now.getTime() + clearanceDays * 24 * 60 * 60 * 1000)

      // Complete the order
      await supabase.from('orders').update({
        status: 'completed',
        completed_at: now.toISOString(),
      }).eq('id', order.id)

      // Create earnings record
      await supabase.from('earnings').insert({
        seller_id: order.seller_id,
        order_id: order.id,
        section: order.section,
        gross_amount: order.price,
        commission_rate: (order.nolance_fee / order.price) * 100,
        commission_amount: order.nolance_fee,
        net_amount: order.seller_earnings,
        clearance_status: 'pending',
        clearance_days: clearanceDays,
        clears_at: clearsAt.toISOString(),
      })

      // Update balance pending
      await supabase.from('balances').update({
        pending_clearance: supabase.rpc('add_amount', { amt: order.seller_earnings }) as any,
        total_earned: supabase.rpc('add_amount', { amt: order.seller_earnings }) as any,
      }).eq('user_id', order.seller_id)

      // Update seller stats
      await supabase.from('seller_profiles').update({
        total_orders_completed: supabase.rpc('increment_counter') as any,
        total_earnings: supabase.rpc('add_amount', { amt: order.seller_earnings }) as any,
      }).eq('user_id', order.seller_id)

      // Notify seller
      const { data: seller } = await supabase.from('users').select('email,username').eq('id', order.seller_id).single()
      if (seller) {
        await sendOrderCompletedEmail(
          seller.email, seller.username, order.order_number,
          order.seller_earnings, clearsAt.toLocaleDateString()
        )
      }

      return NextResponse.json({ data: { message: 'Order completed. Funds will clear in the seller\'s account.', clears_at: clearsAt }, error: null })
    }

    // ── REQUEST REVISION ───────────────────────────────────
    if (action === 'revision') {
      if (!isBuyer) return NextResponse.json({ error: 'Only the buyer can request a revision' }, { status: 403 })
      if (order.status !== 'delivered') return NextResponse.json({ error: 'Can only request revision on a delivered order' }, { status: 400 })
      if (order.revision_count >= order.max_revisions) {
        return NextResponse.json({ error: `You have used all ${order.max_revisions} revision(s) for this order` }, { status: 400 })
      }

      await supabase.from('order_revisions').insert({
        order_id: order.id, reason: message || 'Revision requested', files: files || null,
      })

      await supabase.from('orders').update({
        status: 'revision',
        revision_count: order.revision_count + 1,
      }).eq('id', order.id)

      return NextResponse.json({ data: { message: 'Revision requested' }, error: null })
    }

    // ── CANCEL ─────────────────────────────────────────────
    if (action === 'cancel') {
      if (!['pending', 'active'].includes(order.status)) {
        return NextResponse.json({ error: 'Order cannot be cancelled at this stage' }, { status: 400 })
      }

      await supabase.from('orders').update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: message || 'Cancelled by ' + (isBuyer ? 'buyer' : 'seller'),
      }).eq('id', order.id)

      // Refund if payment was made
      // In production: trigger refund via payment provider

      return NextResponse.json({ data: { message: 'Order cancelled' }, error: null })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('PATCH /api/orders error:', error)
    return NextResponse.json({ error: 'Failed to process order action' }, { status: 500 })
  }
}
