import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, authenticate } from '@/lib/auth/middleware'
import { sendPhoneAddedEmail } from '@/lib/email'

// GET /api/users/[username] — public profile
export async function GET(req: NextRequest, { params }: { params: { username: string } }) {
  try {
    const supabase = createClient()
    const auth = await authenticate(req)

    const { data: user, error } = await supabase.from('users').select(`
      id, username, display_name, profile_photo_url, cover_photo_url, bio,
      professional_headline, website_url, country, is_online, last_seen, created_at,
      skills:user_skills(skill),
      languages:user_languages(language,level),
      education:user_education(*),
      certifications:user_certifications(*),
      social_links:user_social_links(platform,url),
      seller_profile:seller_profiles(
        level, average_rating, total_reviews, response_rate, response_time_hours,
        completion_rate, on_time_delivery_rate, total_orders_completed, unique_clients,
        is_available, managed_partner, active_gig_count
      )
    `).eq('username', params.username.toLowerCase()).single()

    if (error || !user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Get user's active gigs
    const { data: gigs } = await supabase.from('gigs').select(`
      id, title, slug, average_rating, total_reviews,
      gallery:gig_gallery(url,type,sort_order),
      packages:gig_packages(price,package_type)
    `).eq('seller_id', user.id).eq('status', 'active').limit(6)

    // Get recent reviews
    const { data: reviews } = await supabase.from('reviews').select(`
      id, rating, comment, created_at,
      reviewer:users!reviewer_id(id,username,display_name,profile_photo_url,country)
    `).eq('reviewee_id', user.id).eq('is_verified', true)
      .order('created_at', { ascending: false }).limit(5)

    // Work samples
    const { data: samples } = await supabase.from('work_samples').select('*')
      .eq('seller_id', user.id).limit(9)

    const isOwn = auth?.userId === user.id

    return NextResponse.json({
      data: { ...user, gigs, reviews, work_samples: samples, is_own: isOwn },
      error: null,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

// PATCH /api/users/profile — update profile
export const PATCH = requireAuth(async (req: NextRequest, auth) => {
  try {
    const supabase = createClient()
    const body = await req.json()
    const {
      display_name, bio, professional_headline, website_url, country, timezone,
      language, currency, skills, languages, education, certifications, social_links,
    } = body

    // Update main user record
    const updateData: Record<string, any> = {}
    if (display_name !== undefined) updateData.display_name = display_name?.trim()
    if (bio !== undefined) updateData.bio = bio?.trim()
    if (professional_headline !== undefined) updateData.professional_headline = professional_headline?.trim()
    if (website_url !== undefined) updateData.website_url = website_url?.trim()
    if (country !== undefined) updateData.country = country
    if (timezone !== undefined) updateData.timezone = timezone
    if (language !== undefined) updateData.language = language
    if (currency !== undefined) updateData.currency = currency

    if (Object.keys(updateData).length > 0) {
      await supabase.from('users').update(updateData).eq('id', auth.userId)
    }

    // Update skills
    if (skills !== undefined) {
      await supabase.from('user_skills').delete().eq('user_id', auth.userId)
      if (skills.length > 0) {
        await supabase.from('user_skills').insert(skills.map((s: string) => ({ user_id: auth.userId, skill: s })))
      }
    }

    // Update languages
    if (languages !== undefined) {
      await supabase.from('user_languages').delete().eq('user_id', auth.userId)
      if (languages.length > 0) {
        await supabase.from('user_languages').insert(languages.map((l: any) => ({ user_id: auth.userId, ...l })))
      }
    }

    // Update education
    if (education !== undefined) {
      await supabase.from('user_education').delete().eq('user_id', auth.userId)
      if (education.length > 0) {
        await supabase.from('user_education').insert(education.map((e: any) => ({ user_id: auth.userId, ...e })))
      }
    }

    // Update certifications
    if (certifications !== undefined) {
      await supabase.from('user_certifications').delete().eq('user_id', auth.userId)
      if (certifications.length > 0) {
        await supabase.from('user_certifications').insert(certifications.map((c: any) => ({ user_id: auth.userId, ...c })))
      }
    }

    // Update social links
    if (social_links !== undefined) {
      await supabase.from('user_social_links').delete().eq('user_id', auth.userId)
      if (social_links.length > 0) {
        await supabase.from('user_social_links').insert(social_links.map((s: any) => ({ user_id: auth.userId, ...s })))
      }
    }

    return NextResponse.json({ data: { message: 'Profile updated successfully' }, error: null })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
})
