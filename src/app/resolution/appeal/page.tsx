'use client'
import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { ChevronLeft, AlertTriangle, CheckCircle } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function AppealPage() {
  const searchParams = useSearchParams()
  const disputeId = searchParams.get('dispute')
  const router = useRouter()
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (!disputeId) { toast.error('No dispute ID found'); return }
    if (!reason || reason.length < 30) { toast.error('Please provide a detailed reason (minimum 30 characters)'); return }
    setLoading(true)
    try {
      await axios.patch('/api/disputes', {
        dispute_id: disputeId,
        action: 'appeal',
        appeal_reason: reason,
      })
      setSubmitted(true)
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to submit appeal')
    }
    setLoading(false)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-navy-900 mb-2">Appeal submitted</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">
            Our team will review your appeal within 5 business days. You will be notified by email with the outcome.
          </p>
          <Link href="/resolution"><Button variant="outline">Back to Resolution Center</Button></Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/resolution" className="flex items-center gap-1 text-sm text-gray-400 hover:text-navy-900 mb-5 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Resolution Center
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-navy-900">Appeal a decision</h1>
              <p className="text-sm text-gray-400">Reviews take up to 5 business days</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5">
            <p className="text-xs text-blue-700 leading-relaxed">
              Appeals are for cases where you believe the resolution was made in error. Provide clear and specific reasons why the outcome should be reconsidered. Frivolous appeals may impact your trust score.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="input-label">Dispute ID</label>
              <input className="input bg-gray-50 text-gray-400" value={disputeId || ''} readOnly />
            </div>
            <div>
              <label className="input-label">Reason for appeal <span className="text-red-400">*</span></label>
              <textarea className="textarea h-32" value={reason} onChange={e => setReason(e.target.value)}
                placeholder="Explain clearly why you believe the resolution was incorrect. Provide any additional evidence or context that was not considered in the original review..." />
              <p className="input-hint">{reason.length} chars (minimum 30)</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-medium text-navy-900 mb-2">What happens next?</p>
              <ul className="space-y-1 text-xs text-gray-500">
                <li>• A senior member of our team will review your case</li>
                <li>• All previous evidence and correspondence is reviewed</li>
                <li>• You will be notified by email within 5 business days</li>
                <li>• The appeal decision is final</li>
              </ul>
            </div>

            <div className="flex gap-3 pt-2">
              <Link href="/resolution"><Button variant="outline">Cancel</Button></Link>
              <Button fullWidth loading={loading} onClick={handleSubmit}>Submit appeal</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
