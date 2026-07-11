'use client'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { AlertTriangle, ChevronLeft, Info } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function OpenDisputePage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order')
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState<any>(null)
  const [reason, setReason] = useState('')
  const [evidence, setEvidence] = useState('')

  useEffect(() => {
    if (orderId) fetchOrder()
  }, [orderId])

  const fetchOrder = async () => {
    try {
      const res = await axios.get(`/api/orders/${orderId}`)
      setOrder(res.data.data)
    } catch {}
  }

  const handleSubmit = async () => {
    if (!orderId) { toast.error('Order ID is required'); return }
    if (!reason || reason.length < 30) { toast.error('Please provide a detailed reason (minimum 30 characters)'); return }
    setLoading(true)
    try {
      await axios.post('/api/disputes', { order_id: orderId, reason, evidence: evidence ? [evidence] : [] })
      toast.success('Dispute opened. Our team will review within 48 hours.')
      router.push('/resolution')
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to open dispute')
    }
    setLoading(false)
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
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-navy-900">Open a dispute</h1>
              <p className="text-sm text-gray-400">Our team reviews disputes within 48 hours</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
            <div className="flex gap-2">
              <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 leading-relaxed">
                Before opening a dispute, we recommend messaging the other party to resolve the issue directly. Disputes that are opened without attempting communication may be closed without resolution.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="input-label">Order</label>
              <select className="select" value={orderId || ''} onChange={e => router.push(`/resolution/open?order=${e.target.value}`)}>
                <option value="">Select an order</option>
                {order && <option value={order.id}>{order.order_number} — {order.title}</option>}
              </select>
            </div>

            <div>
              <label className="input-label">Reason for dispute <span className="text-red-400">*</span></label>
              <select className="select mb-2" defaultValue="">
                <option value="">Select main issue</option>
                <option value="not_delivered">Order was not delivered</option>
                <option value="late_delivery">Significant late delivery</option>
                <option value="not_as_described">Delivery does not match gig description</option>
                <option value="poor_quality">Quality is below standard</option>
                <option value="wrong_delivery">Wrong files delivered</option>
                <option value="seller_unresponsive">Seller is unresponsive</option>
                <option value="other">Other</option>
              </select>
              <textarea className="textarea h-28" value={reason} onChange={e => setReason(e.target.value)}
                placeholder="Describe the issue in detail. What was supposed to be delivered? What was actually delivered? Why are you opening this dispute?"
              />
              <p className="input-hint">{reason.length} chars (minimum 30)</p>
            </div>

            <div>
              <label className="input-label">Evidence (optional)</label>
              <textarea className="textarea h-20" value={evidence} onChange={e => setEvidence(e.target.value)}
                placeholder="Provide any evidence links, screenshots descriptions, or relevant conversation excerpts..." />
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-medium text-navy-900 mb-2">What happens next?</p>
              <ul className="space-y-1 text-xs text-gray-500">
                <li>• Funds are held immediately and not released</li>
                <li>• Both parties can submit their case</li>
                <li>• Our team reviews within 48 hours</li>
                <li>• Resolution is binding — you can appeal within 7 days</li>
              </ul>
            </div>

            <div className="flex gap-3 pt-2">
              <Link href="/resolution"><Button variant="outline">Cancel</Button></Link>
              <Button fullWidth loading={loading} onClick={handleSubmit} variant="danger">
                <AlertTriangle className="w-4 h-4" /> Open dispute
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
