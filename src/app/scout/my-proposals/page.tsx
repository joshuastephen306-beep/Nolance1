'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { formatCurrency, timeAgo } from '@/utils'
import { Send, Clock, Check, X, ChevronRight } from 'lucide-react'
import axios from 'axios'

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'declined', label: 'Declined' },
  { value: 'withdrawn', label: 'Withdrawn' },
]

const STATUS_STYLES: Record<string, string> = {
  pending: 'badge-amber', accepted: 'badge-green',
  declined: 'badge-red', withdrawn: 'badge-gray', expired: 'badge-gray',
}

export default function MyProposalsPage() {
  const [proposals, setProposals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => { fetchProposals() }, [])

  const fetchProposals = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/scout/proposals?my_proposals=true')
      setProposals(res.data.data || [])
    } catch {}
    setLoading(false)
  }

  const filtered = statusFilter ? proposals.filter(p => p.status === statusFilter) : proposals

  const handleWithdraw = async (proposalId: string) => {
    try {
      await axios.patch(`/api/scout/proposals/${proposalId}`, { action: 'withdraw' })
      fetchProposals()
    } catch {}
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-navy-900">My Proposals</h1>
            <p className="text-sm text-gray-400 mt-0.5">{proposals.length} total proposals submitted</p>
          </div>
          <Link href="/scout"><Button variant="outline"><Send className="w-4 h-4" /> Browse jobs</Button></Link>
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
          <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-28 bg-gray-200 rounded-xl animate-pulse"/>)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Send className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <h3 className="font-medium text-navy-900 mb-1">No proposals yet</h3>
            <p className="text-sm text-gray-400 mb-4">Browse Scout jobs and submit proposals to get started</p>
            <Link href="/scout"><Button>Browse jobs</Button></Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(prop => {
              const job = prop.job
              return (
                <div key={prop.id} className="bg-white border border-gray-100 rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`badge text-xs ${STATUS_STYLES[prop.status] || 'badge-gray'}`}>{prop.status}</span>
                        <span className="text-xs text-gray-400">{timeAgo(prop.created_at)}</span>
                      </div>
                      <Link href={`/scout/jobs/${job?.id}`}>
                        <h3 className="text-base font-semibold text-navy-900 hover:text-green-600 transition-colors mb-1 line-clamp-2">
                          {job?.title || 'Job no longer available'}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-500 line-clamp-2">{prop.cover_letter}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-bold text-navy-900">{formatCurrency(prop.bid_amount)}</p>
                      <p className="text-xs text-gray-400">{prop.delivery_days} days delivery</p>
                      <div className="flex items-center gap-2 mt-3 justify-end">
                        <Link href={`/scout/jobs/${job?.id}`}>
                          <Button size="sm" variant="outline">View job</Button>
                        </Link>
                        {prop.status === 'pending' && (
                          <button onClick={() => handleWithdraw(prop.id)}
                            className="text-xs text-red-400 hover:text-red-600 hover:underline">
                            Withdraw
                          </button>
                        )}
                      </div>
                    </div>
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
