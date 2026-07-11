import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/middleware'
import { sendWithdrawalSuccessEmail, sendWithdrawalFlaggedEmail, sendFundsClearedEmail } from '@/lib/email'
import { formatCurrency } from '@/utils'

// GET /api/withdrawals — get withdrawal history + balance
export const GET = requireAuth(async (req: NextRequest, auth) => {
  try {
    const supabase = createClient()
    const page = Number(new URL(req.url).searchParams.get('page') || 1)
    const limit = 20
    const offset = (page - 1) * limit

    const [balanceRes, withdrawalsRes, earningsRes] = await Promise.all([
      supabase.from('balances').select('*').eq('user_id', auth.userId).single(),
      supabase.from('withdrawals').select('*, method:withdrawal_methods(*)', { count: 'exact' })
        .eq('user_id', auth.userId).order('created_at', { ascending: false }).range(offset, offset + limit - 1),
      supabase.from('earnings').select('*').eq('seller_id', auth.userId)
        .eq('clearance_status', 'pending').order('clears_at'),
    ])

    return NextResponse.json({
      data: {
        balance: balanceRes.data,
        withdrawals: withdrawalsRes.data,
        pending_earnings: earningsRes.data,
        total_withdrawals: withdrawalsRes.count,
      },
      error: null,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch withdrawal data' }, { status: 500 })
  }
})

// POST /api/withdrawals — request withdrawal
export const POST = requireAuth(async (req: NextRequest, auth) => {
  try {
    const supabase = createClient()
    const { amount, method_id, target_currency } = await req.json()

    if (!amount || amount < 5) {
      return NextResponse.json({ error: 'Minimum withdrawal is $5' }, { status: 400 })
    }
    if (!method_id) {
      return NextResponse.json({ error: 'Withdrawal method is required' }, { status: 400 })
    }

    // Check balance
    const { data: balance } = await supabase.from('balances').select('available').eq('user_id', auth.userId).single()
    if (!balance || balance.available < amount) {
      return NextResponse.json({ error: 'Insufficient available balance' }, { status: 400 })
    }

    // Check one withdrawal per 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: recentWithdrawal } = await supabase.from('withdrawals')
      .select('id').eq('user_id', auth.userId)
      .in('status', ['pending', 'processing', 'completed'])
      .gt('created_at', yesterday).single()

    if (recentWithdrawal) {
      return NextResponse.json({ error: 'Only one withdrawal request is allowed per 24 hours' }, { status: 400 })
    }

    // Get withdrawal method
    const { data: method } = await supabase.from('withdrawal_methods')
      .select('*').eq('id', method_id).eq('user_id', auth.userId).single()
    if (!method) return NextResponse.json({ error: 'Withdrawal method not found' }, { status: 404 })
    if (!method.is_verified) return NextResponse.json({ error: 'This withdrawal method is not verified yet' }, { status: 400 })

    // Get conversion rate if needed
    let conversionRate = 1
    let convertedAmount = amount
    if (target_currency && target_currency !== 'USD') {
      // In production: fetch live rate from currency API
      const rates: Record<string, number> = {
        NGN: 1580, GBP: 0.79, EUR: 0.92, CAD: 1.36, AUD: 1.53,
      }
      conversionRate = rates[target_currency] || 1
      convertedAmount = parseFloat((amount * conversionRate).toFixed(2))
    }

    // Fraud detection — flag suspicious withdrawals
    const isSuspicious = await detectSuspiciousWithdrawal(supabase, auth.userId, amount)

    // Create withdrawal
    const { data: withdrawal } = await supabase.from('withdrawals').insert({
      user_id: auth.userId,
      method_id,
      amount,
      currency: 'USD',
      target_currency: target_currency || 'USD',
      conversion_rate: conversionRate,
      converted_amount: convertedAmount,
      status: isSuspicious ? 'flagged' : 'pending',
      flagged_reason: isSuspicious ? 'Withdrawal pattern requires review' : null,
    }).select().single()

    if (!withdrawal) throw new Error('Failed to create withdrawal')

    // Deduct from available balance
    await supabase.from('balances').update({
      available: balance.available - amount,
      total_withdrawn: supabase.rpc('add_amount', { amt: amount }) as any,
    }).eq('user_id', auth.userId)

    // Get user email
    const { data: user } = await supabase.from('users').select('email,username').eq('id', auth.userId).single()

    if (isSuspicious) {
      if (user) await sendWithdrawalFlaggedEmail(user.email, user.username, amount, 'Unusual withdrawal pattern detected')
      return NextResponse.json({
        data: { message: 'Withdrawal placed under review. Our team will process it within 2 business days.', status: 'flagged' },
        error: null,
      })
    }

    // Process withdrawal (in production: call payment provider API)
    await processWithdrawal(supabase, withdrawal, method, user)

    return NextResponse.json({
      data: {
        message: `Withdrawal of ${formatCurrency(amount)} initiated successfully.`,
        converted_amount: convertedAmount,
        target_currency,
        withdrawal_id: withdrawal.id,
        status: 'processing',
      },
      error: null,
    })
  } catch (error) {
    console.error('Withdrawal error:', error)
    return NextResponse.json({ error: 'Withdrawal failed' }, { status: 500 })
  }
})

// ── HELPERS ───────────────────────────────────────────────────

async function detectSuspiciousWithdrawal(supabase: any, userId: string, amount: number): Promise<boolean> {
  // Check for suspicious patterns
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { data: history } = await supabase.from('withdrawals')
    .select('amount,created_at').eq('user_id', userId).gt('created_at', thirtyDaysAgo)

  // First ever withdrawal of large amount
  if (!history || history.length === 0 && amount > 500) return true

  // Withdrawal much larger than average
  if (history && history.length > 0) {
    const avg = history.reduce((sum: number, w: any) => sum + w.amount, 0) / history.length
    if (amount > avg * 5 && amount > 200) return true
  }

  return false
}

async function processWithdrawal(supabase: any, withdrawal: any, method: any, user: any) {
  // In production: integrate with actual payment APIs
  // Paystack transfer API, Flutterwave transfer, Wise API, etc.

  // Update to processing
  await supabase.from('withdrawals').update({ status: 'processing' }).eq('id', withdrawal.id)

  // Simulate processing (in production: async webhook confirms completion)
  setTimeout(async () => {
    await supabase.from('withdrawals').update({
      status: 'completed',
      processed_at: new Date().toISOString(),
    }).eq('id', withdrawal.id)

    if (user) {
      await sendWithdrawalSuccessEmail(user.email, user.username, withdrawal.amount, method.label || method.type)
    }
  }, 1000)
}
