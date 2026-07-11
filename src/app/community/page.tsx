'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Avatar, LevelBadge, Badge } from '@/components/ui'
import { Button } from '@/components/ui/Button'
import { timeAgo } from '@/utils'
import { useAuthStore } from '@/store/auth.store'
import { Users, TrendingUp, Plus, Search, Heart, MessageCircle, Share2, Briefcase, ChevronRight, Zap } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

// ── COMMUNITY HUB ─────────────────────────────────────────────
export default function CommunityHubPage() {
  const { isAuthenticated } = useAuthStore()
  const [communities, setCommunities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'joined' | 'trending'>('all')

  useEffect(() => { fetchCommunities() }, [search])

  const fetchCommunities = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('q', search)
      const res = await axios.get(`/api/community?${params}`)
      setCommunities(res.data.data || [])
    } catch {}
    setLoading(false)
  }

  const handleJoin = async (communityId: string) => {
    if (!isAuthenticated) { toast.error('Please sign in to join communities'); return }
    try {
      await axios.post(`/api/community/${communityId}/join`, {})
      setCommunities(prev => prev.map(c => c.id === communityId ? { ...c, is_member: true, member_count: c.member_count + 1 } : c))
      toast.success('Joined community!')
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to join')
    }
  }

  const filtered = communities.filter(c => {
    if (activeTab === 'joined') return c.is_member
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-navy-900 py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-green-400 text-sm font-semibold uppercase tracking-widest mb-3">NOLANCE COMMUNITY</p>
          <h1 className="text-4xl font-semibold text-white mb-4">Connect. Share. Grow together.</h1>
          <p className="text-gray-400 text-base mb-8 max-w-xl mx-auto">
            Join topic-based communities. Find clients, share your work, and stay ahead of market trends powered by NOLANCE AI.
          </p>
          <div className="flex gap-3 justify-center">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search communities..."
                className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-green-500 transition-colors" />
            </div>
          </div>
        </div>
      </div>

      {/* Market AI Strip */}
      <div className="bg-green-500 py-3 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Zap className="w-4 h-4 text-white flex-shrink-0" />
          <p className="text-sm text-white font-medium">Trending this week:</p>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide">
            {['Logo Design ↑23%', 'AI Automation ↑41%', 'React Development ↑18%', 'Video Editing ↑12%'].map(t => (
              <span key={t} className="text-sm text-green-100 bg-white/15 px-3 py-0.5 rounded-full whitespace-nowrap">{t}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 mb-5 w-fit">
          {[{ id: 'all', label: 'All communities' }, { id: 'joined', label: 'Joined' }, { id: 'trending', label: 'Trending' }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${activeTab === tab.id ? 'bg-navy-900 text-white font-medium' : 'text-gray-500 hover:text-navy-900 hover:bg-gray-50'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i=><div key={i} className="h-40 bg-gray-200 rounded-xl animate-pulse"/>)}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filtered.map(community => (
              <div key={community.id} className="bg-white border border-gray-100 rounded-xl p-5 hover:border-green-300 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-navy-50 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                    {community.name.split(' ')[0].includes('Design') ? '🎨' :
                     community.name.includes('Tech') || community.name.includes('Dev') ? '💻' :
                     community.name.includes('Market') ? '📣' :
                     community.name.includes('Video') ? '🎬' :
                     community.name.includes('AI') ? '🤖' : '💼'}
                  </div>
                  {community.is_ai_generated && (
                    <span className="badge badge-green text-xs flex items-center gap-1"><Zap className="w-2.5 h-2.5" />AI</span>
                  )}
                </div>
                <h3 className="font-semibold text-navy-900 mb-1">{community.name}</h3>
                {community.description && <p className="text-xs text-gray-400 mb-3 line-clamp-2">{community.description}</p>}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{community.member_count.toLocaleString()}</span>
                    <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{community.post_count.toLocaleString()}</span>
                  </div>
                  {community.is_member ? (
                    <Link href={`/community/${community.slug}`}>
                      <Button size="sm" variant="outline">View <ChevronRight className="w-3 h-3" /></Button>
                    </Link>
                  ) : (
                    <Button size="sm" onClick={() => handleJoin(community.id)}>Join</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
