'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Avatar, StarRating, LevelBadge, OnlineIndicator, Badge } from '@/components/ui'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDate, timeAgo, getSellerUrl } from '@/utils'
import { useAuthStore } from '@/store/auth.store'
import { Gig } from '@/types'
import {
  Heart, Share2, ChevronDown, ChevronUp, Check, Clock,
  RefreshCw, Star, Globe, Calendar, MessageSquare, ArrowRight
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function GigPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [gig, setGig] = useState<Gig | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPackage, setSelectedPackage] = useState<'basic' | 'standard' | 'premium'>('basic')
  const [selectedExtras, setSelectedExtras] = useState<string[]>([])
  const [isSaved, setIsSaved] = useState(false)
  const [orderLoading, setOrderLoading] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'seller'>('description')

  useEffect(() => {
    fetchGig()
  }, [slug])

  const fetchGig = async () => {
    try {
      const res = await axios.get(`/api/gigs/${slug}`)
      setGig(res.data.data)
      setIsSaved(res.data.data.is_saved)
    } catch {
      toast.error('Gig not found')
      router.push('/explore')
    }
    setLoading(false)
  }

  const handleOrder = async () => {
    if (!isAuthenticated) { router.push('/auth/login?redirect=' + window.location.pathname); return }
    if (!gig) return

    const pkg = packages.find(p => p.package_type === selectedPackage)
    if (!pkg) return

    setOrderLoading(true)
    try {
      const res = await axios.post('/api/orders', {
        gig_id: gig.id,
        package_id: pkg.id,
        extra_ids: selectedExtras,
      })
      toast.success('Order placed successfully!')
      router.push(`/orders/${res.data.data.order.order_number}`)
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to place order')
    }
    setOrderLoading(false)
  }

  const handleContact = async () => {
    if (!isAuthenticated) { router.push('/auth/login'); return }
    const seller = (gig as any)?.seller
    if (!seller) return
    try {
      const res = await axios.post('/api/messages', { recipient_id: seller.id })
      router.push(`/dashboard/messages?conv=${res.data.data.conversation_id}`)
    } catch { toast.error('Failed to open conversation') }
  }

  const toggleSave = async () => {
    if (!isAuthenticated) { router.push('/auth/login'); return }
    setIsSaved(!isSaved)
    toast.success(isSaved ? 'Removed from saved' : 'Saved to favorites')
  }

  const toggleExtra = (id: string) => {
    setSelectedExtras(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id])
  }

  if (loading) return <div className="min-h-screen bg-gray-50"><Navbar /><div className="max-w-6xl mx-auto px-4 py-8 animate-pulse"><div className="grid lg:grid-cols-3 gap-6"><div className="lg:col-span-2 space-y-4"><div className="h-80 bg-gray-200 rounded-2xl" /><div className="h-8 bg-gray-200 rounded w-3/4" /><div className="h-4 bg-gray-200 rounded w-1/2" /></div><div className="h-96 bg-gray-200 rounded-2xl" /></div></div></div>
  if (!gig) return null

  const seller = (gig as any).seller
  const packages = (gig as any).packages || []
  const extras = (gig as any).extras || []
  const gallery = (gig as any).gallery || []
  const faqs = (gig as any).faqs || []
  const reviews = (gig as any).reviews || []
  const sellerProfile = seller?.seller_profile

  const activePkg = packages.find((p: any) => p.package_type === selectedPackage) || packages[0]
  const selectedExtraItems = extras.filter((e: any) => selectedExtras.includes(e.id))
  const extrasTotal = selectedExtraItems.reduce((sum: number, e: any) => sum + e.price, 0)
  const totalPrice = (activePkg?.price || 0) + extrasTotal
  const totalDays = (activePkg?.delivery_days || 1) + selectedExtraItems.reduce((sum: number, e: any) => sum + e.delivery_days_extra, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-5">
          <Link href="/explore" className="hover:text-green-600">Explore</Link>
          <span>/</span>
          <Link href={`/explore?category=${(gig as any).category?.slug}`} className="hover:text-green-600">{(gig as any).category?.name}</Link>
          <span>/</span>
          <span className="text-gray-600 line-clamp-1">{gig.title}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── LEFT / MAIN ────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Title & Actions */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h1 className="text-xl font-semibold text-navy-900 mb-3 leading-snug">{gig.title}</h1>

              {/* Seller Row */}
              <div className="flex items-center gap-3 mb-4">
                <Link href={getSellerUrl(seller?.username)}>
                  <Avatar user={seller} size="md" />
                </Link>
                <div>
                  <div className="flex items-center gap-2">
                    <Link href={getSellerUrl(seller?.username)} className="text-sm font-medium text-navy-900 hover:text-green-600">
                      {seller?.display_name || seller?.username}
                    </Link>
                    {sellerProfile?.level && <LevelBadge level={sellerProfile.level} />}
                    {sellerProfile?.managed_partner && <Badge variant="green">Managed Partner</Badge>}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    {gig.average_rating > 0 && <StarRating rating={gig.average_rating} count={gig.total_reviews} />}
                    <OnlineIndicator isOnline={seller?.is_online} />
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <button onClick={toggleSave} className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors ${isSaved ? 'border-red-200 bg-red-50 text-red-500' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}>
                    <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                  </button>
                  <button className="w-9 h-9 rounded-lg border border-gray-200 text-gray-400 hover:border-gray-300 flex items-center justify-center">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Gallery */}
              {gallery.length > 0 && (
                <div className="rounded-xl overflow-hidden bg-gray-100 mb-4">
                  <img src={gallery[0].url} alt={gig.title} className="w-full h-72 object-cover" />
                </div>
              )}
              {gallery.length === 0 && (
                <div className="rounded-xl h-64 bg-gradient-to-br from-navy-100 to-green-50 flex items-center justify-center text-5xl mb-4">
                  🎨
                </div>
              )}

              {/* Gallery thumbnails */}
              {gallery.length > 1 && (
                <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
                  {gallery.slice(0, 5).map((item: any, i: number) => (
                    <img key={i} src={item.url} alt="" className="w-16 h-12 rounded-lg object-cover cursor-pointer border-2 border-transparent hover:border-green-500 flex-shrink-0" />
                  ))}
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="flex border-b border-gray-100">
                {[
                  { id: 'description', label: 'Description' },
                  { id: 'reviews', label: `Reviews (${gig.total_reviews})` },
                  { id: 'seller', label: 'About Seller' },
                ].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                    className={`px-5 py-3.5 text-sm border-b-2 transition-colors ${activeTab === tab.id ? 'border-green-500 text-green-600 font-medium' : 'border-transparent text-gray-500 hover:text-navy-900'}`}>
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* Description Tab */}
                {activeTab === 'description' && (
                  <div>
                    <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-line mb-6">
                      {gig.description}
                    </div>

                    {/* FAQs */}
                    {faqs.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-navy-900 mb-3">Frequently asked questions</h3>
                        <div className="space-y-2">
                          {faqs.map((faq: any, i: number) => (
                            <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                              <button onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors">
                                <span className="text-sm font-medium text-navy-900">{faq.question}</span>
                                {expandedFaq === i ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                              </button>
                              {expandedFaq === i && (
                                <div className="px-4 pb-4 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
                                  {faq.answer}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div>
                    {gig.average_rating > 0 && (
                      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                        <div className="text-center">
                          <p className="text-5xl font-semibold text-navy-900">{gig.average_rating.toFixed(1)}</p>
                          <div className="text-amber-400 text-lg">{'★'.repeat(Math.round(gig.average_rating))}</div>
                          <p className="text-xs text-gray-400">{gig.total_reviews} reviews</p>
                        </div>
                      </div>
                    )}
                    <div className="space-y-5">
                      {reviews.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-8">No reviews yet. Be the first to order!</p>
                      ) : reviews.map((review: any) => (
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
                              <p className="text-xs font-medium text-navy-700 mb-1">Seller's response:</p>
                              <p className="text-xs text-gray-500">{review.seller_response}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Seller Tab */}
                {activeTab === 'seller' && (
                  <div>
                    <div className="flex items-center gap-4 mb-5">
                      <Avatar user={seller} size="xl" />
                      <div>
                        <Link href={getSellerUrl(seller?.username)} className="text-lg font-semibold text-navy-900 hover:text-green-600">
                          {seller?.display_name || seller?.username}
                        </Link>
                        {sellerProfile?.level && <div className="mt-1"><LevelBadge level={sellerProfile.level} /></div>}
                        {gig.average_rating > 0 && <div className="mt-1"><StarRating rating={gig.average_rating} count={gig.total_reviews} /></div>}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                      {[
                        { label: 'From', value: seller?.country || 'Global' },
                        { label: 'Member since', value: formatDate(seller?.created_at) },
                        { label: 'Avg response', value: `${sellerProfile?.response_time_hours || 24}h` },
                        { label: 'Orders done', value: sellerProfile?.total_orders_completed || 0 },
                      ].map(stat => (
                        <div key={stat.label} className="text-center bg-gray-50 rounded-xl p-3">
                          <p className="text-sm font-semibold text-navy-900">{stat.value}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
                        </div>
                      ))}
                    </div>

                    {seller?.bio && <p className="text-sm text-gray-600 leading-relaxed mb-4">{seller.bio}</p>}

                    <Button variant="outline" onClick={handleContact} fullWidth>
                      <MessageSquare className="w-4 h-4" /> Contact seller
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT / ORDER BOX ──────────────────────── */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">

                {/* Package Tabs */}
                {packages.length > 1 && (
                  <div className="flex border-b border-gray-100">
                    {packages.map((pkg: any) => (
                      <button key={pkg.package_type} onClick={() => setSelectedPackage(pkg.package_type)}
                        className={`flex-1 py-3 text-xs font-medium capitalize transition-colors ${selectedPackage === pkg.package_type ? 'bg-green-50 text-green-700 border-b-2 border-green-500' : 'text-gray-500 hover:text-navy-900'}`}>
                        {pkg.package_type}
                      </button>
                    ))}
                  </div>
                )}

                <div className="p-5">
                  {activePkg && (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-semibold text-navy-900 capitalize">{activePkg.name || activePkg.package_type}</p>
                        <p className="text-xl font-bold text-navy-900">{formatCurrency(activePkg.price)}</p>
                      </div>

                      {activePkg.description && (
                        <p className="text-sm text-gray-500 mb-4 leading-relaxed">{activePkg.description}</p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>{totalDays} day{totalDays !== 1 ? 's' : ''} delivery</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <RefreshCw className="w-4 h-4 text-gray-400" />
                          <span>{activePkg.revisions === 0 ? 'No' : activePkg.revisions} revision{activePkg.revisions !== 1 ? 's' : ''}</span>
                        </div>
                      </div>

                      {activePkg.features && Object.entries(activePkg.features).length > 0 && (
                        <div className="space-y-1.5 mb-4">
                          {Object.entries(activePkg.features).map(([feat, included]) => (
                            <div key={feat} className="flex items-center gap-2">
                              <Check className={`w-3.5 h-3.5 ${included ? 'text-green-500' : 'text-gray-200'}`} />
                              <span className={`text-xs ${included ? 'text-navy-700' : 'text-gray-300 line-through'}`}>{feat}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {/* Extras */}
                  {extras.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Add extras</p>
                      <div className="space-y-2">
                        {extras.map((extra: any) => (
                          <label key={extra.id} className="flex items-start gap-2.5 cursor-pointer group">
                            <input type="checkbox" checked={selectedExtras.includes(extra.id)}
                              onChange={() => toggleExtra(extra.id)}
                              className="mt-0.5 w-4 h-4 rounded text-green-500" />
                            <div className="flex-1">
                              <p className="text-xs font-medium text-navy-900">{extra.title}</p>
                              {extra.delivery_days_extra > 0 && (
                                <p className="text-xs text-gray-400">+{extra.delivery_days_extra} day{extra.delivery_days_extra !== 1 ? 's' : ''}</p>
                              )}
                            </div>
                            <span className="text-xs font-semibold text-navy-900">+{formatCurrency(extra.price)}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Total */}
                  {selectedExtras.length > 0 && (
                    <div className="flex items-center justify-between py-3 border-t border-gray-100 mb-3">
                      <span className="text-sm font-medium text-navy-900">Total</span>
                      <span className="text-lg font-bold text-navy-900">{formatCurrency(totalPrice)}</span>
                    </div>
                  )}

                  <Button fullWidth loading={orderLoading} onClick={handleOrder} size="lg">
                    Continue ({formatCurrency(totalPrice)}) <ArrowRight className="w-4 h-4" />
                  </Button>

                  <button onClick={handleContact}
                    className="w-full mt-2 py-2.5 text-sm text-gray-500 hover:text-navy-900 flex items-center justify-center gap-2 transition-colors">
                    <MessageSquare className="w-4 h-4" /> Contact seller
                  </button>

                  <p className="text-center text-xs text-gray-400 mt-3">
                    🔒 Secure payment via escrow. Money released only when you approve.
                  </p>
                </div>
              </div>

              {/* Seller Quick Stats */}
              <div className="bg-white rounded-2xl border border-gray-100 p-4 mt-4">
                <div className="space-y-3">
                  {[
                    { icon: Star, label: 'Rating', value: gig.average_rating > 0 ? `${gig.average_rating.toFixed(1)} ★` : 'No reviews' },
                    { icon: Clock, label: 'Avg response', value: `${sellerProfile?.response_time_hours || 24}h` },
                    { icon: Globe, label: 'From', value: seller?.country || 'Global' },
                    { icon: Calendar, label: 'Member since', value: formatDate(seller?.created_at) },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Icon className="w-3.5 h-3.5" /> {label}
                      </div>
                      <span className="font-medium text-navy-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
