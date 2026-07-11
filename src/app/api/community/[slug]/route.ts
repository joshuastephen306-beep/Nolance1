import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { authenticate, requireAuth } from '@/lib/auth/middleware'

// GET /api/community/[slug] — single community
export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const supabase = createClient()
    const auth = await authenticate(req)

    const { data: community, error } = await supabase
      .from('communities')
      .select(`*, category:categories(id, name, slug)`)
      .eq('slug', params.slug)
      .single()

    if (error || !community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 })
    }

    // Check membership
    let is_member = false
    if (auth) {
      const { data: membership } = await supabase
        .from('community_members')
        .select('id')
        .eq('community_id', community.id)
        .eq('user_id', auth.userId)
        .single()
      is_member = !!membership
    }

    return NextResponse.json({ data: { ...community, is_member }, error: null })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch community' }, { status: 500 })
  }
}
