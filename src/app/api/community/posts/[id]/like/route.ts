import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/middleware'

// POST /api/community/posts/[id]/like — toggle like
export const POST = requireAuth(async (req: NextRequest, auth, { params }: { params: { id: string } }) => {
  try {
    const supabase = createClient()

    const { data: post } = await supabase
      .from('community_posts')
      .select('id, like_count')
      .eq('id', params.id)
      .single()

    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

    // Check if already liked
    const { data: existing } = await supabase
      .from('community_post_likes')
      .select('id')
      .eq('post_id', params.id)
      .eq('user_id', auth.userId)
      .single()

    if (existing) {
      // Unlike
      await supabase.from('community_post_likes').delete()
        .eq('post_id', params.id).eq('user_id', auth.userId)
      await supabase.from('community_posts')
        .update({ like_count: Math.max(0, post.like_count - 1) })
        .eq('id', params.id)
      return NextResponse.json({ data: { liked: false, like_count: post.like_count - 1 }, error: null })
    } else {
      // Like
      await supabase.from('community_post_likes').insert({ post_id: params.id, user_id: auth.userId })
      await supabase.from('community_posts')
        .update({ like_count: post.like_count + 1 })
        .eq('id', params.id)
      return NextResponse.json({ data: { liked: true, like_count: post.like_count + 1 }, error: null })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 })
  }
})
