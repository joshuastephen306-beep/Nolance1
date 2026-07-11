import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/middleware'

// GET /api/users/notification-preferences
export const GET = requireAuth(async (req: NextRequest, auth) => {
  try {
    const supabase = createClient()
    const { data } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', auth.userId)
      .single()

    // Return defaults if not set yet
    const defaults = {
      email_orders: true, email_messages: true, email_reviews: true,
      email_payments: true, email_security: true, email_marketing: false,
      push_orders: true, push_messages: true, push_reviews: false,
      sms_orders: false, sms_security: true,
    }

    return NextResponse.json({ data: data || defaults, error: null })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 })
  }
})

// PATCH /api/users/notification-preferences
export const PATCH = requireAuth(async (req: NextRequest, auth) => {
  try {
    const supabase = createClient()
    const body = await req.json()

    // Remove email_security from editable fields (always true)
    delete body.email_security

    // Upsert preferences
    await supabase
      .from('notification_preferences')
      .upsert({
        user_id: auth.userId,
        ...body,
        email_security: true, // always on
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })

    return NextResponse.json({ data: { message: 'Preferences updated' }, error: null })
  } catch {
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 })
  }
})
