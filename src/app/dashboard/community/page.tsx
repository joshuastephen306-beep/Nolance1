'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { Users, MessageCircle, Plus, ChevronRight } from 'lucide-react'
import axios from 'axios'

export default function DashboardCommunityPage() {
  const [communities, setCommunities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMyCommunities()
  }, [])

  const fetchMyCommunities = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/community')
      const all = res.data.data || []
      setCommunities(all.filter((c: any) => c.is_member))
    } catch {}
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-navy-900">My Communities</h1>
            <p className="text-sm text-gray-400 mt-0.5">{communities.length} communities joined</p>
          </div>
          <Link href="/community"><Button variant="outline"><Plus className="w-4 h-4" /> Discover communities</Button></Link>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 gap-4">{[1,2,3,4].map(i=><div key={i} className="h-36 bg-gray-200 rounded-xl animate-pulse"/>)}</div>
        ) : communities.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <h3 className="font-medium text-navy-900 mb-1">No communities joined</h3>
            <p className="text-sm text-gray-400 mb-4">Join communities to connect with buyers and sellers in your field</p>
            <Link href="/community"><Button>Discover communities</Button></Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {communities.map(community => (
              <Link key={community.id} href={`/community/${community.slug}`}
                className="bg-white border border-gray-100 rounded-xl p-5 hover:border-green-300 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-navy-50 rounded-xl flex items-center justify-center text-lg">
                    {community.name.toLowerCase().includes('design') ? '🎨' :
                     community.name.toLowerCase().includes('tech') || community.name.toLowerCase().includes('dev') ? '💻' :
                     community.name.toLowerCase().includes('market') ? '📣' : '💼'}
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
                <h3 className="font-semibold text-navy-900 mb-1">{community.name}</h3>
                {community.description && <p className="text-xs text-gray-400 mb-3 line-clamp-2">{community.description}</p>}
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3"/>{community.member_count?.toLocaleString()}</span>
                  <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3"/>{community.post_count?.toLocaleString()}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
