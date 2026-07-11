'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Avatar, LevelBadge, Badge } from '@/components/ui'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDate, timeAgo } from '@/utils'
import { useAuthStore } from '@/store/auth.store'
import { Shield, Zap, ChevronLeft, MessageSquare, Eye, Clock, CheckCircle, Star, ArrowRight } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function MarketplaceListingPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [listing, setListing] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [buying, setBuying] = useState(false)
  const [activeImg, setActiveImg] = useState(0)

  useEffect(() => { fetchListing() }, [slug])

  const fetchListing = async () => {
    try {
      const res = await axios.get(`/api/marketplace/listing/${slug}`)
      setListing(res.data.data)
    } catch {
      toast.error('Listing not found')
      router.push('/marketplace')
    }
    setLoading(false)
  }

  const handleBuy = async () => {
    if (!isAuthenticated) { router.push('/auth/login'); return }
    setBuying(true)
    try {
      const res = await axios.post(`/api/marketplace/listing/${slug}`, { payment_method: 'balance' })
      toast.success('Purchase successful!')
      router.push('/dashboard')
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Purchase failed')
    }
    setBuying(false)
  }

  const handleMessage = async () => {
    if (!isAuthenticated) { router.push('/auth/login'); return }
    try {
      const res = await axios.post('/api/messages', { recipient_id: listing.seller_id })
      router.push(`/dashboard/messages?conv=${res.data.data.conversation_id}`)
    } catch { toast.error('Failed to open conversation') }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50"><Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3"/>
        <div className="grid md:grid-cols-3 gap-5"><div className="md:col-span-2 h-80 bg-gray-200 rounded-2xl"/><div className="h-80 bg-gray-200 rounded-2xl"/></div>
      </div>
    </div>
  )
  if (!listing) return null

  const seller = listing.seller
  const sp = seller?.seller_profile
  const screenshots = listing.screenshots || []
  const isSeller = listing.seller_id === user?.id

  const CATEGORY_LABELS: Record<string, string> = {
    social_media: '📱 Social Media Account', domain: '🌐 Domain / Website',
    template: '🎨 Template', digital_product: '📦 Digital Product',
    software: '💻 Software', source_code: '⚙️ Source Code',
    ebook: '📚 E-book', physical: '📬 Physical Item', other: '🔧 Other',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <Link href="/marketplace" className="flex items-center gap-1 text-sm text-gray-400 hover:text-navy-900 mb-5 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Marketplace
        </Link>

        <div className="grid md:grid-cols-3 gap-5">
          {/* Left — Main */}
          <div className="md:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              {/* Screenshots */}
              {screenshots.length > 0 ? (
                <div>
                  <div className="rounded-xl overflow-hidden bg-gray-100 mb-3 h-64">
                    <img src={screenshots[activeImg]} alt={listing.title} className="w-full h-full object-contain" />
                  </div>
                  {screenshots.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                      {screenshots.map((img: string, i: number) => (
                        <button key={i} onClick={() => setActiveImg(i)}
                          className={`w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${activeImg === i ? 'border-green-500' : 'border-transparent'}`}>
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-48 rounded-xl bg-gradient-to-br from-navy-50 to-green-50 flex items-center justify-center text-5xl mb-3">
                  {CATEGORY_LABELS[listing.category]?.split(' ')[0] || '📦'}
                </div>
              )}

              {/* Title & Category */}
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="badge badge-navy text-xs">{CATEGORY_LABELS[listing.category] || listing.category}</span>
                  <span className={`badge text-xs ${listing.delivery_type === 'instant' ? 'badge-green' : 'badge-blue'}`}>
                    {listing.delivery_type === 'instant' ? '⚡ Instant delivery' : listing.delivery_type === 'manual' ? '📤 Manual delivery' : '📬 Physical shipping'}
                  </span>
                  <span className="text-xs text-gray-400">{timeAgo(listing.created_at)}</span>
                </div>
                <h1 className="text-xl font-semibold text-navy-900 mb-3">{listing.title}</h1>

                {/* Seller */}
                <div className="flex items-center gap-3 py-3 border-y border-gray-100">
                  <Avatar user={seller} size="md" />
                  <div>
                    <Link href={`/seller/${seller?.username}`} className="text-sm font-medium text-navy-900 hover:text-green-600">{seller?.display_name || seller?.username}</Link>
                    {sp?.level && <div className="mt-0.5"><LevelBadge level={sp.level} /></div>}
                  </div>
                  {sp?.average_rating > 0 && (
                    <div className="ml-auto text-right">
                      <p className="text-sm font-medium text-amber-500">{'★'.repeat(Math.round(sp.average_rating))} {sp.average_rating.toFixed(1)}</p>
                      <p className="text-xs text-gray-400">{sp.total_reviews} reviews</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mt-4">
                <h3 className="font-semibold text-navy-900 mb-2">About this listing</h3>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{listing.description}</p>
              </div>

              {/* Proof of Ownership */}
              {listing.proof_of_ownership && (
                <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-1 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" /> Proof of ownership
                  </h4>
                  <p className="text-xs text-blue-700 leading-relaxed">{listing.proof_of_ownership}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right — Purchase Box */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-20">
              <div className="text-3xl font-bold text-navy-900 mb-1">{formatCurrency(listing.price)}</div>
              <p className="text-xs text-gray-400 mb-4">
                Commission: {listing.commission_rate}% · Seller earns {formatCurrency(listing.price * (1 - listing.commission_rate / 100))}
              </p>

              <div className="space-y-2 mb-5">
                {[
                  { icon: Shield, text: 'Escrow protected purchase' },
                  { icon: listing.delivery_type === 'instant' ? Zap : Clock, text: listing.delivery_type === 'instant' ? 'Instant digital delivery' : 'Seller delivers within 24 hours' },
                  { icon: CheckCircle, text: 'Funds clear in 1–2 days' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-xs text-gray-500">
                    <Icon className="w-3.5 h-3.5 text-green-500 flex-shrink-0" /> {text}
                  </div>
                ))}
              </div>

              {isSeller ? (
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-3">This is your listing</p>
                  <Link href="/dashboard/marketplace"><Button variant="outline" fullWidth>Manage listing</Button></Link>
                </div>
              ) : (
                <>
                  <Button fullWidth loading={buying} onClick={handleBuy} size="lg">
                    Buy now — {formatCurrency(listing.price)} <ArrowRight className="w-4 h-4" />
                  </Button>
                  <button onClick={handleMessage}
                    className="w-full mt-2 py-2.5 text-sm text-gray-500 hover:text-navy-900 flex items-center justify-center gap-2 transition-colors">
                    <MessageSquare className="w-4 h-4" /> Message seller first
                  </button>
                </>
              )}

              <p className="text-center text-xs text-gray-400 mt-3">
                🔒 Payment held in escrow until delivery confirmed
              </p>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-400 flex items-center gap-1"><Eye className="w-3.5 h-3.5" />Views</span><span className="font-medium">{listing.views || 0}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Listed</span><span className="font-medium">{formatDate(listing.created_at)}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Condition</span><span className="font-medium capitalize">{listing.condition || 'N/A'}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
