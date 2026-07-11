import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/middleware'
import { sendProposalReceivedEmail } from '@/lib/email'

// GET /api/scout/proposals?job_id=xxx — get proposals for a job
export const GET = requireAuth(async (req: NextRequest, auth) => {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(req.url)
    const job_id = searchParams.get('job_id')
    const my_proposals = searchParams.get('my_proposals') === 'true'

    if (my_proposals) {
      const { data: proposals } = await supabase.from('scout_proposals').select(`
        *, job:scout_jobs(id,title,status,budget_type,budget_min,budget_max,
          buyer:users!buyer_id(id,username,display_name,profile_photo_url))
      `).eq('seller_id', auth.userId).order('created_at', { ascending: false })
      return NextResponse.json({ data: proposals, error: null })
    }

    if (!job_id) return NextResponse.json({ error: 'Job ID required' }, { status: 400 })

    // Verify buyer owns this job
    const { data: job } = await supabase.from('scout_jobs').select('buyer_id').eq('id', job_id).single()
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    if (job.buyer_id !== auth.userId && auth.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { data: proposals } = await supabase.from('scout_proposals').select(`
      *,
      seller:users!seller_id(id,username,display_name,profile_photo_url,country,
        seller_profile:seller_profiles(level,average_rating,total_reviews,completion_rate,on_time_delivery_rate))
    `).eq('job_id', job_id).order('created_at', { ascending: false })

    return NextResponse.json({ data: proposals, error: null })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch proposals' }, { status: 500 })
  }
})

// POST /api/scout/proposals — submit a proposal
export const POST = requireAuth(async (req: NextRequest, auth) => {
  try {
    const supabase = createClient()
    const { job_id, cover_letter, bid_amount, delivery_days, portfolio_samples, questions } = await req.json()

    if (!job_id || !cover_letter || !bid_amount || !delivery_days) {
      return NextResponse.json({ error: 'All required fields must be filled' }, { status: 400 })
    }
    if (cover_letter.length < 100) {
      return NextResponse.json({ error: 'Cover letter must be at least 100 characters' }, { status: 400 })
    }

    // Check Scout access
    const { data: reg } = await supabase.from('section_registrations')
      .select('id').eq('user_id', auth.userId).eq('section', 'scout').single()
    if (!reg) return NextResponse.json({ error: 'Scout access required' }, { status: 403 })

    // Get job
    const { data: job } = await supabase.from('scout_jobs').select('*').eq('id', job_id).eq('status', 'open').single()
    if (!job) return NextResponse.json({ error: 'Job not found or no longer accepting proposals' }, { status: 404 })
    if (job.buyer_id === auth.userId) return NextResponse.json({ error: 'Cannot apply to your own job' }, { status: 400 })

    // Check proposal limit
    const { data: sellerProfile } = await supabase.from('seller_profiles').select('level').eq('user_id', auth.userId).single()
    const proposalLimits: Record<string, number> = { new: 5, level1: 10, level2: 15, top_rated: 999, pro_verified: 999 }
    const limit = proposalLimits[sellerProfile?.level || 'new']

    const { count: activeProposals } = await supabase.from('scout_proposals').select('id', { count: 'exact' })
      .eq('seller_id', auth.userId).in('status', ['pending'])
    if ((activeProposals || 0) >= limit) {
      return NextResponse.json({ error: `You have reached your active proposal limit of ${limit}` }, { status: 400 })
    }

    // Check already applied
    const { data: existing } = await supabase.from('scout_proposals')
      .select('id').eq('job_id', job_id).eq('seller_id', auth.userId).single()
    if (existing) return NextResponse.json({ error: 'You have already submitted a proposal for this job' }, { status: 400 })

    // Check seller level requirement
    const levelOrder = ['new', 'level1', 'level2', 'top_rated', 'pro_verified']
    const sellerLevelIdx = levelOrder.indexOf(sellerProfile?.level || 'new')
    const requiredLevelIdx = levelOrder.indexOf(job.min_seller_level)
    if (sellerLevelIdx < requiredLevelIdx) {
      return NextResponse.json({ error: `This job requires ${job.min_seller_level} level or above` }, { status: 400 })
    }

    // Submit proposal
    const { data: proposal } = await supabase.from('scout_proposals').insert({
      job_id, seller_id: auth.userId,
      cover_letter: cover_letter.trim(),
      bid_amount, delivery_days,
      portfolio_samples: portfolio_samples || [],
      questions: questions || null,
      status: 'pending',
    }).select().single()

    // Update proposal count
    await supabase.from('scout_jobs').update({ proposal_count: job.proposal_count + 1 }).eq('id', job_id)

    // Notify buyer
    const [{ data: buyer }, { data: seller }] = await Promise.all([
      supabase.from('users').select('email,username').eq('id', job.buyer_id).single(),
      supabase.from('users').select('display_name,username').eq('id', auth.userId).single(),
    ])

    if (buyer) {
      await sendProposalReceivedEmail(buyer.email, buyer.username, job.title, seller?.display_name || seller?.username || 'A seller', job_id)
      await supabase.from('notifications').insert({
        user_id: job.buyer_id, type: 'scout',
        title: 'New proposal received',
        body: `${seller?.username} submitted a proposal on "${job.title}"`,
        data: { job_id, proposal_id: proposal.id },
      })
    }

    return NextResponse.json({ data: { proposal, message: 'Proposal submitted successfully' }, error: null }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit proposal' }, { status: 500 })
  }
})
