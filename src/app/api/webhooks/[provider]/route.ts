import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' })

// POST /api/webhooks/paystack
export async function POST(req: NextRequest, { params }: { params: { provider: string } }) {
  const { provider } = params
  const supabase = createClient()

  try {
    if (provider === 'paystack') {
      const body = await req.text()
      const hash = crypto.createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET!)
        .update(body).digest('hex')

      if (hash !== req.headers.get('x-paystack-signature')) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }

      const event = JSON.parse(body)

      if (event.event === 'charge.success') {
        const { reference, metadata } = event.data
        const { order_id } = metadata

        // Mark payment as held (in escrow)
        await supabase.from('payments').update({
          status: 'held',
          paid_at: new Date().toISOString(),
        }).eq('provider_reference', reference)

        // Activate order
        await supabase.from('orders').update({ status: 'active' }).eq('id', order_id)

        // Notify seller via system message
        const { data: conv } = await supabase.from('conversations').select('id').eq('order_id', order_id).single()
        if (conv) {
          await supabase.from('messages').insert({
            conversation_id: conv.id,
            is_system_message: true,
            content: 'Payment confirmed. Order is now active. Please begin working on the project.',
            message_type: 'system',
          })
        }
      }

      if (event.event === 'charge.failed') {
        const { reference } = event.data
        await supabase.from('payments').update({ status: 'failed' }).eq('provider_reference', reference)
      }

      return NextResponse.json({ status: 'ok' })
    }

    if (provider === 'stripe') {
      const body = await req.text()
      const sig = req.headers.get('stripe-signature')!

      let event: Stripe.Event
      try {
        event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
      } catch {
        return NextResponse.json({ error: 'Invalid stripe signature' }, { status: 401 })
      }

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.CheckoutSession
        const { order_id } = session.metadata || {}

        if (order_id) {
          await supabase.from('payments').update({
            status: 'held',
            paid_at: new Date().toISOString(),
          }).eq('provider_reference', session.id)

          await supabase.from('orders').update({ status: 'active' }).eq('id', order_id)

          const { data: conv } = await supabase.from('conversations').select('id').eq('order_id', order_id).single()
          if (conv) {
            await supabase.from('messages').insert({
              conversation_id: conv.id,
              is_system_message: true,
              content: 'Payment confirmed. Order is now active.',
              message_type: 'system',
            })
          }
        }
      }

      return NextResponse.json({ status: 'ok' })
    }

    return NextResponse.json({ error: 'Unknown provider' }, { status: 400 })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
