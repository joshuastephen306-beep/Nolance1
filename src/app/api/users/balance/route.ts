import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/middleware'

// GET /api/users/balance
export const GET = requireAuth(async (req: NextRequest, auth) => {
  try {
    const supabase = createClient()
    const { data } = await supabase.from('balances').select('*').eq('user_id', auth.userId).single()
    return NextResponse.json({ data: data || { available: 0, pending_clearance: 0, total_earned: 0, total_withdrawn: 0 }, error: null })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 })
  }
})
