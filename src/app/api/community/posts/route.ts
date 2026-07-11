import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, authenticate } from '@/lib/auth/middleware'

// GET /api/community/posts?community_id=xxx
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const auth = await authenticate(req)
    const { searchParams } = new URL(req.url)
    const community_id = searchParams.get('community_id')
    const page = Number(searchParams.get('page') || 1)
    const limit = 20
    const offset = (page - 1) * limit

    if (!community_id) return NextResponse.json({ error: 'Community ID required' }, { status: 400 })

    const { data: posts, count } = await supabase.from('community_posts').select(`
      *,
      author:users!author_id(id,username,display_name,profile_photo_url,
        seller_profile:seller_profiles(level)),
      comments:community_comments(
        id, content, created_at,
        author:users!author_id(id,username,display_name,profile_photo_url)
      )
    `, { count: 'exact' })
      .eq('community_id', community_id)
      .eq('is_flagged', false)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Check likes for current user
    let likedPostIds: string[] = []
    if (auth && posts) {
      const postIds = posts.map(p => p.id)
      const { data: likes } = await supabase.from('community_post_likes')
        .select('post_id').eq('user_id', auth.userId).in('post_id', postIds)
      likedPostIds = likes?.map(l => l.post_id) || []
    }

    const enriched = posts?.map(p => ({ ...p, is_liked: likedPostIds.includes(p.id) }))
    return NextResponse.json({ data: enriched, total: count, page, limit, has_more: (count || 0) > offset + limit, error: null })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

// POST /api/community/posts — create post
export const POST = requireAuth(async (req: NextRequest, auth) => {
  try {
    const supabase = createClient()
    const { community_id, content, gig_link, attachments, post_type } = await req.json()

    if (!community_id || !content) return NextResponse.json({ error: 'Community and content are required' }, { status: 400 })
    if (content.length > 2000) return NextResponse.json({ error: 'Post content too long (max 2000 characters)' }, { status: 400 })

    // Check community access
    const { data: reg } = await supabase.from('section_registrations')
      .select('id').eq('user_id', auth.userId).eq('section', 'community').single()
    if (!reg) return NextResponse.json({ error: 'Community access required' }, { status: 403 })

    // Check membership
    const { data: membership } = await supabase.from('community_members')
      .select('id').eq('community_id', community_id).eq('user_id', auth.userId).single()
    if (!membership) return NextResponse.json({ error: 'You must be a member to post' }, { status: 403 })

    // Gig link rate limiting — max 3 per community per week
    if (gig_link) {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      weekStart.setHours(0, 0, 0, 0)

      const { data: gigPostCount } = await supabase.from('gig_post_count')
        .select('count').eq('user_id', auth.userId).eq('community_id', community_id)
        .eq('week_start', weekStart.toISOString().split('T')[0]).single()

      if (gigPostCount && gigPostCount.count >= 3) {
        return NextResponse.json({ error: 'You can only share your gig link 3 times per week in each community' }, { status: 429 })
      }

      // Upsert count
      await supabase.from('gig_post_count').upsert({
        user_id: auth.userId, community_id,
        week_start: weekStart.toISOString().split('T')[0],
        count: (gigPostCount?.count || 0) + 1,
      }, { onConflict: 'user_id,community_id,week_start' })
    }

    // Content moderation
    const bannedPatterns = [/https?:\/\/(?!nolance\.com)/i]
    const hasExternalLink = gig_link ? bannedPatterns.some(p => p.test(gig_link)) : false
    if (hasExternalLink) {
      return NextResponse.json({ error: 'Only Nolance gig links can be shared in communities' }, { status: 400 })
    }

    const { data: post } = await supabase.from('community_posts').insert({
      community_id, author_id: auth.userId,
      content: content.trim(),
      gig_link: gig_link || null,
      attachments: attachments || [],
      post_type: post_type || 'post',
    }).select(`
      *, author:users!author_id(id,username,display_name,profile_photo_url,
        seller_profile:seller_profiles(level))
    `).single()

    // Update community post count
    await supabase.from('communities').update({
      post_count: supabase.rpc('increment_counter') as any
    }).eq('id', community_id)

    return NextResponse.json({ data: { post }, error: null }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
})
