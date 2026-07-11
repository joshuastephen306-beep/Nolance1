import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendPasswordReset } from '@/lib/email'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

// POST /api/auth/forgot-password — request reset
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })

    const supabase = createClient()
    const { data: user } = await supabase.from('users').select('id,username').eq('email', email.toLowerCase()).single()

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ data: { message: 'If an account exists with this email, a reset link has been sent.' }, error: null })
    }

    // Invalidate old tokens
    await supabase.from('password_resets').update({ used: true }).eq('user_id', user.id)

    // Create new token
    const token = uuidv4()
    await supabase.from('password_resets').insert({
      user_id: user.id, token,
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    })

    await sendPasswordReset(email, user.username, token)

    return NextResponse.json({ data: { message: 'If an account exists with this email, a reset link has been sent.' }, error: null })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/auth/forgot-password — set new password
export async function PUT(req: NextRequest) {
  try {
    const { token, password } = await req.json()
    if (!token || !password) return NextResponse.json({ error: 'Token and password are required' }, { status: 400 })
    if (password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })

    const supabase = createClient()
    const { data: reset } = await supabase.from('password_resets')
      .select('*').eq('token', token).eq('used', false)
      .gt('expires_at', new Date().toISOString()).single()

    if (!reset) return NextResponse.json({ error: 'Invalid or expired reset link. Please request a new one.' }, { status: 400 })

    const password_hash = await bcrypt.hash(password, 12)
    await supabase.from('users').update({ password_hash }).eq('id', reset.user_id)
    await supabase.from('password_resets').update({ used: true }).eq('id', reset.id)
    // Invalidate all sessions
    await supabase.from('login_sessions').update({ is_active: false }).eq('user_id', reset.user_id)

    return NextResponse.json({ data: { message: 'Password reset successfully. You can now log in with your new password.' }, error: null })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
