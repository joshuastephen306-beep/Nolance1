'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { OrderStatusBadge } from '@/components/ui'
import { formatDate, timeAgo } from '@/utils'
import { AlertTriangle, ChevronLeft, Send, FileText, Shield, CheckCircle, Clock } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

// ── RESOLUTION CENTER ─────────────────────────────────────────
export default function ResolutionCenterPage() {
  const [disputes, setDisputes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchDisputes() }, [])

  const fetchDisputes = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/disputes')
      setDisputes(res.data.data || [])
    } catch {}
    setLoading(false)
  }

  const STATUS_STYLES: Record<string, string> = {
    open: 'badge-amber', under_review: 'badge-blue',
    resolved: 'badge-green', appealed: 'badge-purple', closed: 'badge-gray',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-navy-900">Resolution Center</h1>
            <p className="text-sm text-gray-400 mt-0.5">Manage disputes and appeals</p>
          </div>
          <Link href="/resolution/open">
            <Button variant="outline"><AlertTriangle className="w-4 h-4" /> Open a dispute</Button>
          </Link>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800 mb-1">How disputes work</p>
              <p className="text-xs text-blue-600 leading-relaxed">
                Disputes are reviewed within 48 hours. Fund holds are placed immediately. Resolved disputes can be appealed within 7 days. Funds held during suspension are released after 30 days (not 90 like other platforms).
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse"/>)}</div>
        ) : disputes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <CheckCircle className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <h3 className="font-medium text-navy-900 mb-1">No disputes</h3>
            <p className="text-sm text-gray-400">Great! You have no open or past disputes.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {disputes.map(dispute => (
              <div key={dispute.id} className="bg-white border border-gray-100 rounded-xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`badge text-xs ${STATUS_STYLES[dispute.status] || 'badge-gray'}`}>{dispute.status.replace('_', ' ')}</span>
                      <span className="text-xs text-gray-400">{timeAgo(dispute.created_at)}</span>
                    </div>
                    <p className="text-sm font-medium text-navy-900 mb-1">
                      Order: {dispute.order?.order_number} — {dispute.order?.title}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-2">{dispute.reason}</p>
                    {dispute.resolution && (
                      <div className="mt-2 p-2 bg-green-50 rounded-lg">
                        <p className="text-xs text-green-700"><span className="font-medium">Resolution:</span> {dispute.resolution}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {dispute.status === 'resolved' && !dispute.appeal_opened && (
                      <Link href={`/resolution/appeal?dispute=${dispute.id}`}>
                        <Button size="sm" variant="outline">Appeal</Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
