import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendNewLoginEmail } from '@/lib/email'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { LoginPayload } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const body: LoginPayload = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const supabase = createClient()

    // ── FIND USER ────────────────────────────────────────────
    const { data: user, error } = await supabase
      .from('users')
      .select('*, seller_profile:seller_profiles(*)')
      .eq('email', email.toLowerCase())
      .single()

    if (error || !user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // ── CHECK STATUS ─────────────────────────────────────────
    if (user.status === 'banned') {
      return NextResponse.json({ error: 'This account has been permanently suspended' }, { status: 403 })
    }
    if (user.status === 'suspended') {
      return NextResponse.json({ error: 'This account is currently suspended. Please check your email for details.' }, { status: 403 })
    }

    // ── VERIFY PASSWORD ──────────────────────────────────────
    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) {
      // Log failed attempt
      await supabase.from('login_history').insert({
        user_id: user.id,
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        device_info: req.headers.get('user-agent') || 'unknown',
        success: false,
      })
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // ── CHECK EMAIL VERIFIED ─────────────────────────────────
    if (!user.email_verified) {
      return NextResponse.json({
        error: 'Please verify your email address before logging in. Check your inbox for the verification email.',
        code: 'EMAIL_NOT_VERIFIED',
      }, { status: 403 })
    }

    // ── GENERATE TOKENS ──────────────────────────────────────
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: '30d' }
    )

    // ── CREATE SESSION ────────────────────────────────────────
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    const device = req.headers.get('user-agent') || 'unknown'

    await supabase.from('login_sessions').insert({
      user_id: user.id,
      token,
      device_info: device,
      ip_address: ip,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    })

    // ── LOG SUCCESS ───────────────────────────────────────────
    await supabase.from('login_history').insert({
      user_id: user.id,
      ip_address: ip,
      device_info: device,
      success: true,
    })

    // ── UPDATE ONLINE STATUS ──────────────────────────────────
    await supabase.from('users').update({
      is_online: true,
      last_seen: new Date().toISOString(),
    }).eq('id', user.id)

    // ── SEND LOGIN NOTIFICATION ───────────────────────────────
    await sendNewLoginEmail(user.email, user.username, device.substring(0, 60), ip)

    // ── RETURN RESPONSE ───────────────────────────────────────
    const { password_hash, ...safeUser } = user

    return NextResponse.json({
      data: { user: safeUser, token, refresh_token: refreshToken },
      error: null,
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
