'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/utils'
import { useAuthStore } from '@/store/auth.store'
import {
  MapPin, Globe, Phone, Mail, Building, CheckCircle,
  ChevronLeft, Briefcase, Send, Calendar, Instagram,
  Linkedin, Twitter, Facebook, ExternalLink, Star
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function BusinessProfilePage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [business, setBusiness] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [hasScout, setHasScout] = useState(false)

  useEffect(() => {
    fetchBusiness()
    if (isAuthenticated) checkScoutAccess()
  }, [slug])

  const fetchBusiness = async () => {
    try {
      const res = await axios.get(`/api/directory/${slug}`)
      setBusiness(res.data.data)
    } catch { router.push('/directory') }
    setLoading(false)
  }

  const checkScoutAccess = async () => {
    try {
      const res = await axios.get('/api/users/sections')
      const sections = res.data.data?.map((s: any) => s.section) || []
      setHasScout(sections.includes('scout'))
    } catch {}
  }

  const handleScoutMessage = async () => {
    if (!isAuthenticated) { router.push('/auth/login'); return }
    if (!hasScout) {
      toast.error('You need Scout access to message businesses through Nolance')
      router.push('/settings/sections')
      return
    }
    try {
      const res = await axios.post('/api/messages', { recipient_id: business.owner_id })
      router.push(`/dashboard/messages?conv=${res.data.data.conversation_id}`)
    } catch { toast.error('Failed to open conversation') }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50"><Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="h-48 bg-gray-200 rounded-2xl"/><div className="h-64 bg-gray-200 rounded-2xl"/>
      </div>
    </div>
  )
  if (!business) return null

  const socialLinks = business.social_links || {}
  const serviceNeeds = (business.service_needs || []).filter((s: any) => s.is_active)
  const reviews = business.reviews || []
  const avgRating = reviews.length > 0 ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Cover */}
      <div className="bg-navy-900 h-40 relative overflow-hidden">
        {business.cover_url && <img src={business.cover_url} alt="" className="w-full h-full object-cover opacity-30" />}
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link href="/directory" className="flex items-center gap-1 text-sm text-gray-400 hover:text-navy-900 my-4 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Directory
        </Link>

        {/* Header Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 -mt-10 mb-5 relative">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-2xl bg-navy-50 border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden -mt-14 shadow-lg">
              {business.logo_url ? <img src={business.logo_url} alt={business.name} className="w-full h-full object-cover" />
                : <Building className="w-10 h-10 text-navy-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-xl font-semibold text-navy-900">{business.name}</h1>
                {business.is_verified && (
                  <span className="flex items-center gap-1 badge badge-green text-xs"><CheckCircle className="w-3 h-3" /> Verified</span>
                )}
                {business.plan !== 'free' && (
                  <span className={`badge text-xs ${business.plan === 'premium' ? 'badge-amber' : 'badge-blue'}`}>
                    {business.plan === 'premium' ? '⭐ Premium' : 'Standard'}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mb-2 capitalize">{business.category}</p>
              <div className="flex items-center gap-4 flex-wrap text-xs text-gray-400">
                {(business.city || business.country) && (
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{[business.city, business.country].filter(Boolean).join(', ')}</span>
                )}
                {business.year_founded && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Founded {business.year_founded}</span>}
                {business.size && <span>Size: {business.size}</span>}
                {avgRating > 0 && <span className="flex items-center gap-1 text-amber-500">{'★'.repeat(Math.round(avgRating))} ({reviews.length})</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5 mb-8">

          {/* Main */}
          <div className="md:col-span-2 space-y-5">
            {business.description && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h2 className="font-semibold text-navy-900 mb-3">About</h2>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{business.description}</p>
              </div>
            )}

            {/* Service Needs */}
            {serviceNeeds.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h2 className="font-semibold text-navy-900 mb-4 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-green-500" /> Services we need ({serviceNeeds.length})
                </h2>
                <div className="space-y-3">
                  {serviceNeeds.map((need: any) => (
                    <div key={need.id} className="border border-gray-100 rounded-xl p-4 hover:border-green-300 transition-colors">
                      <h3 className="text-sm font-semibold text-navy-900 mb-1">{need.title}</h3>
                      {need.description && <p className="text-xs text-gray-500 mb-2">{need.description}</p>}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          {need.budget_range && <span>Budget: {need.budget_range}</span>}
                          {need.deadline && <span>By {formatDate(need.deadline)}</span>}
                        </div>
                        <Button size="sm" onClick={handleScoutMessage}>
                          <Send className="w-3.5 h-3.5" /> I can help
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {reviews.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h2 className="font-semibold text-navy-900 mb-4">Seller reviews ({reviews.length})</h2>
                <div className="space-y-4">
                  {reviews.map((review: any) => (
                    <div key={review.id} className="pb-4 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-amber-400 text-sm">{'★'.repeat(Math.round(review.rating))}</span>
                        <span className="text-xs text-gray-400">by {review.reviewer?.username}</span>
                      </div>
                      {review.comment && <p className="text-sm text-gray-600">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Contact */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-semibold text-navy-900 mb-4">Contact</h3>
              <div className="space-y-3">
                {business.website_url && (
                  <a href={business.website_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-green-600 hover:underline">
                    <Globe className="w-4 h-4" /> {business.website_url.replace(/^https?:\/\//, '').substring(0, 30)}
                  </a>
                )}
                {business.phone && (
                  <a href={`tel:${business.phone}`} className="flex items-center gap-2 text-sm text-navy-700 hover:text-green-600">
                    <Phone className="w-4 h-4" /> {business.phone}
                  </a>
                )}
                {business.email && (
                  <a href={`mailto:${business.email}`} className="flex items-center gap-2 text-sm text-navy-700 hover:text-green-600">
                    <Mail className="w-4 h-4" /> {business.email}
                  </a>
                )}
                {/* Social Links */}
                <div className="flex gap-2 pt-1">
                  {socialLinks.instagram && (
                    <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-pink-600 hover:border-pink-200 transition-colors">
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                  {socialLinks.linkedin && (
                    <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-colors">
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {socialLinks.twitter && (
                    <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-sky-500 hover:border-sky-200 transition-colors">
                      <Twitter className="w-4 h-4" />
                    </a>
                  )}
                  {socialLinks.facebook && (
                    <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-blue-700 hover:border-blue-200 transition-colors">
                      <Facebook className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-100 mt-4 pt-4 space-y-2">
                <Button fullWidth onClick={handleScoutMessage}>
                  <Send className="w-4 h-4" /> Message via Scout
                </Button>
                <p className="text-xs text-gray-400 text-center">Scout messaging enables in-platform payments</p>
              </div>
            </div>

            {/* Photos */}
            {business.photos && business.photos.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-semibold text-navy-900 mb-3">Photos</h3>
                <div className="grid grid-cols-3 gap-2">
                  {business.photos.slice(0, 9).map((photo: string, i: number) => (
                    <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img src={photo} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
