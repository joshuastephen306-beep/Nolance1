'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { formatCurrency, timeAgo } from '@/utils'
import { Store, Plus, Eye, Edit, Trash2, Search, Package } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const STATUS_TABS = [
  { value: '', label: 'All listings' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending review' },
  { value: 'sold', label: 'Sold' },
  { value: 'removed', label: 'Removed' },
]

const STATUS_STYLES: Record<string, string> = {
  active: 'badge-green', pending: 'badge-amber',
  sold: 'badge-blue', removed: 'badge-red', draft: 'badge-gray',
}

const CATEGORY_ICONS: Record<string, string> = {
  social_media: '📱', domain: '🌐', template: '🎨',
  digital_product: '📦', software: '💻', source_code: '⚙️',
  ebook: '📚', physical: '📬', other: '🔧',
}

export default function DashboardMarketplacePage() {
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => { fetchListings() }, [statusFilter])

  const fetchListings = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ seller: 'me' })
      if (statusFilter) params.set('status', statusFilter)
      const res = await axios.get(`/api/marketplace?${params}`)
      setListings(res.data.data || [])
    } catch {}
    setLoading(false)
  }

  const handleDelete = async (listingId: string) => {
    if (!confirm('Remove this listing? This cannot be undone.')) return
    try {
      await axios.delete(`/api/marketplace/${listingId}`)
      toast.success('Listing removed')
      fetchListings()
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to remove listing')
    }
  }

  const filtered = listings.filter(l =>
    !search || l.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-navy-900">My Marketplace Listings</h1>
            <p className="text-sm text-gray-400 mt-0.5">{listings.length} total listings</p>
          </div>
          <Link href="/marketplace/sell">
            <Button><Plus className="w-4 h-4" /> Create listing</Button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search listings..." className="input pl-9" />
        </div>

        {/* Status Tabs */}
        <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 mb-5 overflow-x-auto scrollbar-hide">
          {STATUS_TABS.map(tab => (
            <button key={tab.value} onClick={() => setStatusFilter(tab.value)}
              className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap flex-shrink-0 transition-colors ${statusFilter === tab.value ? 'bg-navy-900 text-white font-medium' : 'text-gray-500 hover:text-navy-900 hover:bg-gray-50'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse"/>)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Store className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <h3 className="font-medium text-navy-900 mb-1">No listings found</h3>
            <p className="text-sm text-gray-400 mb-4">Create your first listing to start selling on the Marketplace</p>
            <Link href="/marketplace/sell"><Button>Create a listing</Button></Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(listing => (
              <div key={listing.id} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-4">
                {/* Icon */}
                <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                  {listing.screenshots?.[0] ? (
                    <img src={listing.screenshots[0]} alt="" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    CATEGORY_ICONS[listing.category] || '📦'
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`badge text-xs ${STATUS_STYLES[listing.status] || 'badge-gray'}`}>{listing.status}</span>
                    <span className="text-xs text-gray-400 capitalize">{listing.category?.replace('_', ' ')}</span>
                  </div>
                  <p className="text-sm font-medium text-navy-900 line-clamp-1 mb-0.5">{listing.title}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3"/>{listing.views || 0} views</span>
                    <span>{timeAgo(listing.created_at)}</span>
                    {listing.status === 'sold' && <span className="text-green-600 font-medium">Sold ✓</span>}
                  </div>
                </div>

                {/* Price & Actions */}
                <div className="text-right flex-shrink-0">
                  <p className="text-base font-bold text-navy-900 mb-2">{formatCurrency(listing.price)}</p>
                  <div className="flex items-center gap-1.5">
                    {listing.status === 'active' && (
                      <Link href={`/marketplace/listing/${listing.slug}`}>
                        <button className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:text-navy-900 transition-colors">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </Link>
                    )}
                    {['pending', 'active'].includes(listing.status) && (
                      <button className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:text-navy-900 transition-colors">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {listing.status !== 'sold' && (
                      <button onClick={() => handleDelete(listing.id)}
                        className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center text-red-400 hover:border-red-300 hover:bg-red-50 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {listings.length > 0 && (
          <div className="mt-6 grid grid-cols-3 gap-4">
            {[
              { label: 'Total listings', value: listings.length },
              { label: 'Active listings', value: listings.filter(l => l.status === 'active').length },
              { label: 'Total sold', value: listings.filter(l => l.status === 'sold').length },
            ].map(stat => (
              <div key={stat.label} className="bg-white border border-gray-100 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-navy-900">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
