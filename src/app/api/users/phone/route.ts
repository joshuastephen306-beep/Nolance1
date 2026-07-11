import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/middleware'
import { sendPhoneAddedEmail } from '@/lib/email'
import { isValidPhone } from '@/utils'

// POST /api/users/phone — send verification code
export const POST = requireAuth(async (req: NextRequest, auth) => {
  try {
    const supabase = createClient()
    const { phone } = await req.json()

    if (!phone) return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    if (!isValidPhone(phone)) return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 })

    // Check daily attempt limit (5 per 24 hours)
    const { data: user } = await supabase.from('users').select('phone_attempts_today,phone_last_attempt,email,username').eq('id', auth.userId).single()
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const lastAttempt = user.phone_last_attempt ? new Date(user.phone_last_attempt) : null
    const isNewDay = !lastAttempt || (Date.now() - lastAttempt.getTime() > 24 * 60 * 60 * 1000)
    const attempts = isNewDay ? 0 : (user.phone_attempts_today || 0)

    if (attempts >= 5) {
      return NextResponse.json({
        error: 'You have reached the maximum of 5 phone verification attempts per 24 hours. Please try again later.'
      }, { status: 429 })
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    // Store verification
    await supabase.from('phone_verifications').insert({
      user_id: auth.userId, phone, code, expires_at,
    })

    // Update attempt count
    await supabase.from('users').update({
      phone_attempts_today: isNewDay ? 1 : attempts + 1,
      phone_last_attempt: new Date().toISOString(),
    }).eq('id', auth.userId)

    // Send SMS via Twilio
    try {
      const twilio = await import('twilio')
      const client = twilio.default(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
      await client.messages.create({
        body: `Your Nolance verification code is: ${code}. It expires in 10 minutes. Do not share this code with anyone.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone,
      })
    } catch (smsError) {
      console.error('SMS send error:', smsError)
      // In production: handle SMS failure gracefully
    }

    return NextResponse.json({
      data: { message: 'Verification code sent to your phone number' },
      error: null,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send verification code' }, { status: 500 })
  }
})

// PUT /api/users/phone — verify phone code
export const PUT = requireAuth(async (req: NextRequest, auth) => {
  try {
    const supabase = createClient()
    const { phone, code } = await req.json()

    if (!phone || !code) return NextResponse.json({ error: 'Phone and code are required' }, { status: 400 })

    const { data: verification } = await supabase.from('phone_verifications')
      .select('*').eq('user_id', auth.userId).eq('phone', phone).eq('code', code)
      .eq('used', false).gt('expires_at', new Date().toISOString()).single()

    if (!verification) {
      return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 })
    }

    // Mark used and update user
    await supabase.from('phone_verifications').update({ used: true }).eq('id', verification.id)
    await supabase.from('users').update({ phone, phone_verified: true }).eq('id', auth.userId)

    // Send security email (show full phone number as per blueprint)
    const { data: user } = await supabase.from('users').select('email,username').eq('id', auth.userId).single()
    if (user) await sendPhoneAddedEmail(user.email, user.username, phone)

    return NextResponse.json({ data: { message: 'Phone number verified successfully' }, error: null })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to verify phone number' }, { status: 500 })
  }
})
