import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/middleware'
import { sendNewMessageEmail } from '@/lib/email'

// GET /api/messages — get all conversations
export const GET = requireAuth(async (req: NextRequest, auth) => {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(req.url)
    const filter = searchParams.get('filter') || 'all'
    const page = Number(searchParams.get('page') || 1)
    const limit = 30
    const offset = (page - 1) * limit

    // Get conversation IDs for this user
    const { data: participations } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', auth.userId)

    if (!participations || participations.length === 0) {
      return NextResponse.json({ data: [], total: 0, error: null })
    }

    const convIds = participations.map(p => p.conversation_id)

    let query = supabase
      .from('conversations')
      .select(`
        *,
        participants:conversation_participants(
          user_id, last_read_at,
          user:users(id,username,display_name,profile_photo_url,is_online)
        ),
        order:orders(id,order_number,status,title),
        scout_job:scout_jobs(id,title)
      `, { count: 'exact' })
      .in('id', convIds)
      .order('updated_at', { ascending: false })

    const { data: conversations, count } = await query.range(offset, offset + limit - 1)

    // Get last message and unread count for each conversation
    const enriched = await Promise.all((conversations || []).map(async (conv) => {
      const [lastMsgRes, unreadRes, myParticipation] = await Promise.all([
        supabase.from('messages').select('*').eq('conversation_id', conv.id)
          .eq('is_system_message', false).order('created_at', { ascending: false }).limit(1).single(),
        supabase.from('messages').select('id', { count: 'exact' })
          .eq('conversation_id', conv.id).eq('is_system_message', false)
          .neq('sender_id', auth.userId),
        supabase.from('conversation_participants').select('last_read_at')
          .eq('conversation_id', conv.id).eq('user_id', auth.userId).single(),
      ])

      let unreadCount = 0
      if (unreadRes.count && myParticipation.data?.last_read_at) {
        const { count: unread } = await supabase.from('messages').select('id', { count: 'exact' })
          .eq('conversation_id', conv.id).neq('sender_id', auth.userId)
          .gt('created_at', myParticipation.data.last_read_at)
        unreadCount = unread || 0
      }

      const otherParticipants = conv.participants?.filter((p: any) => p.user_id !== auth.userId)

      return {
        ...conv,
        last_message: lastMsgRes.data,
        unread_count: unreadCount,
        other_participants: otherParticipants,
      }
    }))

    return NextResponse.json({ data: enriched, total: count, error: null })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }
})

// POST /api/messages — start new conversation or send message
export const POST = requireAuth(async (req: NextRequest, auth) => {
  try {
    const supabase = createClient()
    const { recipient_id, content, files, conversation_id } = await req.json()

    // ── SEND TO EXISTING CONVERSATION ─────────────────────
    if (conversation_id) {
      // Verify participant
      const { data: participation } = await supabase
        .from('conversation_participants')
        .select('id')
        .eq('conversation_id', conversation_id)
        .eq('user_id', auth.userId)
        .single()

      if (!participation) return NextResponse.json({ error: 'Not a participant in this conversation' }, { status: 403 })

      // AI content moderation check
      const isFlagged = await moderateContent(content)

      const { data: message } = await supabase.from('messages').insert({
        conversation_id,
        sender_id: auth.userId,
        content: content?.trim(),
        files: files || null,
        message_type: 'text',
        is_flagged: isFlagged,
        flag_reason: isFlagged ? 'Off-platform contact detected' : null,
      }).select().single()

      // Update conversation timestamp
      await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversation_id)

      // Notify other participants
      const { data: participants } = await supabase
        .from('conversation_participants')
        .select('user_id, user:users(email,username)')
        .eq('conversation_id', conversation_id)
        .neq('user_id', auth.userId)

      const { data: sender } = await supabase.from('users').select('display_name,username').eq('id', auth.userId).single()
      const senderName = sender?.display_name || sender?.username || 'Someone'

      for (const p of (participants || [])) {
        const user = (p as any).user
        if (user?.email) {
          await sendNewMessageEmail(user.email, user.username, senderName, content || 'Sent a file', conversation_id)
        }
        // Create notification
        await supabase.from('notifications').insert({
          user_id: p.user_id,
          type: 'message',
          title: `New message from ${senderName}`,
          body: content?.substring(0, 100) || 'Sent a file',
          data: { conversation_id },
        })
      }

      if (isFlagged) {
        return NextResponse.json({
          data: { message, warning: 'Your message contains content that may violate our off-platform policy. Please keep all communication on Nolance.' },
          error: null,
        })
      }

      return NextResponse.json({ data: { message }, error: null }, { status: 201 })
    }

    // ── START NEW CONVERSATION ─────────────────────────────
    if (!recipient_id) return NextResponse.json({ error: 'Recipient is required' }, { status: 400 })
    if (recipient_id === auth.userId) return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 })

    // Check recipient exists
    const { data: recipient } = await supabase.from('users').select('id,email,username,status').eq('id', recipient_id).single()
    if (!recipient) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (recipient.status === 'banned' || recipient.status === 'suspended') {
      return NextResponse.json({ error: 'Cannot message this user' }, { status: 400 })
    }

    // Check if conversation already exists between these two users
    const { data: existing } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', auth.userId)

    if (existing && existing.length > 0) {
      const existingIds = existing.map(e => e.conversation_id)
      const { data: shared } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', recipient_id)
        .in('conversation_id', existingIds)

      // Use existing direct conversation
      if (shared && shared.length > 0) {
        const existingConvId = shared[0].conversation_id
        if (content) {
          await supabase.from('messages').insert({
            conversation_id: existingConvId, sender_id: auth.userId,
            content: content.trim(), message_type: 'text',
          })
          await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', existingConvId)
        }
        return NextResponse.json({ data: { conversation_id: existingConvId }, error: null })
      }
    }

    // Create new conversation
    const { data: conv } = await supabase.from('conversations').insert({ section: 'gigs' }).select().single()
    if (!conv) throw new Error('Failed to create conversation')

    await supabase.from('conversation_participants').insert([
      { conversation_id: conv.id, user_id: auth.userId },
      { conversation_id: conv.id, user_id: recipient_id },
    ])

    if (content) {
      const isFlagged = await moderateContent(content)
      await supabase.from('messages').insert({
        conversation_id: conv.id, sender_id: auth.userId,
        content: content.trim(), message_type: 'text', is_flagged: isFlagged,
      })
    }

    return NextResponse.json({ data: { conversation_id: conv.id }, error: null }, { status: 201 })
  } catch (error) {
    console.error('POST /api/messages error:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
})

// ── CONTENT MODERATION ────────────────────────────────────────
async function moderateContent(content: string): Promise<boolean> {
  if (!content) return false

  const offPlatformPatterns = [
    /whatsapp/i, /telegram/i, /discord/i, /\+\d{7,}/, /\d{3}[-.\s]\d{3}[-.\s]\d{4}/,
    /@gmail\.com/i, /@yahoo\.com/i, /@hotmail\.com/i,
    /paypal\.me/i, /cashapp/i, /venmo/i, /bank transfer/i,
    /pay me outside/i, /off platform/i, /contact me directly/i,
  ]

  return offPlatformPatterns.some(pattern => pattern.test(content))
}
