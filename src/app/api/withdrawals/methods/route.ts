import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/middleware'

// POST /api/withdrawals/methods — add new withdrawal method
export const POST = requireAuth(async (req: NextRequest, auth) => {
  try {
    const supabase = createClient()
    const { type, label, details } = await req.json()

    if (!type || !details) {
      return NextResponse.json({ error: 'Method type and details are required' }, { status: 400 })
    }

    // Check method limit (max 5)
    const { count } = await supabase.from('withdrawal_methods')
      .select('id', { count: 'exact' }).eq('user_id', auth.userId)
    if ((count || 0) >= 5) {
      return NextResponse.json({ error: 'Maximum 5 withdrawal methods allowed' }, { status: 400 })
    }

    // Check if first method (make it default)
    const isFirst = (count || 0) === 0

    const { data: method } = await supabase.from('withdrawal_methods').insert({
      user_id: auth.userId,
      type, label: label || type,
      details, // In production: encrypt sensitive data
      is_verified: false, // Requires review
      is_default: isFirst,
    }).select().single()

    // Notify admin for verification
    await supabase.from('notifications').insert({
      user_id: auth.userId,
      type: 'system',
      title: 'Withdrawal method added',
      body: 'Your withdrawal method is pending verification. This usually takes up to 24 hours.',
      data: { method_id: method?.id },
    })

    return NextResponse.json({
      data: { method, message: 'Method added. Verification pending within 24 hours.' },
      error: null,
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add withdrawal method' }, { status: 500 })
  }
})

// GET /api/withdrawals/methods
export const GET = requireAuth(async (req: NextRequest, auth) => {
  try {
    const supabase = createClient()
    const { data: methods } = await supabase.from('withdrawal_methods')
      .select('*').eq('user_id', auth.userId).order('created_at')
    return NextResponse.json({ data: methods, error: null })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch methods' }, { status: 500 })
  }
})

// DELETE /api/withdrawals/methods/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { requireAuth: ra } = await import('@/lib/auth/middleware')
  const supabase = createClient()
  const { authenticate } = await import('@/lib/auth/middleware')
  const auth = await authenticate(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await supabase.from('withdrawal_methods').delete().eq('id', params.id).eq('user_id', auth.userId)
  return NextResponse.json({ data: { message: 'Method removed' }, error: null })
}
