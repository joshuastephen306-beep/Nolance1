import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/middleware'
import { sendProposalReceivedEmail } from '@/lib/email'

// GET /api/scout/jobs — browse jobs
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(req.url)
    const page = Number(searchParams.get('page') || 1)
    const limit = Number(searchParams.get('limit') || 20)
    const offset = (page - 1) * limit
    const community_id = searchParams.get('community_id')
    const category_id = searchParams.get('category_id')
    const budget_type = searchParams.get('budget_type')
    const q = searchParams.get('q')

    let query = supabase.from('scout_jobs').select(`
      *,
      buyer:users!buyer_id(id,username,display_name,profile_photo_url,country,
        seller_profile:seller_profiles(average_rating,total_reviews)),
      category:categories!category_id(id,name,slug)
    `, { count: 'exact' })
      .eq('status', 'open')
      .eq('visibility', 'public')
      .gt('expires_at', new Date().toISOString())

    if (community_id) query = query.eq('community_id', community_id)
    if (category_id) query = query.eq('category_id', category_id)
    if (budget_type) query = query.eq('budget_type', budget_type)
    if (q) query = query.ilike('title', `%${q}%`)

    const { data: jobs, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    return NextResponse.json({ data: jobs, total: count, page, limit, has_more: (count || 0) > offset + limit, error: null })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }
}

// POST /api/scout/jobs — post a job
export const POST = requireAuth(async (req: NextRequest, auth) => {
  try {
    const supabase = createClient()

    // Check Scout access
    const { data: reg } = await supabase.from('section_registrations')
      .select('id').eq('user_id', auth.userId).eq('section', 'scout').single()
    if (!reg) return NextResponse.json({ error: 'Scout access required. Register for Scout in your settings.' }, { status: 403 })

    const body = await req.json()
    const {
      title, description, category_id, required_skills, budget_type,
      budget_min, budget_max, duration, deadline, visibility,
      min_seller_level, attachments, community_id,
    } = body

    if (!title || title.length < 10) return NextResponse.json({ error: 'Job title must be at least 10 characters' }, { status: 400 })
    if (!description || description.length < 50) return NextResponse.json({ error: 'Description must be at least 50 characters' }, { status: 400 })
    if (!budget_type) return NextResponse.json({ error: 'Budget type is required' }, { status: 400 })

    const { data: job, error } = await supabase.from('scout_jobs').insert({
      buyer_id: auth.userId,
      title: title.trim(),
      description: description.trim(),
      category_id: category_id || null,
      required_skills: required_skills || [],
      budget_type,
      budget_min: budget_min || null,
      budget_max: budget_max || null,
      duration: duration || null,
      deadline: deadline || null,
      visibility: visibility || 'public',
      min_seller_level: min_seller_level || 'new',
      attachments: attachments || [],
      community_id: community_id || null,
      status: 'open',
    }).select().single()

    if (error) throw error

    // If posted in a community, notify community members (AI matching)
    if (community_id) {
      // In production: trigger AI to notify matching sellers
    }

    return NextResponse.json({ data: { job, message: 'Job posted successfully' }, error: null }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to post job' }, { status: 500 })
  }
})
