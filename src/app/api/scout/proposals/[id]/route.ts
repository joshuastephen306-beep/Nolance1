import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { authenticate } from '@/lib/auth/middleware'

// GET /api/scout/proposals/[id]
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await authenticate(req)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createClient()

    const { data: proposal, error } = await supabase
      .from('scout_proposals')
      .select(`
        *,
        seller:users!seller_id(
          id, username, display_name, profile_photo_url, country, bio,
          seller_profile:seller_profiles(level, average_rating, total_reviews, completion_rate, on_time_delivery_rate, total_orders_completed)
        ),
        job:scout_jobs(
          id, title, description, budget_type, budget_min, budget_max,
          deadline, status, buyer_id,
          buyer:users!buyer_id(id, username, display_name, profile_photo_url)
        )
      `)
      .eq('id', params.id)
      .single()

    if (error || !proposal) return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })

    const job = (proposal as any).job
    const isSeller = proposal.seller_id === auth.userId
    const isBuyer = job?.buyer_id === auth.userId

    if (!isSeller && !isBuyer && auth.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json({ data: proposal, error: null })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch proposal' }, { status: 500 })
  }
}

// PATCH /api/scout/proposals/[id] — accept, decline, withdraw
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await authenticate(req)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createClient()
    const { action } = await req.json()

    const { data: proposal } = await supabase
      .from('scout_proposals')
      .select('*, job:scout_jobs(buyer_id, title)')
      .eq('id', params.id)
      .single()

    if (!proposal) return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })

    const job = (proposal as any).job
    const isBuyer = job?.buyer_id === auth.userId
    const isSeller = proposal.seller_id === auth.userId

    if (action === 'accept') {
      if (!isBuyer) return NextResponse.json({ error: 'Only the buyer can accept proposals' }, { status: 403 })
      if (proposal.status !== 'pending') return NextResponse.json({ error: 'Proposal is no longer pending' }, { status: 400 })

      await supabase.from('scout_proposals').update({ status: 'accepted' }).eq('id', params.id)

      // Decline all other proposals for this job
      await supabase.from('scout_proposals')
        .update({ status: 'declined' })
        .eq('job_id', proposal.job_id)
        .neq('id', params.id)
        .eq('status', 'pending')

      // Update job status
      await supabase.from('scout_jobs').update({ status: 'in_progress' }).eq('id', proposal.job_id)

      // Create conversation between buyer and seller
      const { data: conv } = await supabase.from('conversations').insert({
        scout_job_id: proposal.job_id,
        section: 'scout',
      }).select().single()

      if (conv) {
        await supabase.from('conversation_participants').insert([
          { conversation_id: conv.id, user_id: auth.userId },
          { conversation_id: conv.id, user_id: proposal.seller_id },
        ])
        await supabase.from('messages').insert({
          conversation_id: conv.id,
          is_system_message: true,
          content: `Proposal accepted for "${job?.title}". You can now discuss the project details here.`,
          message_type: 'system',
        })
      }

      // Notify seller
      await supabase.from('notifications').insert({
        user_id: proposal.seller_id,
        type: 'scout',
        title: 'Your proposal was accepted! 🎉',
        body: `Your proposal for "${job?.title}" has been accepted. Message the buyer to get started.`,
        data: { proposal_id: params.id, job_id: proposal.job_id, conversation_id: conv?.id },
      })

      return NextResponse.json({ data: { message: 'Proposal accepted', conversation_id: conv?.id }, error: null })
    }

    if (action === 'decline') {
      if (!isBuyer) return NextResponse.json({ error: 'Only the buyer can decline proposals' }, { status: 403 })
      if (proposal.status !== 'pending') return NextResponse.json({ error: 'Proposal is no longer pending' }, { status: 400 })
      await supabase.from('scout_proposals').update({ status: 'declined' }).eq('id', params.id)
      await supabase.from('notifications').insert({
        user_id: proposal.seller_id,
        type: 'scout',
        title: 'Proposal not selected',
        body: `Your proposal for "${job?.title}" was not selected this time. Keep applying!`,
        data: { proposal_id: params.id },
      })
      return NextResponse.json({ data: { message: 'Proposal declined' }, error: null })
    }

    if (action === 'withdraw') {
      if (!isSeller) return NextResponse.json({ error: 'Only the seller can withdraw their proposal' }, { status: 403 })
      if (!['pending'].includes(proposal.status)) return NextResponse.json({ error: 'Can only withdraw pending proposals' }, { status: 400 })
      await supabase.from('scout_proposals').update({ status: 'withdrawn' }).eq('id', params.id)
      // Decrement proposal count
      await supabase.from('scout_jobs')
        .update({ proposal_count: Math.max(0, -1) })
        .eq('id', proposal.job_id)
      return NextResponse.json({ data: { message: 'Proposal withdrawn' }, error: null })
    }

    return NextResponse.json({ error: 'Invalid action. Must be accept, decline, or withdraw.' }, { status: 400 })
  } catch (error) {
    console.error('PATCH /api/scout/proposals/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update proposal' }, { status: 500 })
  }
}
