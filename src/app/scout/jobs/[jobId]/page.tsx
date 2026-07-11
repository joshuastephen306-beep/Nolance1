'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Avatar, LevelBadge, StarRating, Badge } from '@/components/ui'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDate, timeAgo } from '@/utils'
import { useAuthStore } from '@/store/auth.store'
import { Clock, DollarSign, Users, Calendar, ChevronLeft, Send, FileText, Check } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function ScoutJobPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [job, setJob] = useState<any>(null)
  const [proposals, setProposals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showProposalForm, setShowProposalForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [proposal, setProposal] = useState({ cover_letter: '', bid_amount: '', delivery_days: '', portfolio_samples: '', questions: '' })

  useEffect(() => { fetchJob() }, [jobId])

  const fetchJob = async () => {
    try {
      const res = await axios.get(`/api/scout/jobs/${jobId}`)
      setJob(res.data.data)
      // Check if already applied
      if (isAuthenticated) {
        const propRes = await axios.get(`/api/scout/proposals?my_proposals=true`)
        const applied = propRes.data.data?.find((p: any) => p.job_id === jobId)
        setHasApplied(!!applied)
      }
      // Get proposals if buyer
      if (res.data.data?.buyer_id === user?.id) {
        const propRes = await axios.get(`/api/scout/proposals?job_id=${jobId}`)
        setProposals(propRes.data.data || [])
      }
    } catch { router.push('/scout') }
    setLoading(false)
  }

  const handleSubmitProposal = async () => {
    if (!proposal.cover_letter || proposal.cover_letter.length < 100) {
      toast.error('Cover letter must be at least 100 characters')
      return
    }
    if (!proposal.bid_amount || !proposal.delivery_days) {
      toast.error('Bid amount and delivery days are required')
      return
    }
    setSubmitting(true)
    try {
      await axios.post('/api/scout/proposals', {
        job_id: jobId,
        cover_letter: proposal.cover_letter,
        bid_amount: Number(proposal.bid_amount),
        delivery_days: Number(proposal.delivery_days),
        questions: proposal.questions || null,
      })
      toast.success('Proposal submitted successfully!')
      setHasApplied(true)
      setShowProposalForm(false)
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to submit proposal')
    }
    setSubmitting(false)
  }

  const handleMessageSeller = async (sellerId: string) => {
    try {
      const res = await axios.post('/api/messages', { recipient_id: sellerId })
      router.push(`/dashboard/messages?conv=${res.data.data.conversation_id}`)
    } catch { toast.error('Failed to open conversation') }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50"><Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/2" />
        <div className="h-64 bg-gray-200 rounded-2xl" />
      </div>
    </div>
  )
  if (!job) return null

  const isBuyer = job.buyer_id === user?.id
  const skills = job.required_skills || []

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        <Link href="/scout" className="flex items-center gap-1 text-sm text-gray-400 hover:text-navy-900 mb-5 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to jobs
        </Link>

        <div className="grid md:grid-cols-3 gap-5">

          {/* Main Content */}
          <div className="md:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className={`badge text-xs ${job.budget_type === 'fixed' ? 'badge-green' : 'badge-blue'}`}>
                  {job.budget_type === 'fixed' ? 'Fixed price' : 'Hourly'}
                </span>
                <span className="badge badge-green text-xs">Open</span>
                <span className="text-xs text-gray-400">Posted {timeAgo(job.created_at)}</span>
              </div>

              <h1 className="text-xl font-semibold text-navy-900 mb-4">{job.title}</h1>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                <div className="text-center bg-gray-50 rounded-xl p-3">
                  <DollarSign className="w-4 h-4 text-green-500 mx-auto mb-1" />
                  <p className="text-sm font-bold text-navy-900">
                    {job.budget_min ? formatCurrency(job.budget_min) : 'Open'}
                    {job.budget_max && job.budget_min !== job.budget_max ? `–${formatCurrency(job.budget_max)}` : ''}
                  </p>
                  <p className="text-xs text-gray-400">{job.budget_type === 'fixed' ? 'Fixed' : '/hr'}</p>
                </div>
                <div className="text-center bg-gray-50 rounded-xl p-3">
                  <Clock className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                  <p className="text-sm font-bold text-navy-900">{job.duration || 'Flexible'}</p>
                  <p className="text-xs text-gray-400">Duration</p>
                </div>
                <div className="text-center bg-gray-50 rounded-xl p-3">
                  <Users className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                  <p className="text-sm font-bold text-navy-900">{job.proposal_count}</p>
                  <p className="text-xs text-gray-400">Proposals</p>
                </div>
                <div className="text-center bg-gray-50 rounded-xl p-3">
                  <Calendar className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                  <p className="text-sm font-bold text-navy-900">{job.deadline ? formatDate(job.deadline) : 'Flexible'}</p>
                  <p className="text-xs text-gray-400">Deadline</p>
                </div>
              </div>

              <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-line mb-5">
                {job.description}
              </div>

              {skills.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-navy-900 mb-2">Required skills</p>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill: string) => (
                      <span key={skill} className="badge badge-navy">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Proposals Section (Buyer view) */}
            {isBuyer && proposals.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h2 className="font-semibold text-navy-900 mb-4">Proposals ({proposals.length})</h2>
                <div className="space-y-4">
                  {proposals.map((prop: any) => {
                    const seller = prop.seller
                    const sp = seller?.seller_profile
                    return (
                      <div key={prop.id} className="border border-gray-100 rounded-xl p-4">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <Avatar user={seller} size="md" />
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-navy-900">{seller?.display_name || seller?.username}</p>
                                {sp?.level && <LevelBadge level={sp.level} />}
                              </div>
                              {sp?.average_rating > 0 && <StarRating rating={sp.average_rating} count={sp.total_reviews} />}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-lg font-bold text-navy-900">{formatCurrency(prop.bid_amount)}</p>
                            <p className="text-xs text-gray-400">{prop.delivery_days} days delivery</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-3">{prop.cover_letter}</p>
                        <Button size="sm" onClick={() => handleMessageSeller(seller.id)}>
                          <Send className="w-3.5 h-3.5" /> Message seller
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Proposal Form */}
            {showProposalForm && !isBuyer && (
              <div className="bg-white rounded-2xl border border-green-200 p-5">
                <h2 className="font-semibold text-navy-900 mb-4">Submit your proposal</h2>
                <div className="space-y-4">
                  <div>
                    <label className="input-label">Cover letter <span className="text-red-400">*</span></label>
                    <textarea value={proposal.cover_letter} onChange={e => setProposal(p => ({ ...p, cover_letter: e.target.value }))}
                      placeholder="Tell the buyer why you're the best fit for this project. Be specific about your relevant experience..."
                      className="textarea h-32" />
                    <p className="input-hint">{proposal.cover_letter.length}/2000 characters (minimum 100)</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="input-label">Your bid ({job.budget_type === 'fixed' ? 'total' : 'per hour'})</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                        <input type="number" min={1} value={proposal.bid_amount}
                          onChange={e => setProposal(p => ({ ...p, bid_amount: e.target.value }))}
                          className="input pl-7" placeholder="0.00" />
                      </div>
                    </div>
                    <div>
                      <label className="input-label">Delivery time (days)</label>
                      <input type="number" min={1} value={proposal.delivery_days}
                        onChange={e => setProposal(p => ({ ...p, delivery_days: e.target.value }))}
                        className="input" placeholder="7" />
                    </div>
                  </div>
                  <div>
                    <label className="input-label">Questions for the buyer (optional)</label>
                    <textarea value={proposal.questions} onChange={e => setProposal(p => ({ ...p, questions: e.target.value }))}
                      placeholder="Any clarifying questions you have before starting..." className="textarea h-20" />
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setShowProposalForm(false)}>Cancel</Button>
                    <Button loading={submitting} onClick={handleSubmitProposal} fullWidth>
                      <Send className="w-4 h-4" /> Submit proposal
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            {/* Apply Card */}
            {!isBuyer && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                {hasApplied ? (
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Check className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="text-sm font-medium text-navy-900 mb-1">Proposal submitted!</p>
                    <p className="text-xs text-gray-400 mb-4">The buyer will review your proposal</p>
                    <Link href="/scout/my-proposals">
                      <Button variant="outline" fullWidth size="sm">View my proposals</Button>
                    </Link>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-navy-900 mb-1">Ready to apply?</p>
                    <p className="text-xs text-gray-400 mb-4">Submit a proposal to be considered for this project</p>
                    {!isAuthenticated ? (
                      <Link href="/auth/login"><Button fullWidth>Sign in to apply</Button></Link>
                    ) : (
                      <Button fullWidth onClick={() => setShowProposalForm(true)}>
                        <Send className="w-4 h-4" /> Submit proposal
                      </Button>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Buyer Info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-semibold text-navy-900 mb-3">About the buyer</h3>
              <div className="flex items-center gap-3 mb-4">
                <Avatar user={job.buyer} size="md" />
                <div>
                  <p className="text-sm font-medium text-navy-900">{job.buyer?.display_name || job.buyer?.username}</p>
                  <p className="text-xs text-gray-400">{job.buyer?.country || 'Global'}</p>
                </div>
              </div>
              {job.buyer?.seller_profile && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Rating</span>
                    <span className="font-medium">{job.buyer.seller_profile.average_rating?.toFixed(1) || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total reviews</span>
                    <span className="font-medium">{job.buyer.seller_profile.total_reviews || 0}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Job Details */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-semibold text-navy-900 mb-3">Job details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Posted</span><span>{timeAgo(job.created_at)}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Expires</span><span>{formatDate(job.expires_at)}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Proposals</span><span>{job.proposal_count}</span></div>
                {job.min_seller_level && job.min_seller_level !== 'new' && (
                  <div className="flex justify-between"><span className="text-gray-400">Required level</span><LevelBadge level={job.min_seller_level} /></div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
