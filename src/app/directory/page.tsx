'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Avatar, Badge } from '@/components/ui'
import { Button } from '@/components/ui/Button'
import { timeAgo, formatDate } from '@/utils'
import { useAuthStore } from '@/store/auth.store'
import {
  MapPin, Globe, Phone, Mail, Instagram, Linkedin, Twitter,
  Search, Plus, Building, CheckCircle, Star, ChevronRight,
  ChevronLeft, Briefcase, Send, Calendar, Users
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

// ── DIRECTORY HOME ─────────────────────────────────────────────
export default function DirectoryPage() {
  const { isAuthenticated } = useAuthStore()
  const [businesses, setBusinesses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [country, setCountry] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => { fetchBusinesses() }, [search, country, page])

  const fetchBusinesses = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page) })
      if (search) params.set('q', search)
      if (country) params.set('country', country)
      const res = await axios.get(`/api/directory?${params}`)
      setBusinesses(res.data.data || [])
      setTotal(res.data.total || 0)
    } catch {}
    setLoading(false)
  }

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchBusinesses() }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-navy-900 py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-green-400 text-sm font-semibold uppercase tracking-widest mb-3">NOLANCE DIRECTORY</p>
          <h1 className="text-4xl font-semibold text-white mb-4">Find businesses that need your skills</h1>
          <p className="text-gray-400 text-base mb-8 max-w-xl mx-auto">
            Like Google Maps — but for freelancers. Browse business profiles, discover service needs, and reach out directly.
          </p>
          <form onSubmit={handleSearch} className="flex gap-3 max-w-xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search businesses by name, category, or location..."
                className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-green-500" />
            </div>
            <button type="submit" className="bg-green-500 hover:bg-green-600 text-white px-5 rounded-xl text-sm font-medium transition-colors">Search</button>
          </form>
          <div className="mt-5 flex gap-3 justify-center">
            {isAuthenticated ? (
              <Link href="/directory/register">
                <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20">
                  <Plus className="w-4 h-4" /> List your business
                </Button>
              </Link>
            ) : (
              <Link href="/auth/signup"><Button className="bg-green-500 hover:bg-green-600">Get started free</Button></Link>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b border-gray-100 py-4 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex justify-center gap-8 flex-wrap">
          {[
            { icon: Building, text: `${total.toLocaleString()} businesses listed` },
            { icon: Globe, text: 'Worldwide coverage' },
            { icon: CheckCircle, text: 'Verified profiles' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-sm text-gray-500">
              <Icon className="w-4 h-4 text-green-500" /> {text}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 bg-gray-200 rounded-xl animate-pulse"/>)}
          </div>
        ) : businesses.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Building className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <h3 className="font-medium text-navy-900 mb-1">No businesses found</h3>
            <p className="text-sm text-gray-400 mb-4">Be the first to list your business</p>
            {isAuthenticated && <Link href="/directory/register"><Button>List your business</Button></Link>}
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {businesses.map(biz => (
                <Link key={biz.id} href={`/directory/${biz.slug}`}
                  className="bg-white border border-gray-100 rounded-xl p-5 hover:border-green-300 transition-all hover:shadow-card block">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-navy-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {biz.logo_url ? <img src={biz.logo_url} alt={biz.name} className="w-full h-full object-cover" />
                        : <Building className="w-6 h-6 text-navy-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-sm font-semibold text-navy-900 truncate">{biz.name}</h3>
                        {biz.is_verified && <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />}
                      </div>
                      {biz.plan !== 'free' && (
                        <span className={`badge text-xs ${biz.plan === 'premium' ? 'badge-amber' : 'badge-blue'}`}>
                          {biz.plan}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mb-2 capitalize">{biz.category}</p>
                  {biz.description && <p className="text-xs text-gray-500 line-clamp-2 mb-3">{biz.description}</p>}
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    {biz.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/>{biz.city}</span>}
                    {biz.country && <span>{biz.country}</span>}
                  </div>
                  {biz.service_needs && biz.service_needs.filter((s: any) => s.is_active).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs font-medium text-green-600 flex items-center gap-1">
                        <Briefcase className="w-3 h-3" /> {biz.service_needs.filter((s: any) => s.is_active).length} active service need{biz.service_needs.filter((s: any) => s.is_active).length > 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                </Link>
              ))}
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
