'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { formatCurrency, timeAgo } from '@/utils'
import { Plus, Eye, Edit, Pause, Play, Trash2, TrendingUp, BarChart2, Star, Search } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const STATUS_TABS = [
  { value: '', label: 'All gigs' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending review' },
  { value: 'paused', label: 'Paused' },
  { value: 'denied', label: 'Denied' },
  { value: 'draft', label: 'Drafts' },
]

export default function MyGigsPage() {
  const [gigs, setGigs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => { fetchGigs() }, [statusFilter])

  const fetchGigs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ role: 'seller' })
      if (statusFilter) params.set('status', statusFilter)
      const res = await axios.get(`/api/gigs/mine?${params}`)
      setGigs(res.data.data || [])
    } catch {}
    setLoading(false)
  }

  const handleAction = async (gigSlug: string, action: 'pause' | 'activate' | 'delete') => {
    setActionLoading(gigSlug)
    try {
      if (action === 'delete') {
        if (!confirm('Are you sure you want to delete this gig? This cannot be undone.')) return
        await axios.delete(`/api/gigs/${gigSlug}`)
        toast.success('Gig deleted')
      } else {
        await axios.patch(`/api/gigs/${gigSlug}/status`, { status: action === 'pause' ? 'paused' : 'active' })
        toast.success(action === 'pause' ? 'Gig paused' : 'Gig activated')
      }
      fetchGigs()
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Action failed')
    }
    setActionLoading(null)
  }

  const filtered = gigs.filter(g => !search || g.title.toLowerCase().includes(search.toLowerCase()))

  const STATUS_COLORS: Record<string, string> = {
    active: 'badge-green', pending: 'badge-amber', paused: 'badge-gray',
    denied: 'badge-red', draft: 'badge-blue', deleted: 'badge-red',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-navy-900">My Gigs</h1>
            <p className="text-sm text-gray-400 mt-0.5">{gigs.length} total gigs</p>
          </div>
          <Link href="/gigs/create">
            <Button><Plus className="w-4 h-4" /> Create new gig</Button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search gigs..." className="input pl-9" />
        </div>

        {/* Status Filter */}
        <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 mb-5 overflow-x-auto scrollbar-hide">
          {STATUS_TABS.map(tab => (
            <button key={tab.value} onClick={() => setStatusFilter(tab.value)}
              className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap flex-shrink-0 transition-colors ${statusFilter === tab.value ? 'bg-navy-900 text-white font-medium' : 'text-gray-500 hover:text-navy-900 hover:bg-gray-50'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse"/>)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <p className="text-4xl mb-3">🎨</p>
            <h3 className="font-medium text-navy-900 mb-1">No gigs found</h3>
            <p className="text-sm text-gray-400 mb-4">Create your first gig to start getting orders</p>
            <Link href="/gigs/create"><Button>Create a gig</Button></Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(gig => {
              const thumb = gig.gallery?.find((g: any) => g.type === 'image')
              const minPrice = gig.packages ? Math.min(...(gig.packages || []).map((p: any) => p.price)) : 0
              return (
                <div key={gig.id} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-4">
                  {/* Thumb */}
                  <div className="w-20 h-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                    {thumb ? <img src={thumb.url} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-gradient-to-br from-navy-100 to-green-50 flex items-center justify-center text-xl">🎨</div>}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`badge text-xs ${STATUS_COLORS[gig.status] || 'badge-gray'}`}>{gig.status}</span>
                      {gig.is_promoted && <span className="badge badge-amber text-xs">Featured</span>}
                    </div>
                    <p className="text-sm font-medium text-navy-900 line-clamp-1">{gig.title}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{gig.impressions?.toLocaleString()} impressions</span>
                      <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{gig.orders_count} orders</span>
                      {gig.average_rating > 0 && <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" />{gig.average_rating.toFixed(1)}</span>}
                      <span>From {formatCurrency(minPrice)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link href={`/gig/${gig.slug}`}>
                      <button className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:text-navy-900 hover:border-gray-300 transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </Link>
                    <Link href={`/gigs/edit/${gig.slug}`}>
                      <button className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:text-navy-900 hover:border-gray-300 transition-colors">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </Link>
                    <Link href={`/dashboard/gigs/${gig.slug}/analytics`}>
                      <button className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:text-navy-900 hover:border-gray-300 transition-colors">
                        <BarChart2 className="w-3.5 h-3.5" />
                      </button>
                    </Link>
                    {gig.status === 'active' && (
                      <button onClick={() => handleAction(gig.slug, 'pause')} disabled={actionLoading === gig.slug}
                        className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center text-amber-500 hover:border-amber-300 hover:bg-amber-50 transition-colors">
                        <Pause className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {gig.status === 'paused' && (
                      <button onClick={() => handleAction(gig.slug, 'activate')} disabled={actionLoading === gig.slug}
                        className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center text-green-500 hover:border-green-300 hover:bg-green-50 transition-colors">
                        <Play className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button onClick={() => handleAction(gig.slug, 'delete')} disabled={actionLoading === gig.slug}
                      className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center text-red-400 hover:border-red-300 hover:bg-red-50 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
