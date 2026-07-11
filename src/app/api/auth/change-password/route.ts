import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/middleware'
import bcrypt from 'bcryptjs'

// POST /api/auth/change-password
export const POST = requireAuth(async (req: NextRequest, auth) => {
  try {
    const supabase = createClient()
    const { current_password, new_password } = await req.json()

    if (!current_password || !new_password) {
      return NextResponse.json({ error: 'Current and new password are required' }, { status: 400 })
    }
    if (new_password.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 })
    }
    if (!/[A-Z]/.test(new_password)) {
      return NextResponse.json({ error: 'New password must contain at least one uppercase letter' }, { status: 400 })
    }
    if (!/[0-9]/.test(new_password)) {
      return NextResponse.json({ error: 'New password must contain at least one number' }, { status: 400 })
    }
    if (current_password === new_password) {
      return NextResponse.json({ error: 'New password must be different from your current password' }, { status: 400 })
    }

    // Get current password hash
    const { data: user } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', auth.userId)
      .single()

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Verify current password
    const isValid = await bcrypt.compare(current_password, user.password_hash)
    if (!isValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
    }

    // Hash and save new password
    const newHash = await bcrypt.hash(new_password, 12)
    await supabase.from('users').update({ password_hash: newHash }).eq('id', auth.userId)

    // Invalidate all other sessions (security best practice)
    const authHeader = req.headers.get('authorization')
    const currentToken = authHeader?.split(' ')[1]
    await supabase
      .from('login_sessions')
      .update({ is_active: false })
      .eq('user_id', auth.userId)
      .neq('token', currentToken || '')

    return NextResponse.json({
      data: { message: 'Password changed successfully. Other devices have been signed out.' },
      error: null,
    })
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 })
  }
})
