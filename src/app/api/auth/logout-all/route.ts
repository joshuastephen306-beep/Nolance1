import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/middleware'

// POST /api/auth/logout-all — sign out all devices
export const POST = requireAuth(async (req: NextRequest, auth) => {
  try {
    const supabase = createClient()

    // Deactivate all sessions for this user
    await supabase
      .from('login_sessions')
      .update({ is_active: false })
      .eq('user_id', auth.userId)

    // Update online status
    await supabase
      .from('users')
      .update({ is_online: false, last_seen: new Date().toISOString() })
      .eq('id', auth.userId)

    return NextResponse.json({
      data: { message: 'Signed out of all devices successfully' },
      error: null,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to sign out all devices' }, { status: 500 })
  }
})
