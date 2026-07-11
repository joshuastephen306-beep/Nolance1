import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/middleware'

export const GET = requireAuth(async (req: NextRequest, auth) => {
  try {
    const supabase = createClient()

    const [ordersRes, sellerProfileRes, balanceRes] = await Promise.all([
      supabase.from('orders').select('id,status,seller_earnings,created_at')
        .or(`buyer_id.eq.${auth.userId},seller_id.eq.${auth.userId}`),
      supabase.from('seller_profiles').select('*').eq('user_id', auth.userId).single(),
      supabase.from('balances').select('*').eq('user_id', auth.userId).single(),
    ])

    const orders = ordersRes.data || []
    const sp = sellerProfileRes.data
    const balance = balanceRes.data

    const activeOrders = orders.filter(o => ['active', 'delivered', 'revision'].includes(o.status)).length
    const today = new Date().toISOString().split('T')[0]
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
    const earningsToday = 0 // In production: sum from earnings table
    const earningsMonth = 0

    return NextResponse.json({
      data: {
        active_orders: activeOrders,
        orders_in_queue: activeOrders,
        earnings_today: earningsToday,
        earnings_this_month: earningsMonth,
        pending_clearance: balance?.pending_clearance || 0,
        available_balance: balance?.available || 0,
        completion_rate: sp?.completion_rate || 0,
        response_rate: sp?.response_rate || 0,
        on_time_delivery_rate: sp?.on_time_delivery_rate || 0,
        level: sp?.level || 'new',
        total_reviews: sp?.total_reviews || 0,
        average_rating: sp?.average_rating || 0,
        impressions_this_week: 0,
        clicks_this_week: 0,
      },
      error: null,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
})
