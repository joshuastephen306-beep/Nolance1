import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/middleware'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' })

// POST /api/payments/initiate — start a payment
export const POST = requireAuth(async (req: NextRequest, auth) => {
  try {
    const supabase = createClient()
    const { order_id, method } = await req.json()

    if (!order_id || !method) {
      return NextResponse.json({ error: 'Order ID and payment method are required' }, { status: 400 })
    }

    // Get order
    const { data: order } = await supabase
      .from('orders')
      .select('*, buyer:users!buyer_id(email,username)')
      .eq('id', order_id)
      .eq('buyer_id', auth.userId)
      .eq('status', 'pending')
      .single()

    if (!order) return NextResponse.json({ error: 'Order not found or already paid' }, { status: 404 })

    // ── PAYSTACK ──────────────────────────────────────────
    if (method === 'paystack') {
      const amountKobo = Math.round(order.price * 100) // Paystack uses kobo

      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: order.buyer.email,
          amount: amountKobo,
          currency: 'NGN',
          reference: `NL-PAY-${order.id.substring(0, 8).toUpperCase()}`,
          metadata: {
            order_id: order.id,
            order_number: order.order_number,
            buyer_id: auth.userId,
          },
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.order_number}?payment=success`,
        }),
      })

      const data = await response.json()
      if (!data.status) throw new Error(data.message)

      // Record payment initiation
      await supabase.from('payments').insert({
        order_id: order.id,
        buyer_id: auth.userId,
        amount: order.price,
        currency: 'NGN',
        payment_method: 'card',
        payment_provider: 'paystack',
        provider_reference: data.data.reference,
        status: 'pending',
      })

      return NextResponse.json({
        data: {
          authorization_url: data.data.authorization_url,
          access_code: data.data.access_code,
          reference: data.data.reference,
          provider: 'paystack',
        },
        error: null,
      })
    }

    // ── STRIPE ────────────────────────────────────────────
    if (method === 'stripe') {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: order.title,
              description: `Order ${order.order_number} on Nolance`,
            },
            unit_amount: Math.round(order.price * 100),
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.order_number}?payment=success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.order_number}?payment=cancelled`,
        metadata: { order_id: order.id, buyer_id: auth.userId },
        customer_email: order.buyer.email,
      })

      await supabase.from('payments').insert({
        order_id: order.id,
        buyer_id: auth.userId,
        amount: order.price,
        currency: 'USD',
        payment_method: 'card',
        payment_provider: 'stripe',
        provider_reference: session.id,
        status: 'pending',
      })

      return NextResponse.json({
        data: { checkout_url: session.url, session_id: session.id, provider: 'stripe' },
        error: null,
      })
    }

    // ── NOLANCE BALANCE ───────────────────────────────────
    if (method === 'balance') {
      const { data: balance } = await supabase
        .from('balances')
        .select('available')
        .eq('user_id', auth.userId)
        .single()

      if (!balance || balance.available < order.price) {
        return NextResponse.json({ error: 'Insufficient balance. Please top up or use another payment method.' }, { status: 400 })
      }

      // Deduct from balance
      await supabase.from('balances').update({
        available: balance.available - order.price,
      }).eq('user_id', auth.userId)

      // Mark payment complete
      await supabase.from('payments').insert({
        order_id: order.id,
        buyer_id: auth.userId,
        amount: order.price,
        currency: 'USD',
        payment_method: 'balance',
        payment_provider: 'nolance',
        status: 'held',
        paid_at: new Date().toISOString(),
      })

      // Activate order
      await supabase.from('orders').update({ status: 'active' }).eq('id', order.id)

      return NextResponse.json({ data: { message: 'Payment successful. Order is now active.', redirect: `/orders/${order.order_number}` }, error: null })
    }

    return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 })
  } catch (error) {
    console.error('Payment initiation error:', error)
    return NextResponse.json({ error: 'Payment initialization failed' }, { status: 500 })
  }
})
