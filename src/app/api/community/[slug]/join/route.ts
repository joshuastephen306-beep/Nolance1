import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/middleware'

// POST /api/community/[slug]/join
export const POST = requireAuth(async (req: NextRequest, auth, { params }: { params: { slug: string } }) => {
  try {
    const supabase = createClient()

    // Check community access
    const { data: reg } = await supabase
      .from('section_registrations')
      .select('id')
      .eq('user_id', auth.userId)
      .eq('section', 'community')
      .single()

    if (!reg) {
      return NextResponse.json({ error: 'Community access required. Register in your settings.' }, { status: 403 })
    }

    const { data: community } = await supabase
      .from('communities')
      .select('id, member_count')
      .eq('id', params.slug)
      .single()

    if (!community) return NextResponse.json({ error: 'Community not found' }, { status: 404 })

    // Check already a member
    const { data: existing } = await supabase
      .from('community_members')
      .select('id')
      .eq('community_id', params.id)
      .eq('user_id', auth.userId)
      .single()

    if (existing) return NextResponse.json({ error: 'Already a member of this community' }, { status: 400 })

    // Join
    await supabase.from('community_members').insert({
      community_id: params.id,
      user_id: auth.userId,
    })

    // Increment member count
    await supabase
      .from('communities')
      .update({ member_count: community.member_count + 1 })
      .eq('id', params.id)

    return NextResponse.json({ data: { message: 'Joined community successfully' }, error: null })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to join community' }, { status: 500 })
  }
})

// DELETE /api/community/[id]/join — leave community
export const DELETE = requireAuth(async (req: NextRequest, auth, { params }: { params: { id: string } }) => {
  try {
    const supabase = createClient()

    const { data: community } = await supabase.from('communities').select('id, member_count').eq('id', params.id).single()
    if (!community) return NextResponse.json({ error: 'Community not found' }, { status: 404 })

    await supabase.from('community_members')
      .delete()
      .eq('community_id', params.id)
      .eq('user_id', auth.userId)

    await supabase.from('communities')
      .update({ member_count: Math.max(0, community.member_count - 1) })
      .eq('id', params.id)

    return NextResponse.json({ data: { message: 'Left community' }, error: null })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to leave community' }, { status: 500 })
  }
})
