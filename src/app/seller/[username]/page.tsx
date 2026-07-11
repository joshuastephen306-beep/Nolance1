'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Avatar, LevelBadge, StarRating, OnlineIndicator, Badge } from '@/components/ui'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDate, getGigUrl, timeAgo } from '@/utils'
import { useAuthStore } from '@/store/auth.store'
import {
  MapPin, Globe, Calendar, Clock, Star, CheckCircle,
  MessageSquare, Share2, Award, BookOpen, Briefcase
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function SellerProfilePage() {
  const { username } = useParams<{ username: string }>()
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'gigs' | 'reviews' | 'portfolio'>('gigs')

  useEffect(() => { fetchProfile() }, [username])

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`/api/users/${username}`)
      setProfile(res.data.data)
    } catch {
      toast.error('User not found')
      router.push('/explore')
    }
    setLoading(false)
  }

  const handleContact = async () => {
    if (!isAuthenticated) { router.push('/auth/login'); return }
    try {
      const res = await axios.post('/api/messages', { recipient_id: profile.id })
      router.push(`/dashboard/messages?conv=${res.data.data.conversation_id}`)
    } catch { toast.error('Failed to open conversation') }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50"><Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-48 bg-gray-200 rounded-2xl mb-4" />
        <div className="grid md:grid-cols-3 gap-6">
          <div className="h-64 bg-gray-200 rounded-2xl" />
          <div className="md:col-span-2 h-64 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    </div>
  )
  if (!profile) return null

  const sp = profile.seller_profile
  const gigs = profile.gigs || []
  const reviews = profile.reviews || []
  const samples = profile.work_samples || []

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Cover */}
      <div className="bg-navy-900 h-40 relative">
        {profile.cover_photo_url && (
          <img src={profile.cover_photo_url} alt="Cover" className="w-full h-full object-cover opacity-40" />
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 -mt-12 mb-6 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="relative -mt-16 sm:-mt-20">
              <Avatar user={profile} size="xl" className="border-4 border-white shadow-lg" />
              {profile.is_online && (
                <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-xl font-semibold text-navy-900">{profile.display_name || profile.username}</h1>
                {sp?.level && <LevelBadge level={sp.level} />}
                {sp?.managed_partner && <Badge variant="green">Managed Partner</Badge>}
              </div>
              <p className="text-sm text-gray-500 mb-2">{profile.professional_headline || 'Freelancer on Nolance'}</p>
              <div className="flex items-center gap-4 flex-wrap text-xs text-gray-400">
                {profile.country && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{profile.country}</span>}
                {profile.website_url && (
                  <a href={profile.website_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-green-600 transition-colors">
                    <Globe className="w-3 h-3" />{profile.website_url.replace(/^https?:\/\//, '')}
                  </a>
                )}
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Member since {formatDate(profile.created_at)}</span>
                <OnlineIndicator isOnline={profile.is_online} />
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {profile.is_own ? (
                <Link href="/settings/profile"><Button variant="outline">Edit profile</Button></Link>
              ) : (
                <>
                  <button onClick={handleContact} className="btn btn-primary">
                    <MessageSquare className="w-4 h-4" /> Contact
                  </button>
                  <button className="btn btn-outline w-10 h-10 p-0 justify-center">
                    <Share2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">

          {/* Left Sidebar */}
          <div className="space-y-4">

            {/* Stats */}
            {sp && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-semibold text-navy-900 mb-4">Seller stats</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Rating', value: sp.average_rating > 0 ? `${sp.average_rating.toFixed(1)} ★` : 'No reviews', icon: Star },
                    { label: 'Orders completed', value: sp.total_orders_completed, icon: Briefcase },
                    { label: 'Response rate', value: `${sp.response_rate}%`, icon: Clock },
                    { label: 'Avg response time', value: `${sp.response_time_hours}h`, icon: Clock },
                    { label: 'On-time delivery', value: `${sp.on_time_delivery_rate}%`, icon: CheckCircle },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-400"><Icon className="w-3.5 h-3.5" />{label}</div>
                      <span className="font-medium text-navy-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-semibold text-navy-900 mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((s: any) => (
                    <span key={s.skill} className="badge badge-navy text-xs">{s.skill}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {profile.languages && profile.languages.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-semibold text-navy-900 mb-3">Languages</h3>
                <div className="space-y-2">
                  {profile.languages.map((l: any) => (
                    <div key={l.language} className="flex justify-between text-sm">
                      <span className="text-navy-800">{l.language}</span>
                      <span className="text-gray-400 capitalize">{l.level || 'Fluent'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {profile.education && profile.education.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-semibold text-navy-900 mb-3 flex items-center gap-2"><BookOpen className="w-4 h-4" />Education</h3>
                {profile.education.map((e: any) => (
                  <div key={e.id} className="mb-3 last:mb-0">
                    <p className="text-sm font-medium text-navy-900">{e.degree} {e.field && `in ${e.field}`}</p>
                    <p className="text-xs text-gray-400">{e.institution} {e.year_start && `· ${e.year_start}${e.year_end ? `–${e.year_end}` : '–present'}`}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Certifications */}
            {profile.certifications && profile.certifications.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-semibold text-navy-900 mb-3 flex items-center gap-2"><Award className="w-4 h-4" />Certifications</h3>
                {profile.certifications.map((c: any) => (
                  <div key={c.id} className="mb-3 last:mb-0">
                    <p className="text-sm font-medium text-navy-900">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.issuer}{c.year && ` · ${c.year}`}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Main */}
          <div className="md:col-span-2 space-y-5">

            {/* Bio */}
            {profile.bio && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-semibold text-navy-900 mb-3">About</h3>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{profile.bio}</p>
              </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="flex border-b border-gray-100">
                {[
                  { id: 'gigs', label: `Gigs (${gigs.length})` },
                  { id: 'reviews', label: `Reviews (${reviews.length})` },
                  { id: 'portfolio', label: `Portfolio (${samples.length})` },
                ].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                    className={`px-5 py-3.5 text-sm border-b-2 transition-colors ${activeTab === tab.id ? 'border-green-500 text-green-600 font-medium' : 'border-transparent text-gray-500 hover:text-navy-900'}`}>
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-5">
                {/* Gigs Tab */}
                {activeTab === 'gigs' && (
                  gigs.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-8">No active gigs yet</p>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {gigs.map((gig: any) => {
                        const minPrice = gig.packages ? Math.min(...gig.packages.map((p: any) => p.price)) : 0
                        const thumb = gig.gallery?.find((g: any) => g.type === 'image')
                        return (
                          <Link key={gig.id} href={getGigUrl(gig.slug)} className="card-hover block overflow-hidden">
                            <div className="h-32 bg-gray-100 overflow-hidden">
                              {thumb ? <img src={thumb.url} alt={gig.title} className="w-full h-full object-cover" />
                                : <div className="w-full h-full bg-gradient-to-br from-navy-100 to-green-50 flex items-center justify-center text-2xl">🎨</div>}
                            </div>
                            <div className="p-3">
                              <p className="text-sm text-navy-900 line-clamp-2 mb-1">{gig.title}</p>
                              {gig.average_rating > 0 && <StarRating rating={gig.average_rating} count={gig.total_reviews} />}
                              <p className="text-sm font-semibold text-navy-900 mt-1">From {formatCurrency(minPrice)}</p>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  )
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  reviews.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-8">No reviews yet</p>
                  ) : (
                    <div className="space-y-5">
                      {reviews.map((review: any) => (
                        <div key={review.id} className="pb-5 border-b border-gray-100 last:border-0">
                          <div className="flex items-center gap-3 mb-2">
                            <Avatar user={review.reviewer} size="sm" />
                            <div>
                              <p className="text-sm font-medium text-navy-900">{review.reviewer?.display_name || review.reviewer?.username}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-amber-400 text-xs">{'★'.repeat(Math.round(review.rating))}</span>
                                <span className="text-xs text-gray-400">{timeAgo(review.created_at)}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                          {review.seller_response && (
                            <div className="mt-3 ml-4 bg-gray-50 rounded-lg p-3">
                              <p className="text-xs font-medium text-navy-700 mb-1">Response from {profile.username}:</p>
                              <p className="text-xs text-gray-500">{review.seller_response}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )
                )}

                {/* Portfolio Tab */}
                {activeTab === 'portfolio' && (
                  samples.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-8">No portfolio samples yet</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {samples.map((sample: any) => (
                        <div key={sample.id} className="aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer hover:opacity-90 transition-opacity">
                          <img src={sample.url} alt={sample.title || 'Work sample'} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
