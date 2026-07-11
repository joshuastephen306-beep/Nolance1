'use client'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Avatar, LevelBadge, StarRating } from '@/components/ui'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/utils'
import { Search, SlidersHorizontal, X, Heart } from 'lucide-react'
import axios from 'axios'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get('q') || ''
  const [gigs, setGigs] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('best_selling')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => { if (query) fetchResults() }, [query, sort, minPrice, maxPrice, page])

  const fetchResults = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ q: query, sort, page: String(page) })
      if (minPrice) params.set('min_price', minPrice)
      if (maxPrice) params.set('max_price', maxPrice)
      const res = await axios.get(`/api/gigs?${params}`)
      setGigs(res.data.data || [])
      setTotal(res.data.total || 0)
    } catch {}
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-xl font-semibold text-navy-900 mb-1">
            {query ? `Search results for "${query}"` : 'Browse all services'}
          </h1>
          <p className="text-sm text-gray-400">{total.toLocaleString()} services found</p>

          <div className="flex gap-3 mt-3 flex-wrap">
            <select value={sort} onChange={e => { setSort(e.target.value); setPage(1) }} className="select text-sm py-1.5 w-auto">
              <option value="best_selling">Best selling</option>
              <option value="newest">Newest</option>
              <option value="top_rated">Top rated</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Price:</span>
              <div className="relative"><span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                <input type="number" className="input w-20 pl-5 py-1.5 text-sm" placeholder="Min" value={minPrice} onChange={e => { setMinPrice(e.target.value); setPage(1) }} /></div>
              <span className="text-gray-300">—</span>
              <div className="relative"><span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                <input type="number" className="input w-20 pl-5 py-1.5 text-sm" placeholder="Max" value={maxPrice} onChange={e => { setMaxPrice(e.target.value); setPage(1) }} /></div>
            </div>
            {(minPrice || maxPrice) && (
              <button onClick={() => { setMinPrice(''); setMaxPrice(''); setPage(1) }} className="flex items-center gap-1 text-sm text-red-400 hover:text-red-600">
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {!query ? (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">Enter a search term to find services</p>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1,2,3,4,5,6,7,8].map(i=><div key={i} className="h-56 bg-gray-200 rounded-xl animate-pulse"/>)}
          </div>
        ) : gigs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Search className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <h3 className="font-medium text-navy-900 mb-1">No results for "{query}"</h3>
            <p className="text-sm text-gray-400 mb-4">Try different keywords or browse all categories</p>
            <Link href="/explore"><Button variant="outline">Browse all services</Button></Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {gigs.map(gig => {
                const seller = gig.seller
                const packages = gig.packages || []
                const gallery = gig.gallery || []
                const minPrice = packages.length > 0 ? Math.min(...packages.map((p: any) => p.price)) : 0
                const thumb = gallery.find((g: any) => g.type === 'image')
                return (
                  <Link key={gig.id} href={`/gig/${gig.slug}`} className="card-hover block overflow-hidden">
                    <div className="h-40 bg-gray-100 relative overflow-hidden">
                      {thumb ? <img src={thumb.url} alt={gig.title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-gradient-to-br from-navy-100 to-green-50 flex items-center justify-center text-3xl">🎨</div>}
                      <button className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center">
                        <Heart className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                    </div>
                    <div className="p-3">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Avatar user={seller} size="sm" className="w-5 h-5" />
                        <span className="text-xs text-gray-500 truncate">{seller?.username}</span>
                        {seller?.seller_profile?.level && <LevelBadge level={seller.seller_profile.level} />}
                      </div>
                      <p className="text-sm text-navy-900 line-clamp-2 mb-1.5 leading-snug">{gig.title}</p>
                      {gig.average_rating > 0 && <StarRating rating={gig.average_rating} count={gig.total_reviews} />}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                        <span className="text-xs text-gray-400">From</span>
                        <span className="text-sm font-bold text-navy-900">{formatCurrency(minPrice)}</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
            {total > 20 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                <span className="flex items-center px-4 text-sm text-gray-500">Page {page} of {Math.ceil(total / 20)}</span>
                <Button variant="outline" disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(p => p + 1)}>Next</Button>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  )
}
