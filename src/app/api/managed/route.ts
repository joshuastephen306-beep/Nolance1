import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/middleware'
import { sendManagedServicesUpdateEmail } from '@/lib/email'

// GET /api/managed — get managed service requests
export const GET = requireAuth(async (req: NextRequest, auth) => {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(req.url)
    const role = searchParams.get('role') || 'buyer'

    let query = supabase.from('managed_requests').select(`
      *,
      buyer:users!buyer_id(id,username,display_name,profile_photo_url),
      assigned_seller:users!assigned_seller_id(id,username,display_name,profile_photo_url,
        seller_profile:seller_profiles(level,average_rating)),
      category:categories(id,name,slug)
    `).order('created_at', { ascending: false })

    if (role === 'buyer') query = query.eq('buyer_id', auth.userId)
    else if (role === 'seller') query = query.eq('assigned_seller_id', auth.userId)

    const { data: requests } = await query
    return NextResponse.json({ data: requests, error: null })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch managed requests' }, { status: 500 })
  }
})

// POST /api/managed — submit managed services request
export const POST = requireAuth(async (req: NextRequest, auth) => {
  try {
    const supabase = createClient()
    const { title, description, category_id, budget_min, budget_max, deadline, attachments, trust_reason } = await req.json()

    if (!title || !description) return NextResponse.json({ error: 'Title and description are required' }, { status: 400 })
    if (description.length < 50) return NextResponse.json({ error: 'Please provide more detail about your project (min 50 characters)' }, { status: 400 })

    // Check minimum budget
    const minBudget = budget_min || budget_max
    if (minBudget && minBudget < 50) {
      return NextResponse.json({ error: 'Minimum project value for Managed Services is $50' }, { status: 400 })
    }

    const { data: request } = await supabase.from('managed_requests').insert({
      buyer_id: auth.userId,
      title: title.trim(),
      description: description.trim(),
      category_id: category_id || null,
      budget_min: budget_min || null,
      budget_max: budget_max || null,
      deadline: deadline || null,
      attachments: attachments || [],
      trust_reason: trust_reason?.trim() || null,
      status: 'requested',
      commission_rate: 25,
    }).select().single()

    // Notify NOLANCE team (in production: alert admin dashboard)
    await supabase.from('notifications').insert({
      user_id: auth.userId,
      type: 'system',
      title: 'Managed Services request received',
      body: 'Our team will review your request and respond within 4 hours.',
      data: { request_id: request?.id },
    })

    // Trigger AI seller matching in background
    if (request) {
      triggerAISellerMatching(supabase, request).catch(console.error)
    }

    return NextResponse.json({
      data: { request, message: 'Request submitted. Our team will respond within 4 hours.' },
      error: null,
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 })
  }
})

// AI Seller Matching
async function triggerAISellerMatching(supabase: any, request: any) {
  // Find top matching sellers based on category and past work
  const { data: sellers } = await supabase
    .from('seller_profiles')
    .select(`
      user_id, level, average_rating, total_reviews, completion_rate,
      on_time_delivery_rate, total_orders_completed,
      user:users(id, username, display_name, profile_photo_url)
    `)
    .in('level', ['top_rated', 'pro_verified', 'level2'])
    .gte('average_rating', 4.5)
    .gte('completion_rate', 90)
    .eq('is_available', true)
    .order('average_rating', { ascending: false })
    .limit(10)

  if (!sellers || sellers.length === 0) return

  // Update request with AI review status
  await supabase.from('managed_requests').update({ status: 'reviewing' }).eq('id', request.id)

  // Notify buyer
  const { data: buyer } = await supabase.from('users').select('email,username').eq('id', request.buyer_id).single()
  if (buyer) {
    await sendManagedServicesUpdateEmail(buyer.email, buyer.username, request.title, 'Under Review', request.id)
  }
}
