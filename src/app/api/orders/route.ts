import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, authenticate } from '@/lib/auth/middleware'
import { getCommissionRate, getClearanceDays } from '@/utils'
import { sendNewOrderEmail, sendOrderDeliveredEmail, sendOrderCompletedEmail } from '@/lib/email'

// GET /api/orders — list user's orders
export const GET = requireAuth(async (req: NextRequest, auth) => {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(req.url)
    const role = searchParams.get('role') || 'both'
    const status = searchParams.get('status') || undefined
    const page = Number(searchParams.get('page') || 1)
    const limit = Number(searchParams.get('limit') || 20)
    const offset = (page - 1) * limit

    let query = supabase.from('orders').select(`
      *,
      buyer:users!buyer_id(id,username,display_name,profile_photo_url),
      seller:users!seller_id(id,username,display_name,profile_photo_url),
      gig:gigs(id,title,slug,gallery:gig_gallery(url,type,sort_order)),
      package:gig_packages(id,package_type,name,price)
    `, { count: 'exact' })

    if (role === 'buyer') query = query.eq('buyer_id', auth.userId)
    else if (role === 'seller') query = query.eq('seller_id', auth.userId)
    else query = query.or(`buyer_id.eq.${auth.userId},seller_id.eq.${auth.userId}`)

    if (status) query = query.eq('status', status)

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1)

    const { data: orders, count, error } = await query
    if (error) throw error

    return NextResponse.json({ data: orders, total: count, page, limit, has_more: (count || 0) > offset + limit, error: null })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
})

// POST /api/orders — place order
export const POST = requireAuth(async (req: NextRequest, auth) => {
  try {
    const supabase = createClient()
    const { gig_id, package_id, extra_ids, requirements_data } = await req.json()

    if (!gig_id || !package_id) {
      return NextResponse.json({ error: 'Gig and package are required' }, { status: 400 })
    }

    // Get gig and package details
    const { data: gig } = await supabase.from('gigs').select('*').eq('id', gig_id).eq('status', 'active').single()
    if (!gig) return NextResponse.json({ error: 'Gig not found or not available' }, { status: 404 })
    if (gig.seller_id === auth.userId) return NextResponse.json({ error: 'You cannot order your own gig' }, { status: 400 })

    const { data: pkg } = await supabase.from('gig_packages').select('*').eq('id', package_id).eq('gig_id', gig_id).single()
    if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 })

    // Calculate price with extras
    let totalPrice = pkg.price
    const selectedExtras: any[] = []
    if (extra_ids && extra_ids.length > 0) {
      const { data: extras } = await supabase.from('gig_extras').select('*').in('id', extra_ids).eq('gig_id', gig_id)
      if (extras) {
        extras.forEach(e => { totalPrice += e.price; selectedExtras.push(e) })
      }
    }

    // Get seller level for clearance calculation
    const { data: sellerProfile } = await supabase.from('seller_profiles').select('level').eq('user_id', gig.seller_id).single()
    const { data: plusSub } = await supabase.from('nolance_plus_subscriptions').select('id').eq('user_id', gig.seller_id).eq('is_active', true).single()

    const commissionRate = getCommissionRate('gigs')
    const nolanceFee = parseFloat((totalPrice * commissionRate).toFixed(2))
    const sellerEarnings = parseFloat((totalPrice - nolanceFee).toFixed(2))
    const clearanceDays = getClearanceDays(sellerProfile?.level || 'new', !!plusSub)

    // Create order
    const { data: order, error: orderError } = await supabase.from('orders').insert({
      buyer_id: auth.userId,
      seller_id: gig.seller_id,
      gig_id,
      package_id,
      section: 'gigs',
      title: gig.title,
      requirements_submitted: !gig.requirements || requirements_data !== undefined,
      requirements_data: requirements_data || null,
      status: 'pending',
      price: totalPrice,
      nolance_fee: nolanceFee,
      seller_earnings: sellerEarnings,
      delivery_days: pkg.delivery_days,
      deadline: new Date(Date.now() + pkg.delivery_days * 24 * 60 * 60 * 1000).toISOString(),
      max_revisions: pkg.revisions,
    }).select().single()

    if (orderError || !order) throw orderError

    // Insert extras
    if (selectedExtras.length > 0) {
      await supabase.from('order_extras').insert(selectedExtras.map(e => ({
        order_id: order.id, extra_id: e.id, title: e.title, price: e.price
      })))
    }

    // Create conversation
    const { data: conv } = await supabase.from('conversations').insert({
      order_id: order.id, section: 'gigs'
    }).select().single()

    if (conv) {
      await supabase.from('conversation_participants').insert([
        { conversation_id: conv.id, user_id: auth.userId },
        { conversation_id: conv.id, user_id: gig.seller_id },
      ])
      // System message
      await supabase.from('messages').insert({
        conversation_id: conv.id,
        is_system_message: true,
        content: `Order ${order.order_number} has been placed. Delivery deadline: ${new Date(order.deadline!).toLocaleDateString()}.`,
        message_type: 'system',
      })
    }

    // Notify seller
    const [{ data: buyer }, { data: seller }] = await Promise.all([
      supabase.from('users').select('username,display_name').eq('id', auth.userId).single(),
      supabase.from('users').select('email,username').eq('id', gig.seller_id).single(),
    ])

    if (seller) {
      await sendNewOrderEmail(
        seller.email, seller.username, order.order_number,
        gig.title, buyer?.display_name || buyer?.username || 'A client',
        totalPrice, new Date(order.deadline!).toLocaleDateString()
      )
    }

    // Update seller gig order count
    await supabase.from('gigs').update({ orders_count: gig.orders_count + 1 }).eq('id', gig_id)

    return NextResponse.json({ data: { order, conversation_id: conv?.id }, error: null }, { status: 201 })
  } catch (error) {
    console.error('POST /api/orders error:', error)
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 })
  }
})
