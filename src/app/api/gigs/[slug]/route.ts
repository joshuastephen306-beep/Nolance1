import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { authenticate } from '@/lib/auth/middleware'

// GET /api/gigs/[slug] — get single gig
export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const supabase = createClient()
    const { slug } = params

    const { data: gig, error } = await supabase
      .from('gigs')
      .select(`
        *,
        seller:users!seller_id(
          id, username, display_name, profile_photo_url, bio, country,
          is_online, last_seen, created_at,
          seller_profile:seller_profiles(
            level, average_rating, total_reviews, response_rate,
            response_time_hours, completion_rate, on_time_delivery_rate,
            total_orders_completed, unique_clients, is_available
          ),
          skills:user_skills(skill),
          languages:user_languages(language,level)
        ),
        category:categories!category_id(id,name,slug),
        subcategory:categories!subcategory_id(id,name,slug),
        packages:gig_packages(*),
        extras:gig_extras(*),
        gallery:gig_gallery(* ORDER BY sort_order),
        tags:gig_tags(tag),
        faqs:gig_faqs(* ORDER BY sort_order),
        requirements:gig_requirements(* ORDER BY sort_order),
        reviews:reviews(
          id, rating, comment, created_at, seller_response, seller_response_at,
          reviewer:users!reviewer_id(id,username,display_name,profile_photo_url,country)
        )
      `)
      .eq('slug', slug)
      .single()

    if (error || !gig) {
      return NextResponse.json({ error: 'Gig not found' }, { status: 404 })
    }

    // Only show active gigs to public (sellers can see their own)
    const auth = await authenticate(req)
    if (gig.status !== 'active' && gig.seller_id !== auth?.userId) {
      return NextResponse.json({ error: 'Gig not found' }, { status: 404 })
    }

    // Increment click count
    await supabase.from('gigs').update({ clicks: gig.clicks + 1 }).eq('id', gig.id)

    // Check if saved by current user
    let isSaved = false
    if (auth) {
      const { data: saved } = await supabase
        .from('saved_gigs').select('id').eq('user_id', auth.userId).eq('gig_id', gig.id).single()
      isSaved = !!saved
    }

    return NextResponse.json({ data: { ...gig, is_saved: isSaved }, error: null })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch gig' }, { status: 500 })
  }
}

// PUT /api/gigs/[slug] — update gig
export async function PUT(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const auth = await authenticate(req)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createClient()
    const body = await req.json()

    const { data: gig } = await supabase.from('gigs').select('id,seller_id').eq('slug', params.slug).single()
    if (!gig) return NextResponse.json({ error: 'Gig not found' }, { status: 404 })
    if (gig.seller_id !== auth.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

    const { title, category_id, subcategory_id, description, tags, packages, extras, faqs, requirements } = body

    // Validate
    if (title && title.length > 80) return NextResponse.json({ error: 'Title too long' }, { status: 400 })
    if (description && description.length < 120) return NextResponse.json({ error: 'Description too short' }, { status: 400 })

    // Update gig — back to pending for re-review on major changes
    await supabase.from('gigs').update({
      title: title?.trim(),
      category_id,
      subcategory_id: subcategory_id || null,
      description: description?.trim(),
      status: 'pending',
    }).eq('id', gig.id)

    // Update tags
    if (tags) {
      await supabase.from('gig_tags').delete().eq('gig_id', gig.id)
      if (tags.length > 0) {
        await supabase.from('gig_tags').insert(tags.map((t: string) => ({ gig_id: gig.id, tag: t.trim().toLowerCase() })))
      }
    }

    // Update packages
    if (packages) {
      await supabase.from('gig_packages').delete().eq('gig_id', gig.id)
      const rows = Object.entries(packages).map(([type, pkg]: [string, any]) => ({
        gig_id: gig.id, package_type: type, ...pkg
      }))
      await supabase.from('gig_packages').insert(rows)
    }

    // Update extras
    if (extras) {
      await supabase.from('gig_extras').delete().eq('gig_id', gig.id)
      if (extras.length > 0) await supabase.from('gig_extras').insert(extras.slice(0, 5).map((e: any) => ({ gig_id: gig.id, ...e })))
    }

    // Update FAQs
    if (faqs) {
      await supabase.from('gig_faqs').delete().eq('gig_id', gig.id)
      if (faqs.length > 0) await supabase.from('gig_faqs').insert(faqs.slice(0, 10).map((f: any, i: number) => ({ gig_id: gig.id, ...f, sort_order: i })))
    }

    // Update requirements
    if (requirements) {
      await supabase.from('gig_requirements').delete().eq('gig_id', gig.id)
      if (requirements.length > 0) await supabase.from('gig_requirements').insert(requirements.map((r: any, i: number) => ({ gig_id: gig.id, ...r, sort_order: i })))
    }

    return NextResponse.json({ data: { message: 'Gig updated and submitted for review.' }, error: null })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update gig' }, { status: 500 })
  }
}

// DELETE /api/gigs/[slug] — delete gig
export async function DELETE(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const auth = await authenticate(req)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createClient()
    const { data: gig } = await supabase.from('gigs').select('id,seller_id').eq('slug', params.slug).single()
    if (!gig) return NextResponse.json({ error: 'Gig not found' }, { status: 404 })
    if (gig.seller_id !== auth.userId && auth.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

    await supabase.from('gigs').update({ status: 'deleted' }).eq('id', gig.id)
    await supabase.from('seller_profiles').update({ active_gig_count: supabase.rpc('decrement', { x: 1 }) as any }).eq('user_id', gig.seller_id)

    return NextResponse.json({ data: { message: 'Gig deleted' }, error: null })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete gig' }, { status: 500 })
  }
}
