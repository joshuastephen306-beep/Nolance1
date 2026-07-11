import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWelcomeEmail, sendEmailVerification } from '@/lib/email'
import { isValidEmail, isValidUsername, slugify } from '@/utils'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { SignupPayload } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const body: SignupPayload = await req.json()
    const { email, username, password, role, country } = body

    // ── VALIDATION ──────────────────────────────────────────
    if (!email || !username || !password || !role) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }
    if (!isValidUsername(username)) {
      return NextResponse.json({ error: 'Username must be 3-50 characters and can only contain letters, numbers, and underscores' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const supabase = createClient()

    // ── CHECK EMAIL EXISTS ───────────────────────────────────
    const { data: existingEmail } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (existingEmail) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
    }

    // ── CHECK USERNAME EXISTS ────────────────────────────────
    const { data: existingUsername } = await supabase
      .from('users')
      .select('id')
      .eq('username', username.toLowerCase())
      .single()

    if (existingUsername) {
      return NextResponse.json({ error: 'This username is already taken' }, { status: 409 })
    }

    // ── HASH PASSWORD ────────────────────────────────────────
    const password_hash = await bcrypt.hash(password, 12)

    // ── CREATE USER ──────────────────────────────────────────
    const userId = uuidv4()
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        display_name: username,
        password_hash,
        role,
        status: 'pending',
        email_verified: false,
        country: country || null,
      })
      .select()
      .single()

    if (userError || !user) {
      console.error('User creation error:', userError)
      return NextResponse.json({ error: 'Failed to create account. Please try again.' }, { status: 500 })
    }

    // ── CREATE SELLER PROFILE IF SELLER ─────────────────────
    if (role === 'seller' || role === 'both') {
      await supabase.from('seller_profiles').insert({ user_id: userId })
    }

    // ── CREATE BALANCE RECORD ────────────────────────────────
    await supabase.from('balances').insert({ user_id: userId })

    // ── REGISTER FOR GIGS SECTION BY DEFAULT ─────────────────
    await supabase.from('section_registrations').insert({
      user_id: userId,
      section: 'gigs',
      terms_agreed: true,
      terms_agreed_at: new Date().toISOString(),
    })

    // ── CREATE EMAIL VERIFICATION ────────────────────────────
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const token = uuidv4()
    const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    await supabase.from('email_verifications').insert({
      user_id: userId,
      code,
      token,
      expires_at,
    })

    // ── SEND EMAILS ──────────────────────────────────────────
    await sendEmailVerification(email, username, code, token)
    await sendWelcomeEmail(email, username)

    return NextResponse.json({
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          status: user.status,
          email_verified: user.email_verified,
        },
        message: 'Account created successfully. Please check your email to verify your account.',
      },
      error: null,
    }, { status: 201 })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
