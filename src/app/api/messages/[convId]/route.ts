import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { authenticate } from '@/lib/auth/middleware'

// GET /api/messages/[convId] — get messages in a conversation
export async function GET(req: NextRequest, { params }: { params: { convId: string } }) {
  try {
    const auth = await authenticate(req)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createClient()

    // Verify participation
    const { data: participation } = await supabase
      .from('conversation_participants').select('id')
      .eq('conversation_id', params.convId).eq('user_id', auth.userId).single()
    if (!participation) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

    const { data: messages } = await supabase
      .from('messages')
      .select(`*, sender:users!sender_id(id,username,display_name,profile_photo_url)`)
      .eq('conversation_id', params.convId)
      .order('created_at', { ascending: true })
      .limit(100)

    return NextResponse.json({ data: messages, error: null })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

// PATCH /api/messages/[convId]/read — mark as read
export async function PATCH(req: NextRequest, { params }: { params: { convId: string } }) {
  try {
    const auth = await authenticate(req)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createClient()
    await supabase.from('conversation_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('conversation_id', params.convId).eq('user_id', auth.userId)

    return NextResponse.json({ data: { message: 'Marked as read' }, error: null })
  } catch {
    return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 })
  }
}
