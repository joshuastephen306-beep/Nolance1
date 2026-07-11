import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { code, token } = await req.json()

    if (!code && !token) {
      return NextResponse.json({ error: 'Verification code or token is required' }, { status: 400 })
    }

    const supabase = createClient()

    // ── FIND VERIFICATION ─────────────────────────────────────
    const query = supabase
      .from('email_verifications')
      .select('*')
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())

    const { data: verification, error } = token
      ? await query.eq('token', token).single()
      : await query.eq('code', code).single()

    if (error || !verification) {
      return NextResponse.json({ error: 'Invalid or expired verification code. Please request a new one.' }, { status: 400 })
    }

    // ── MARK USED ─────────────────────────────────────────────
    await supabase.from('email_verifications').update({ used: true }).eq('id', verification.id)

    // ── ACTIVATE USER ─────────────────────────────────────────
    await supabase.from('users').update({
      email_verified: true,
      status: 'active',
    }).eq('id', verification.user_id)

    return NextResponse.json({ data: { message: 'Email verified successfully. You can now log in.' }, error: null })

  } catch (error) {
    console.error('Verify email error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Resend verification
export async function PUT(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })

    const supabase = createClient()
    const { data: user } = await supabase.from('users').select('id,username,email_verified').eq('email', email.toLowerCase()).single()

    if (!user) return NextResponse.json({ error: 'No account found with this email' }, { status: 404 })
    if (user.email_verified) return NextResponse.json({ error: 'Email is already verified' }, { status: 400 })

    // Invalidate old codes
    await supabase.from('email_verifications').update({ used: true }).eq('user_id', user.id)

    // Create new code
    const { v4: uuidv4 } = await import('uuid')
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const token = uuidv4()
    await supabase.from('email_verifications').insert({
      user_id: user.id, code, token,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    })

    const { sendEmailVerification } = await import('@/lib/email')
    await sendEmailVerification(email, user.username, code, token)

    return NextResponse.json({ data: { message: 'Verification email sent. Check your inbox.' }, error: null })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
