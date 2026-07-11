'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { formatCurrency, timeAgo } from '@/utils'
import { Search, Plus, Briefcase, Send, ChevronRight, Users, Clock } from 'lucide-react'
import axios from 'axios'

export default function DashboardScoutPage() {
  const [myJobs, setMyJobs] = useState<any[]>([])
  const [myProposals, setMyProposals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'jobs' | 'proposals'>('proposals')

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [jobsRes, propsRes] = await Promise.all([
        axios.get('/api/scout/jobs?my_jobs=true').catch(() => ({ data: { data: [] } })),
        axios.get('/api/scout/proposals?my_proposals=true'),
      ])
      setMyJobs(jobsRes.data.data || [])
      setMyProposals(propsRes.data.data || [])
    } catch {}
    setLoading(false)
  }

  const STATUS_STYLES: Record<string, string> = {
    pending: 'badge-amber', accepted: 'badge-green', declined: 'badge-red',
    withdrawn: 'badge-gray', expired: 'badge-gray', open: 'badge-green',
    in_progress: 'badge-blue', completed: 'badge-gray', cancelled: 'badge-red',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-navy-900">Scout Dashboard</h1>
            <p className="text-sm text-gray-400 mt-0.5">Manage your proposals and job posts</p>
          </div>
          <div className="flex gap-2">
            <Link href="/scout"><Button variant="outline"><Search className="w-4 h-4" /> Browse jobs</Button></Link>
            <Link href="/scout/post-job"><Button><Plus className="w-4 h-4" /> Post a job</Button></Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Active proposals', value: myProposals.filter(p => p.status === 'pending').length, icon: Send },
            { label: 'Accepted proposals', value: myProposals.filter(p => p.status === 'accepted').length, icon: Briefcase },
            { label: 'Jobs posted', value: myJobs.length, icon: Plus },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white border border-gray-100 rounded-xl p-4 text-center">
              <Icon className="w-5 h-5 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-navy-900">{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-5">
          {[
            { id: 'proposals', label: `My Proposals (${myProposals.length})` },
            { id: 'jobs', label: `Jobs I Posted (${myJobs.length})` },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-3 text-sm border-b-2 transition-colors ${activeTab === tab.id ? 'border-green-500 text-green-600 font-medium' : 'border-transparent text-gray-500 hover:text-navy-900'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse"/>)}</div>
        ) : (
          <>
            {/* My Proposals */}
            {activeTab === 'proposals' && (
              myProposals.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                  <Send className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <h3 className="font-medium text-navy-900 mb-1">No proposals yet</h3>
                  <p className="text-sm text-gray-400 mb-4">Browse Scout jobs and submit proposals to get started</p>
                  <Link href="/scout"><Button>Browse jobs</Button></Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {myProposals.map(prop => (
                    <Link key={prop.id} href={`/scout/jobs/${prop.job_id}`}
                      className="flex items-start gap-4 bg-white border border-gray-100 rounded-xl p-4 hover:border-green-300 transition-all">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`badge text-xs ${STATUS_STYLES[prop.status] || 'badge-gray'}`}>{prop.status}</span>
                          <span className="text-xs text-gray-400">{timeAgo(prop.created_at)}</span>
                        </div>
                        <p className="text-sm font-semibold text-navy-900 line-clamp-1 mb-0.5">
                          {prop.job?.title || 'Job no longer available'}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-1">{prop.cover_letter}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-base font-bold text-navy-900">{formatCurrency(prop.bid_amount)}</p>
                        <p className="text-xs text-gray-400">{prop.delivery_days} days</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 self-center flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              )
            )}

            {/* My Jobs */}
            {activeTab === 'jobs' && (
              myJobs.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                  <Briefcase className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <h3 className="font-medium text-navy-900 mb-1">No jobs posted</h3>
                  <p className="text-sm text-gray-400 mb-4">Post a job to receive proposals from qualified sellers</p>
                  <Link href="/scout/post-job"><Button>Post a job</Button></Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {myJobs.map(job => (
                    <Link key={job.id} href={`/scout/jobs/${job.id}`}
                      className="flex items-start gap-4 bg-white border border-gray-100 rounded-xl p-4 hover:border-green-300 transition-all">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`badge text-xs ${STATUS_STYLES[job.status] || 'badge-gray'}`}>{job.status}</span>
                          <span className="text-xs text-gray-400">{timeAgo(job.created_at)}</span>
                        </div>
                        <p className="text-sm font-semibold text-navy-900 mb-1 line-clamp-1">{job.title}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><Users className="w-3 h-3"/>{job.proposal_count} proposals</span>
                          {job.budget_min && <span>{formatCurrency(job.budget_min)}+</span>}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 self-center flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  )
}
