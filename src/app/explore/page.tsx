'use client'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { StarRating, LevelBadge, Skeleton } from '@/components/ui'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/utils'
import { Gig, GigSearchFilters } from '@/types'
import { SlidersHorizontal, Grid2X2, List, Heart, X } from 'lucide-react'
import axios from 'axios'

const SORT_OPTIONS = [
  { value: 'best_selling', label: 'Best Selling' },
  { value: 'newest', label: 'Newest' },
  { value: 'top_rated', label: 'Top Rated' },
]

const DELIVERY_OPTIONS = [
  { value: '', label: 'Any' },
  { value: '1', label: 'Up to 24 hours' },
  { value: '3', label: 'Up to 3 days' },
  { value: '7', label: 'Up to 7 days' },
]

const LEVEL_OPTIONS = [
  { value: '', label: 'Any level' },
  { value: 'new', label: 'New Seller' },
  { value: 'level1', label: 'Level 1' },
  { value: 'level2', label: 'Level 2' },
  { value: 'top_rated', label: 'Top Rated' },
  { value: 'pro_verified', label: 'Pro Verified' },
]

export default function ExplorePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [gigs, setGigs] = useState<Gig[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)

  const [filters, setFilters] = useState<GigSearchFilters>({
    query: searchParams.get('q') || '',
    sort: 'best_selling',
    page: 1,
    limit: 20,
  })

  useEffect(() => {
    fetchGigs()
  }, [filters])

  const fetchGigs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([k, v]) => { if (v !== undefined && v !== '') params.set(k, String(v)) })
      const res = await axios.get(`/api/gigs?${params}`)
      setGigs(res.data.data || [])
      setTotal(res.data.total || 0)
    } catch {}
    setLoading(false)
  }

  const updateFilter = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const clearFilters = () => {
    setFilters({ query: '', sort: 'best_selling', page: 1, limit: 20 })
  }

  const hasFilters = filters.min_price || filters.max_price || filters.delivery_days || filters.seller_level || filters.min_rating

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Page Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl font-semibold text-navy-900">
                {filters.query ? `Results for "${filters.query}"` : 'Explore all services'}
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">{total.toLocaleString()} services available</p>
            </div>
            <div className="flex items-center gap-3">
              <select value={filters.sort} onChange={e => updateFilter('sort', e.target.value)}
                className="select text-sm py-2 w-auto">
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <button onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
                <SlidersHorizontal className="w-4 h-4" />
                Filters {hasFilters && <span className="bg-green-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">!</span>}
              </button>
              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                <button onClick={() => setView('grid')} className={`p-2 ${view === 'grid' ? 'bg-navy-900 text-white' : 'text-gray-400 hover:bg-gray-50'}`}>
                  <Grid2X2 className="w-4 h-4" />
                </button>
                <button onClick={() => setView('list')} className={`p-2 ${view === 'list' ? 'bg-navy-900 text-white' : 'text-gray-400 hover:bg-gray-50'}`}>
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Price:</span>
                <input type="number" placeholder="Min" className="input w-20 py-1.5 text-sm"
                  value={filters.min_price || ''} onChange={e => updateFilter('min_price', e.target.value ? Number(e.target.value) : undefined)} />
                <span className="text-gray-400">—</span>
                <input type="number" placeholder="Max" className="input w-20 py-1.5 text-sm"
                  value={filters.max_price || ''} onChange={e => updateFilter('max_price', e.target.value ? Number(e.target.value) : undefined)} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Delivery:</span>
                <select className="select text-sm py-1.5 w-auto" value={filters.delivery_days || ''}
                  onChange={e => updateFilter('delivery_days', e.target.value ? Number(e.target.value) : undefined)}>
                  {DELIVERY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Level:</span>
                <select className="select text-sm py-1.5 w-auto" value={filters.seller_level || ''}
                  onChange={e => updateFilter('seller_level', e.target.value || undefined)}>
                  {LEVEL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-sm text-gray-500 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded" checked={!!filters.is_online}
                    onChange={e => updateFilter('is_online', e.target.checked || undefined)} />
                  Online sellers only
                </label>
              </div>
              {hasFilters && (
                <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-red-500 hover:underline">
                  <X className="w-3 h-3" /> Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className={`grid gap-4 ${view === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card overflow-hidden">
                <Skeleton className="h-44 w-full rounded-none" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : gigs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🔍</p>
            <h3 className="text-lg font-medium text-navy-900 mb-2">No gigs found</h3>
            <p className="text-sm text-gray-400 mb-4">Try adjusting your filters or search terms</p>
            <Button variant="outline" onClick={clearFilters}>Clear all filters</Button>
          </div>
        ) : (
          <>
            <div className={`grid gap-4 ${view === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
              {gigs.map(gig => (
                view === 'grid'
                  ? <GigCard key={gig.id} gig={gig} />
                  : <GigListItem key={gig.id} gig={gig} />
              ))}
            </div>

            {/* Pagination */}
            {total > (filters.limit || 20) && (
              <div className="flex justify-center gap-2 mt-10">
                <Button variant="outline" disabled={page === 1} onClick={() => { setPage(p => p - 1); updateFilter('page', page - 1) }}>
                  Previous
                </Button>
                <span className="flex items-center px-4 text-sm text-gray-500">
                  Page {page} of {Math.ceil(total / (filters.limit || 20))}
                </span>
                <Button variant="outline" disabled={page >= Math.ceil(total / (filters.limit || 20))}
                  onClick={() => { setPage(p => p + 1); updateFilter('page', page + 1) }}>
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  )
}

// ── GIG CARD (Grid) ───────────────────────────────────────────
function GigCard({ gig }: { gig: Gig }) {
  const seller = (gig as any).seller
  const packages = (gig as any).packages || []
  const gallery = (gig as any).gallery || []
  const minPrice = packages.length > 0 ? Math.min(...packages.map((p: any) => p.price)) : 0
  const thumb = gallery.find((g: any) => g.type === 'image')

  return (
    <Link href={`/gig/${gig.slug}`} className="card-hover block overflow-hidden">
      {/* Thumbnail */}
      <div className="h-44 bg-gray-100 relative overflow-hidden">
        {thumb ? (
          <img src={thumb.url} alt={gig.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-navy-100 to-green-50 flex items-center justify-center text-3xl">
            🎨
          </div>
        )}
        <button className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors">
          <Heart className="w-3.5 h-3.5 text-gray-400" />
        </button>
        {gig.is_promoted && (
          <span className="absolute top-2 left-2 bg-amber-400 text-white text-xs px-2 py-0.5 rounded-full font-medium">Featured</span>
        )}
      </div>

      {/* Body */}
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          {seller?.profile_photo_url ? (
            <img src={seller.profile_photo_url} alt={seller.username} className="w-5 h-5 rounded-full object-cover" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-navy-800 flex items-center justify-center text-white text-xs font-medium">
              {seller?.username?.[0]?.toUpperCase()}
            </div>
          )}
          <span className="text-xs text-gray-500">{seller?.display_name || seller?.username}</span>
          {seller?.seller_profile?.level && (
            <LevelBadge level={seller.seller_profile.level} />
          )}
        </div>

        <p className="text-sm text-navy-900 line-clamp-2 mb-2 leading-snug">{gig.title}</p>

        {gig.average_rating > 0 && (
          <div className="mb-2">
            <StarRating rating={gig.average_rating} count={gig.total_reviews} />
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-400">Starting from</span>
          <span className="text-sm font-semibold text-navy-900">{formatCurrency(minPrice)}</span>
        </div>
      </div>
    </Link>
  )
}

// ── GIG LIST ITEM ─────────────────────────────────────────────
function GigListItem({ gig }: { gig: Gig }) {
  const seller = (gig as any).seller
  const packages = (gig as any).packages || []
  const gallery = (gig as any).gallery || []
  const minPrice = packages.length > 0 ? Math.min(...packages.map((p: any) => p.price)) : 0
  const thumb = gallery.find((g: any) => g.type === 'image')

  return (
    <Link href={`/gig/${gig.slug}`} className="card-hover flex gap-4 p-4">
      <div className="w-40 h-28 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
        {thumb ? (
          <img src={thumb.url} alt={gig.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-navy-100 to-green-50 flex items-center justify-center text-2xl">🎨</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-gray-500">{seller?.display_name || seller?.username}</span>
          {seller?.seller_profile?.level && <LevelBadge level={seller.seller_profile.level} />}
        </div>
        <h3 className="text-sm font-medium text-navy-900 mb-2 line-clamp-2">{gig.title}</h3>
        {gig.average_rating > 0 && <StarRating rating={gig.average_rating} count={gig.total_reviews} />}
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-xs text-gray-400 mb-1">From</p>
        <p className="text-lg font-semibold text-navy-900">{formatCurrency(minPrice)}</p>
        <Button size="sm" variant="outline" className="mt-2">View gig</Button>
      </div>
    </Link>
  )
}
