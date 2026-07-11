'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/utils'
import { ChevronLeft, Eye, MousePointer, ShoppingCart, Star, TrendingUp, DollarSign } from 'lucide-react'
import axios from 'axios'

export default function GigAnalyticsPage() {
  const { slug } = useParams<{ slug: string }>()
  const [gig, setGig] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchGig() }, [slug])

  const fetchGig = async () => {
    try {
      const res = await axios.get(`/api/gigs/${slug}`)
      setGig(res.data.data)
    } catch {}
    setLoading(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50"><Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48"/><div className="h-64 bg-gray-200 rounded-2xl"/>
      </div>
    </div>
  )
  if (!gig) return null

  const convRate = gig.clicks > 0 ? ((gig.orders_count / gig.clicks) * 100).toFixed(1) : '0.0'

  const STATS = [
    { icon: Eye, label: 'Total impressions', value: gig.impressions?.toLocaleString() || '0', color: 'text-blue-500 bg-blue-50', sub: 'Times shown in search' },
    { icon: MousePointer, label: 'Total clicks', value: gig.clicks?.toLocaleString() || '0', color: 'text-purple-500 bg-purple-50', sub: 'Times clicked' },
    { icon: ShoppingCart, label: 'Total orders', value: gig.orders_count?.toLocaleString() || '0', color: 'text-green-500 bg-green-50', sub: 'Orders received' },
    { icon: TrendingUp, label: 'Conversion rate', value: `${convRate}%`, color: 'text-amber-500 bg-amber-50', sub: 'Clicks to orders' },
    { icon: Star, label: 'Average rating', value: gig.average_rating > 0 ? `${gig.average_rating.toFixed(1)}★` : '—', color: 'text-yellow-500 bg-yellow-50', sub: `${gig.total_reviews} reviews` },
    { icon: DollarSign, label: 'Est. earnings', value: formatCurrency(gig.orders_count * (gig.packages?.[0]?.price || 0) * 0.85), color: 'text-emerald-500 bg-emerald-50', sub: '85% of gross sales' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/dashboard/gigs" className="flex items-center gap-1 text-sm text-gray-400 hover:text-navy-900 mb-5 transition-colors">
          <ChevronLeft className="w-4 h-4" /> My Gigs
        </Link>

        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <h1 className="text-xl font-semibold text-navy-900 mb-1">Gig Analytics</h1>
            <p className="text-sm text-gray-400 line-clamp-1">{gig.title}</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Link href={`/gig/${gig.slug}`}><Button variant="outline" size="sm">View gig</Button></Link>
            <Link href={`/gigs/edit/${gig.slug}`}><Button size="sm">Edit gig</Button></Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {STATS.map(({ icon: Icon, label, value, color, sub }) => (
            <div key={label} className="bg-white border border-gray-100 rounded-xl p-5">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-navy-900 mb-0.5">{value}</p>
              <p className="text-xs font-medium text-navy-700">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* Performance Tips */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-5">
          <h3 className="font-semibold text-navy-900 mb-4">Performance tips</h3>
          <div className="space-y-3">
            {[
              { cond: gig.gallery?.length === 0, tip: 'Add images to your gig — gigs with images get 60% more clicks', urgent: true },
              { cond: (gig.tags?.length || 0) < 14, tip: `Add ${14 - (gig.tags?.length || 0)} more search tags — you are using ${gig.tags?.length || 0}/14`, urgent: true },
              { cond: !gig.gallery?.find((g: any) => g.type === 'video'), tip: 'Add a gig video — sellers with videos get 40% more orders', urgent: false },
              { cond: (gig.faqs?.length || 0) < 3, tip: 'Add more FAQs — they increase buyer confidence and reduce pre-order questions', urgent: false },
              { cond: Number(convRate) < 2, tip: `Your conversion rate (${convRate}%) is below average. Consider improving your title, thumbnail, and package pricing.`, urgent: true },
            ].filter(t => t.cond).map(({ tip, urgent }, i) => (
              <div key={i} className={`flex items-start gap-2 p-3 rounded-lg ${urgent ? 'bg-amber-50 border border-amber-100' : 'bg-blue-50 border border-blue-100'}`}>
                <span className={`text-xs font-bold flex-shrink-0 mt-0.5 ${urgent ? 'text-amber-600' : 'text-blue-600'}`}>{urgent ? '!' : 'i'}</span>
                <p className={`text-xs leading-relaxed ${urgent ? 'text-amber-700' : 'text-blue-700'}`}>{tip}</p>
              </div>
            ))}
            {gig.gallery?.length > 0 && (gig.tags?.length || 0) === 14 && gig.gallery?.find((g: any) => g.type === 'video') && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-100">
                <span className="text-green-500 text-sm">✓</span>
                <p className="text-xs text-green-700">Your gig is well optimized! Keep maintaining high response rates and on-time delivery to boost rankings.</p>
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        {gig.tags && gig.tags.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <h3 className="font-semibold text-navy-900 mb-3">Search tags ({gig.tags.length}/14)</h3>
            <div className="flex flex-wrap gap-2">
              {gig.tags.map((t: any) => (
                <span key={t.tag} className="badge badge-navy text-xs">{t.tag}</span>
              ))}
              {gig.tags.length < 14 && (
                <Link href={`/gigs/edit/${gig.slug}`}>
                  <span className="badge badge-amber text-xs cursor-pointer hover:opacity-80">+ Add {14 - gig.tags.length} more</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
