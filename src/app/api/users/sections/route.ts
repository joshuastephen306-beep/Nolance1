import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/middleware'

// GET /api/users/sections
export const GET = requireAuth(async (req: NextRequest, auth) => {
  try {
    const supabase = createClient()
    const { data } = await supabase.from('section_registrations')
      .select('*').eq('user_id', auth.userId).order('registered_at')
    return NextResponse.json({ data, error: null })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch sections' }, { status: 500 })
  }
})

// POST /api/users/sections — register for a section
export const POST = requireAuth(async (req: NextRequest, auth) => {
  try {
    const supabase = createClient()
    const { section } = await req.json()

    const VALID_SECTIONS = ['gigs', 'scout', 'marketplace', 'community', 'directory']
    if (!VALID_SECTIONS.includes(section)) {
      return NextResponse.json({ error: 'Invalid section' }, { status: 400 })
    }

    // Check already registered
    const { data: existing } = await supabase.from('section_registrations')
      .select('id').eq('user_id', auth.userId).eq('section', section).single()
    if (existing) return NextResponse.json({ error: 'Already registered for this section' }, { status: 400 })

    // Check seller requirement for scout
    if (section === 'scout') {
      const { data: user } = await supabase.from('users').select('role').eq('id', auth.userId).single()
      if (user?.role === 'buyer') {
        return NextResponse.json({ error: 'Scout access is available for sellers and buyer-seller accounts' }, { status: 403 })
      }
    }

    const { data } = await supabase.from('section_registrations').insert({
      user_id: auth.userId, section, status: 'active',
      terms_agreed: true, terms_agreed_at: new Date().toISOString(),
    }).select().single()

    return NextResponse.json({ data, error: null }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to register for section' }, { status: 500 })
  }
})
