import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, authenticate } from '@/lib/auth/middleware'

// GET /api/community — list communities
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const auth = await authenticate(req)
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')
    const category_id = searchParams.get('category_id')

    let query = supabase.from('communities').select(`
      *, category:categories(id,name,slug)
    `).eq('is_active', true).order('member_count', { ascending: false })

    if (q) query = query.ilike('name', `%${q}%`)
    if (category_id) query = query.eq('category_id', category_id)

    const { data: communities } = await query

    // Check membership for logged-in users
    let memberships: string[] = []
    if (auth) {
      const { data: memberData } = await supabase.from('community_members')
        .select('community_id').eq('user_id', auth.userId)
      memberships = memberData?.map(m => m.community_id) || []
    }

    const enriched = communities?.map(c => ({ ...c, is_member: memberships.includes(c.id) }))
    return NextResponse.json({ data: enriched, error: null })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch communities' }, { status: 500 })
  }
}

// POST /api/community/join — join a community
async function joinCommunity(req: NextRequest, auth: any, community_id: string) {
  const supabase = createClient()

  // Check community access
  const { data: reg } = await supabase.from('section_registrations')
    .select('id').eq('user_id', auth.userId).eq('section', 'community').single()
  if (!reg) return NextResponse.json({ error: 'Community access required' }, { status: 403 })

  const { data: community } = await supabase.from('communities').select('id,member_count').eq('id', community_id).single()
  if (!community) return NextResponse.json({ error: 'Community not found' }, { status: 404 })

  // Check already member
  const { data: existing } = await supabase.from('community_members')
    .select('id').eq('community_id', community_id).eq('user_id', auth.userId).single()
  if (existing) return NextResponse.json({ error: 'Already a member' }, { status: 400 })

  await supabase.from('community_members').insert({ community_id, user_id: auth.userId })
  await supabase.from('communities').update({ member_count: community.member_count + 1 }).eq('id', community_id)

  return NextResponse.json({ data: { message: 'Joined community' }, error: null })
}
