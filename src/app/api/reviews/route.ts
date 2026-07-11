import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/middleware'
import { sendNewReviewEmail } from '@/lib/email'

// GET /api/reviews?user_id=xxx or ?gig_id=xxx
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(req.url)
    const user_id = searchParams.get('user_id')
    const gig_id = searchParams.get('gig_id')
    const page = Number(searchParams.get('page') || 1)
    const limit = 10
    const offset = (page - 1) * limit

    let query = supabase.from('reviews').select(`
      *, reviewer:users!reviewer_id(id,username,display_name,profile_photo_url,country)
    `, { count: 'exact' })
      .eq('is_verified', true)
      .order('created_at', { ascending: false })

    if (user_id) query = query.eq('reviewee_id', user_id)
    if (gig_id) query = query.eq('gig_id', gig_id)

    const { data: reviews, count } = await query.range(offset, offset + limit - 1)

    // Calculate rating breakdown
    let ratingBreakdown = null
    if (user_id || gig_id) {
      const { data: allRatings } = await supabase.from('reviews').select('rating')
        .eq(user_id ? 'reviewee_id' : 'gig_id', (user_id || gig_id)!)

      if (allRatings && allRatings.length > 0) {
        const breakdown = [5, 4, 3, 2, 1].map(star => ({
          star,
          count: allRatings.filter(r => Math.round(r.rating) === star).length,
          percentage: Math.round((allRatings.filter(r => Math.round(r.rating) === star).length / allRatings.length) * 100),
        }))
        const avg = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length
        ratingBreakdown = { breakdown, average: parseFloat(avg.toFixed(2)), total: allRatings.length }
      }
    }

    return NextResponse.json({ data: reviews, total: count, rating_breakdown: ratingBreakdown, page, limit, error: null })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

// POST /api/reviews — leave a review
export const POST = requireAuth(async (req: NextRequest, auth) => {
  try {
    const supabase = createClient()
    const { order_id, rating, comment } = await req.json()

    if (!order_id || !rating) return NextResponse.json({ error: 'Order and rating are required' }, { status: 400 })
    if (rating < 1 || rating > 5) return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })

    // Get order
    const { data: order } = await supabase.from('orders').select('*').eq('id', order_id)
      .eq('status', 'completed').single()
    if (!order) return NextResponse.json({ error: 'Order not found or not yet completed' }, { status: 404 })

    const isBuyer = order.buyer_id === auth.userId
    const isSeller = order.seller_id === auth.userId
    if (!isBuyer && !isSeller) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

    // Check already reviewed
    const { data: existing } = await supabase.from('reviews').select('id')
      .eq('order_id', order_id).eq('reviewer_id', auth.userId).single()
    if (existing) return NextResponse.json({ error: 'You have already reviewed this order' }, { status: 400 })

    const revieweeId = isBuyer ? order.seller_id : order.buyer_id

    const { data: review } = await supabase.from('reviews').insert({
      order_id,
      reviewer_id: auth.userId,
      reviewee_id: revieweeId,
      gig_id: order.gig_id,
      rating: parseFloat(rating.toFixed(1)),
      comment: comment?.trim() || null,
      is_verified: true,
    }).select().single()

    // Update seller average rating
    if (isBuyer) {
      const { data: allReviews } = await supabase.from('reviews').select('rating').eq('reviewee_id', revieweeId)
      if (allReviews) {
        const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        await supabase.from('seller_profiles').update({
          average_rating: parseFloat(avg.toFixed(2)),
          total_reviews: allReviews.length,
        }).eq('user_id', revieweeId)

        // Update gig rating
        if (order.gig_id) {
          const { data: gigReviews } = await supabase.from('reviews').select('rating').eq('gig_id', order.gig_id)
          if (gigReviews) {
            const gigAvg = gigReviews.reduce((sum, r) => sum + r.rating, 0) / gigReviews.length
            await supabase.from('gigs').update({
              average_rating: parseFloat(gigAvg.toFixed(2)),
              total_reviews: gigReviews.length,
            }).eq('id', order.gig_id)
          }
        }
      }
    }

    // Notify reviewee
    const [{ data: reviewee }, { data: reviewer }] = await Promise.all([
      supabase.from('users').select('email,username').eq('id', revieweeId).single(),
      supabase.from('users').select('display_name,username').eq('id', auth.userId).single(),
    ])

    if (reviewee && isBuyer) {
      await sendNewReviewEmail(reviewee.email, reviewee.username, rating, reviewer?.display_name || reviewer?.username || 'A client', comment || '', order.title)
    }

    await supabase.from('notifications').insert({
      user_id: revieweeId, type: 'review',
      title: `New ${rating}-star review`,
      body: comment?.substring(0, 100) || 'You received a new review',
      data: { order_id, review_id: review?.id },
    })

    return NextResponse.json({ data: { review, message: 'Review submitted successfully' }, error: null }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
  }
})

// PATCH /api/reviews — seller responds to review
export const PATCH = requireAuth(async (req: NextRequest, auth) => {
  try {
    const supabase = createClient()
    const { review_id, response } = await req.json()

    const { data: review } = await supabase.from('reviews').select('*').eq('id', review_id).single()
    if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    if (review.reviewee_id !== auth.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    if (review.seller_response) return NextResponse.json({ error: 'Already responded to this review' }, { status: 400 })

    await supabase.from('reviews').update({
      seller_response: response.trim(),
      seller_response_at: new Date().toISOString(),
    }).eq('id', review_id)

    return NextResponse.json({ data: { message: 'Response posted' }, error: null })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to post response' }, { status: 500 })
  }
})
