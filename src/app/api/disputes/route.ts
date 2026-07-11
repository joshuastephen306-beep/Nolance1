import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/middleware'

// GET /api/disputes
export const GET = requireAuth(async (req: NextRequest, auth) => {
  try {
    const supabase = createClient()
    const { data: disputes } = await supabase.from('disputes').select(`
      *, order:orders(id,order_number,title,price),
      messages:dispute_messages(*, sender:users!sender_id(id,username,display_name,profile_photo_url))
    `)
      .or(`opened_by.eq.${auth.userId},against.eq.${auth.userId}`)
      .order('created_at', { ascending: false })

    return NextResponse.json({ data: disputes, error: null })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch disputes' }, { status: 500 })
  }
})

// POST /api/disputes — open dispute
export const POST = requireAuth(async (req: NextRequest, auth) => {
  try {
    const supabase = createClient()
    const { order_id, reason, evidence } = await req.json()

    if (!order_id || !reason) return NextResponse.json({ error: 'Order and reason are required' }, { status: 400 })
    if (reason.length < 30) return NextResponse.json({ error: 'Please provide more detail about the issue' }, { status: 400 })

    // Get order
    const { data: order } = await supabase.from('orders').select('*')
      .eq('id', order_id).in('status', ['active', 'delivered', 'revision']).single()
    if (!order) return NextResponse.json({ error: 'Order not found or not eligible for dispute' }, { status: 404 })

    const isBuyer = order.buyer_id === auth.userId
    const isSeller = order.seller_id === auth.userId
    if (!isBuyer && !isSeller) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

    // Check existing dispute
    const { data: existing } = await supabase.from('disputes').select('id')
      .eq('order_id', order_id).not('status', 'eq', 'closed').single()
    if (existing) return NextResponse.json({ error: 'A dispute already exists for this order' }, { status: 400 })

    const againstId = isBuyer ? order.seller_id : order.buyer_id

    const { data: dispute } = await supabase.from('disputes').insert({
      order_id, opened_by: auth.userId, against: againstId,
      section: order.section, reason: reason.trim(),
      evidence: evidence || [], status: 'open',
    }).select().single()

    // Update order status
    await supabase.from('orders').update({ status: 'disputed' }).eq('id', order_id)

    // Hold any pending earnings
    await supabase.from('earnings').update({ clearance_status: 'held' })
      .eq('order_id', order_id).eq('clearance_status', 'pending')

    // Notify other party
    await supabase.from('notifications').insert({
      user_id: againstId, type: 'order',
      title: 'A dispute has been opened on your order',
      body: `Order dispute opened. Our team will review within 48 hours.`,
      data: { dispute_id: dispute?.id, order_id },
    })

    return NextResponse.json({
      data: { dispute, message: 'Dispute opened. Our team will review within 48 hours.' },
      error: null,
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to open dispute' }, { status: 500 })
  }
})

// PATCH /api/disputes — add message or appeal
export const PATCH = requireAuth(async (req: NextRequest, auth) => {
  try {
    const supabase = createClient()
    const { dispute_id, action, content, attachments, appeal_reason } = await req.json()

    const { data: dispute } = await supabase.from('disputes').select('*').eq('id', dispute_id).single()
    if (!dispute) return NextResponse.json({ error: 'Dispute not found' }, { status: 404 })

    const isParty = dispute.opened_by === auth.userId || dispute.against === auth.userId
    if (!isParty && auth.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

    if (action === 'message') {
      await supabase.from('dispute_messages').insert({
        dispute_id, sender_id: auth.userId,
        content: content.trim(), attachments: attachments || [],
        is_admin: auth.role === 'admin',
      })
      return NextResponse.json({ data: { message: 'Message added' }, error: null })
    }

    if (action === 'appeal') {
      if (dispute.status !== 'resolved') return NextResponse.json({ error: 'Can only appeal a resolved dispute' }, { status: 400 })
      if (dispute.appeal_opened) return NextResponse.json({ error: 'Appeal already submitted' }, { status: 400 })
      if (!appeal_reason || appeal_reason.length < 30) return NextResponse.json({ error: 'Please provide a detailed reason for appeal' }, { status: 400 })

      await supabase.from('disputes').update({
        appeal_opened: true, appeal_reason: appeal_reason.trim(), status: 'appealed',
      }).eq('id', dispute_id)

      return NextResponse.json({ data: { message: 'Appeal submitted. Our team will review within 5 business days.' }, error: null })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process dispute action' }, { status: 500 })
  }
})
