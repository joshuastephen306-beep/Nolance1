import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { authenticate } from '@/lib/auth/middleware'

// GET /api/directory/[slug] — single business profile
export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const supabase = createClient()

    const { data: business, error } = await supabase
      .from('businesses')
      .select(`
        *,
        owner:users!owner_id(id, username, display_name, profile_photo_url, is_online),
        service_needs:business_service_needs(
          id, title, description, budget_range, deadline, is_active,
          category:categories(id, name, slug)
        ),
        reviews:business_reviews(
          id, rating, comment, business_response, created_at,
          reviewer:users!reviewer_id(id, username, display_name, profile_photo_url)
        )
      `)
      .eq('slug', params.slug)
      .single()

    if (error || !business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Increment view count
    await supabase
      .from('businesses')
      .update({ views: (business.views || 0) + 1 })
      .eq('id', business.id)

    // Calculate average rating
    const reviews = (business as any).reviews || []
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
      : 0

    return NextResponse.json({
      data: { ...business, average_rating: parseFloat(avgRating.toFixed(2)) },
      error: null,
    })
  } catch (error) {
    console.error('GET /api/directory/[slug] error:', error)
    return NextResponse.json({ error: 'Failed to fetch business' }, { status: 500 })
  }
}

// PATCH /api/directory/[slug] — update business
export async function PATCH(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const auth = await authenticate(req)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createClient()
    const body = await req.json()

    const { data: business } = await supabase
      .from('businesses')
      .select('id, owner_id')
      .eq('slug', params.slug)
      .single()

    if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    if (business.owner_id !== auth.userId && auth.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const allowedFields = [
      'name', 'category', 'description', 'website_url', 'phone', 'email',
      'address', 'city', 'country', 'size', 'year_founded', 'social_links',
      'logo_url', 'cover_url', 'photos',
    ]

    const updateData: Record<string, any> = {}
    allowedFields.forEach(field => {
      if (body[field] !== undefined) updateData[field] = body[field]
    })

    await supabase.from('businesses').update(updateData).eq('id', business.id)

    // Update service needs if provided
    if (body.service_needs) {
      await supabase.from('business_service_needs').delete().eq('business_id', business.id)
      if (body.service_needs.length > 0) {
        await supabase.from('business_service_needs').insert(
          body.service_needs.map((need: any) => ({ ...need, business_id: business.id }))
        )
      }
    }

    return NextResponse.json({ data: { message: 'Business updated successfully' }, error: null })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update business' }, { status: 500 })
  }
}

// DELETE /api/directory/[slug] — remove business listing
export async function DELETE(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const auth = await authenticate(req)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createClient()
    const { data: business } = await supabase.from('businesses').select('id, owner_id').eq('slug', params.slug).single()
    if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    if (business.owner_id !== auth.userId && auth.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await supabase.from('businesses').delete().eq('id', business.id)
    return NextResponse.json({ data: { message: 'Business removed from directory' }, error: null })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove business' }, { status: 500 })
  }
}
