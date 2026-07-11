'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Avatar, LevelBadge, Badge } from '@/components/ui'
import { Button } from '@/components/ui/Button'
import { formatCurrency, timeAgo } from '@/utils'
import { useAuthStore } from '@/store/auth.auth'
import { Store, Plus, Search, Filter, ShoppingCart, Shield, Zap, ArrowRight } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { value: '', label: 'All items' },
  { value: 'social_media', label: '📱 Social Media Accounts' },
  { value: 'domain', label: '🌐 Domains & Websites' },
  { value: 'template', label: '🎨 Templates' },
  { value: 'digital_product', label: '📦 Digital Products' },
  { value: 'software', label: '💻 Software & Licenses' },
  { value: 'source_code', label: '⚙️ Source Code' },
  { value: 'ebook', label: '📚 E-books & Guides' },
  { value: 'physical', label: '📬 Physical Items' },
  { value: 'other', label: '🔧 Other' },
]

export default function MarketplacePage() {
  const { isAuthenticated } = useAuthStore()
  const [listings, setListings] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)

  useEffect(() => { fetchListings() }, [category, sort, page])

  const fetchListings = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ sort, page: String(page) })
      if (category) params.set('category', category)
      if (search) params.set('q', search)
      const res = await axios.get(`/api/marketplace?${params}`)
      setListings(res.data.data || [])
      setTotal(res.data.total || 0)
    } catch {}
    setLoading(false)
  }

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchListings() }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-navy-900 py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-green-400 text-sm font-semibold uppercase tracking-widest mb-3">NOLANCE MARKETPLACE</p>
          <h1 className="text-4xl font-semibold text-white mb-4">Buy and sell digital assets</h1>
          <p className="text-gray-400 text-base mb-8 max-w-xl mx-auto">
            Social media accounts, domains, templates, source code, e-books and more. 1–2 day clearance.
          </p>
          <div className="flex gap-3 justify-center">
            {isAuthenticated ? (
              <Link href="/marketplace/sell">
                <Button size="lg" className="bg-green-500 hover:bg-green-600">
                  <Plus className="w-4 h-4" /> Sell an item
                </Button>
              </Link>
            ) : (
              <Link href="/auth/signup"><Button size="lg" className="bg-green-500 hover:bg-green-600">Get started</Button></Link>
            )}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white border-b border-gray-100 py-4 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex justify-center gap-8 flex-wrap">
          {[
            { icon: Shield, text: 'Escrow protected' },
            { icon: Zap, text: '1–2 day clearance' },
            { icon: Store, text: 'Only 5% commission' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-sm text-gray-500">
              <Icon className="w-4 h-4 text-green-500" /> {text}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Search & Filters */}
        <div className="flex gap-3 mb-5 flex-wrap">
          <form onSubmit={handleSearch} className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search listings..." className="input pl-9" />
          </form>
          <select value={sort} onChange={e => { setSort(e.target.value); setPage(1) }} className="select w-auto">
            <option value="newest">Newest first</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="most_viewed">Most viewed</option>
          </select>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button key={cat.value} onClick={() => { setCategory(cat.value); setPage(1) }}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap flex-shrink-0 transition-colors border ${category === cat.value ? 'bg-navy-900 text-white border-navy-900' : 'bg-white border-gray-200 text-gray-600 hover:border-green-400'}`}>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1,2,3,4,5,6,7,8].map(i=><div key={i} className="h-56 bg-gray-200 rounded-xl animate-pulse"/>)}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Store className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <h3 className="font-medium text-navy-900 mb-1">No listings found</h3>
            <p className="text-sm text-gray-400 mb-4">Be the first to sell in this category</p>
            {isAuthenticated && <Link href="/marketplace/sell"><Button>Sell an item</Button></Link>}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {listings.map(listing => (
                <Link key={listing.id} href={`/marketplace/listing/${listing.slug}`} className="card-hover block overflow-hidden">
                  <div className="h-40 bg-gray-100 relative">
                    {listing.screenshots?.[0] ? (
                      <img src={listing.screenshots[0]} alt={listing.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-navy-100 to-green-50 flex items-center justify-center text-3xl">
                        {CATEGORIES.find(c => c.value === listing.category)?.label?.split(' ')[0] || '📦'}
                      </div>
                    )}
                    <span className="absolute top-2 left-2 badge badge-green text-xs capitalize">
                      {listing.delivery_type === 'instant' ? '⚡ Instant' : listing.delivery_type}
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-navy-900 line-clamp-2 mb-2">{listing.title}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Avatar user={listing.seller} size="sm" />
                        <span className="text-xs text-gray-400">{listing.seller?.username}</span>
                      </div>
                      <p className="text-sm font-bold text-navy-900">{formatCurrency(listing.price)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {total > 20 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                <span className="flex items-center px-4 text-sm text-gray-500">Page {page}</span>
                <Button variant="outline" disabled={listings.length < 20} onClick={() => setPage(p => p + 1)}>Next</Button>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  )
}
