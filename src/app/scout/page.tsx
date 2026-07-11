'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Avatar, LevelBadge, Badge } from '@/components/ui'
import { Button } from '@/components/ui/Button'
import { formatCurrency, timeAgo } from '@/utils'
import { useAuthStore } from '@/store/auth.store'
import { Search, Plus, Clock, DollarSign, Users, Filter, X, Briefcase, ChevronRight } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const DURATION_OPTIONS = [
  { value: '', label: 'Any duration' },
  { value: 'short', label: 'Short term (< 1 week)' },
  { value: 'medium', label: 'Medium (1-4 weeks)' },
  { value: 'long', label: 'Long term (1+ month)' },
]

const BUDGET_TYPES = [
  { value: '', label: 'Any type' },
  { value: 'fixed', label: 'Fixed price' },
  { value: 'hourly', label: 'Hourly rate' },
]

export default function ScoutPage() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [budgetType, setBudgetType] = useState('')
  const [duration, setDuration] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [hasScout, setHasScout] = useState(false)

  useEffect(() => {
    fetchJobs()
    if (isAuthenticated) checkScoutAccess()
  }, [search, budgetType, duration, page])

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page) })
      if (search) params.set('q', search)
      if (budgetType) params.set('budget_type', budgetType)
      if (duration) params.set('duration', duration)
      const res = await axios.get(`/api/scout/jobs?${params}`)
      setJobs(res.data.data || [])
      setTotal(res.data.total || 0)
    } catch {}
    setLoading(false)
  }

  const checkScoutAccess = async () => {
    try {
      const res = await axios.get('/api/users/sections')
      const sections = res.data.data?.map((s: any) => s.section) || []
      setHasScout(sections.includes('scout'))
    } catch {}
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-navy-900 py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-green-400 text-sm font-semibold uppercase tracking-widest mb-3">NOLANCE SCOUT</p>
          <h1 className="text-4xl font-semibold text-white mb-4 leading-tight">
            Find projects. Win work.<br />
            <span className="text-green-400">On your terms.</span>
          </h1>
          <p className="text-gray-400 text-base mb-8 max-w-xl mx-auto">
            Browse jobs posted by buyers, send proposals, and win projects that match your skills.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            {hasScout ? (
              <Link href="/scout/post-job">
                <Button size="lg" className="bg-green-500 hover:bg-green-600">
                  <Plus className="w-4 h-4" /> Post a job
                </Button>
              </Link>
            ) : (
              <Link href="/settings/sections">
                <Button size="lg" className="bg-green-500 hover:bg-green-600">
                  Get Scout access
                </Button>
              </Link>
            )}
            <Link href="/scout/my-proposals">
              <button className="px-7 py-3.5 text-base text-white border border-white/20 rounded-lg hover:border-white/40 transition-colors">
                My proposals
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-100 py-4 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex items-center gap-8 justify-center flex-wrap">
          {[
            { icon: Briefcase, label: `${total.toLocaleString()} open jobs` },
            { icon: DollarSign, label: 'Fixed & hourly projects' },
            { icon: Users, label: 'All skill levels welcome' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-sm text-gray-500">
              <Icon className="w-4 h-4 text-green-500" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">

        {/* Search & Filters */}
        <div className="flex gap-3 mb-5 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search jobs..." className="input pl-9" />
          </div>
          <select value={budgetType} onChange={e => { setBudgetType(e.target.value); setPage(1) }}
            className="select w-auto">
            {BUDGET_TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={duration} onChange={e => { setDuration(e.target.value); setPage(1) }}
            className="select w-auto">
            {DURATION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3,4].map(i=><div key={i} className="h-36 bg-gray-200 rounded-xl animate-pulse"/>)}</div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Briefcase className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <h3 className="font-medium text-navy-900 mb-1">No jobs found</h3>
            <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {jobs.map(job => <JobCard key={job.id} job={job} hasScout={hasScout} />)}
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

function JobCard({ job, hasScout }: { job: any; hasScout: boolean }) {
  const buyer = job.buyer
  const skills = job.required_skills || []

  return (
    <Link href={`/scout/jobs/${job.id}`} className="block bg-white border border-gray-100 rounded-xl p-5 hover:border-green-300 transition-all hover:shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`badge text-xs ${job.budget_type === 'fixed' ? 'badge-green' : 'badge-blue'}`}>
              {job.budget_type === 'fixed' ? 'Fixed price' : 'Hourly'}
            </span>
            {job.min_seller_level && job.min_seller_level !== 'new' && (
              <LevelBadge level={job.min_seller_level} />
            )}
            <span className="text-xs text-gray-400">{timeAgo(job.created_at)}</span>
          </div>
          <h3 className="text-base font-semibold text-navy-900 mb-2 line-clamp-2">{job.title}</h3>
          <p className="text-sm text-gray-500 line-clamp-2 mb-3 leading-relaxed">{job.description}</p>
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {skills.slice(0, 5).map((skill: string) => (
                <span key={skill} className="badge badge-navy text-xs">{skill}</span>
              ))}
              {skills.length > 5 && <span className="text-xs text-gray-400">+{skills.length - 5} more</span>}
            </div>
          )}
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{job.proposal_count} proposals</span>
            {job.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{job.duration}</span>}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          {job.budget_min && (
            <p className="text-lg font-bold text-navy-900">
              {formatCurrency(job.budget_min)}{job.budget_max ? `–${formatCurrency(job.budget_max)}` : '+'}
            </p>
          )}
          <div className="flex items-center gap-2 justify-end mt-2">
            <Avatar user={buyer} size="sm" />
            <span className="text-xs text-gray-400">{buyer?.username}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300 mt-2 ml-auto" />
        </div>
      </div>
    </Link>
  )
}
