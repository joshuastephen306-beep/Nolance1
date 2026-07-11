import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/middleware'

// GET /api/notifications
export const GET = requireAuth(async (req: NextRequest, auth) => {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(req.url)
    const page = Number(searchParams.get('page') || 1)
    const limit = 30
    const offset = (page - 1) * limit
    const unread_only = searchParams.get('unread') === 'true'

    let query = supabase.from('notifications').select('*', { count: 'exact' })
      .eq('user_id', auth.userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (unread_only) query = query.eq('is_read', false)

    const { data: notifications, count } = await query

    // Get unread count
    const { count: unreadCount } = await supabase.from('notifications')
      .select('id', { count: 'exact' }).eq('user_id', auth.userId).eq('is_read', false)

    return NextResponse.json({
      data: notifications,
      total: count,
      unread_count: unreadCount || 0,
      page, limit,
      has_more: (count || 0) > offset + limit,
      error: null,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
})

// PATCH /api/notifications — mark as read
export const PATCH = requireAuth(async (req: NextRequest, auth) => {
  try {
    const supabase = createClient()
    const { notification_ids, mark_all } = await req.json()

    if (mark_all) {
      await supabase.from('notifications').update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', auth.userId).eq('is_read', false)
    } else if (notification_ids && notification_ids.length > 0) {
      await supabase.from('notifications').update({ is_read: true, read_at: new Date().toISOString() })
        .in('id', notification_ids).eq('user_id', auth.userId)
    }

    return NextResponse.json({ data: { message: 'Notifications marked as read' }, error: null })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 })
  }
})
