import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { authenticate } from '@/lib/auth/middleware'

// PATCH /api/gigs/[slug]/status — pause or activate a gig
export async function PATCH(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const auth = await authenticate(req)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createClient()
    const { status } = await req.json()

    const ALLOWED_STATUSES = ['active', 'paused']
    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid status. Must be active or paused.' }, { status: 400 })
    }

    // Verify ownership
    const { data: gig } = await supabase
      .from('gigs')
      .select('id, seller_id, status')
      .eq('slug', params.slug)
      .single()

    if (!gig) return NextResponse.json({ error: 'Gig not found' }, { status: 404 })
    if (gig.seller_id !== auth.userId && auth.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    if (gig.status === 'denied' || gig.status === 'deleted') {
      return NextResponse.json({ error: 'Cannot change status of a denied or deleted gig' }, { status: 400 })
    }
    if (gig.status === 'pending') {
      return NextResponse.json({ error: 'Gig is under review and cannot be paused yet' }, { status: 400 })
    }

    await supabase.from('gigs').update({ status }).eq('id', gig.id)

    // Update active gig count on seller profile
    if (status === 'active') {
      await supabase.rpc('increment_active_gigs', { seller_id: auth.userId })
    } else {
      await supabase.rpc('decrement_active_gigs', { seller_id: auth.userId })
    }

    return NextResponse.json({
      data: { message: status === 'active' ? 'Gig activated successfully' : 'Gig paused successfully' },
      error: null,
    })
  } catch (error) {
    console.error('PATCH /api/gigs/[slug]/status error:', error)
    return NextResponse.json({ error: 'Failed to update gig status' }, { status: 500 })
  }
}
