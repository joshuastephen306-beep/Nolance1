'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Avatar, OrderStatusBadge, Badge } from '@/components/ui'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDate, formatDateTime, formatDeadline, timeAgo } from '@/utils'
import { useAuthStore } from '@/store/auth.store'
import { Order } from '@/types'
import {
  Clock, CheckCircle, RotateCcw, XCircle, Upload, MessageSquare,
  FileText, Download, AlertTriangle, ChevronLeft, Star
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function OrderDetailPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>()
  const router = useRouter()
  const { user } = useAuthStore()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [deliveryMessage, setDeliveryMessage] = useState('')
  const [revisionReason, setRevisionReason] = useState('')
  const [showDeliverForm, setShowDeliverForm] = useState(false)
  const [showRevisionForm, setShowRevisionForm] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')

  useEffect(() => { fetchOrder() }, [orderNumber])

  const fetchOrder = async () => {
    try {
      const res = await axios.get(`/api/orders/${orderNumber}`)
      setOrder(res.data.data)
    } catch { router.push('/orders') }
    setLoading(false)
  }

  const handleAction = async (action: string, extra?: any) => {
    setActionLoading(true)
    try {
      await axios.patch(`/api/orders/${orderNumber}`, { action, ...extra })
      toast.success(
        action === 'deliver' ? 'Order delivered! Waiting for buyer approval.' :
        action === 'complete' ? 'Order completed! Funds are on their way.' :
        action === 'revision' ? 'Revision requested.' :
        action === 'cancel' ? 'Order cancelled.' : 'Done!'
      )
      fetchOrder()
      setShowDeliverForm(false)
      setShowRevisionForm(false)
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Action failed')
    }
    setActionLoading(false)
  }

  const handleReview = async () => {
    if (!order) return
    setActionLoading(true)
    try {
      await axios.post('/api/reviews', { order_id: order.id, rating: reviewRating, comment: reviewComment })
      toast.success('Review submitted!')
      setShowReviewForm(false)
      fetchOrder()
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to submit review')
    }
    setActionLoading(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50"><Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="h-64 bg-gray-200 rounded-2xl" />
        <div className="h-48 bg-gray-200 rounded-2xl" />
      </div>
    </div>
  )
  if (!order) return null

  const buyer = (order as any).buyer
  const seller = (order as any).seller
  const gig = (order as any).gig
  const deliveries = (order as any).deliveries || []
  const revisions = (order as any).revisions || []
  const isBuyer = order.buyer_id === user?.id
  const isSeller = order.seller_id === user?.id
  const isLate = order.deadline && new Date(order.deadline) < new Date() && ['active', 'revision'].includes(order.status)

  const TIMELINE = [
    { label: 'Order placed', date: order.created_at, done: true },
    { label: 'Payment confirmed', date: order.created_at, done: ['active','delivered','revision','completed'].includes(order.status) },
    { label: 'In progress', date: null, done: ['active','delivered','revision','completed'].includes(order.status) },
    { label: 'Delivered', date: order.delivered_at, done: !!order.delivered_at },
    { label: 'Completed', date: order.completed_at, done: order.status === 'completed' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Back */}
        <Link href="/orders" className="flex items-center gap-1 text-sm text-gray-400 hover:text-navy-900 mb-5 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to orders
        </Link>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
          <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-gray-400">{order.order_number}</span>
                <OrderStatusBadge status={order.status} />
                {isLate && <Badge variant="red">Late</Badge>}
              </div>
              <h1 className="text-lg font-semibold text-navy-900">{order.title}</h1>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-navy-900">{formatCurrency(order.price)}</p>
              {isSeller && <p className="text-sm text-green-600">You earn {formatCurrency(order.seller_earnings)}</p>}
            </div>
          </div>

          {/* Parties */}
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <Avatar user={buyer} size="sm" />
              <div>
                <p className="text-xs text-gray-400">Buyer</p>
                <p className="text-sm font-medium text-navy-900">{buyer?.display_name || buyer?.username}</p>
              </div>
            </div>
            <div className="text-gray-300">→</div>
            <div className="flex items-center gap-2">
              <Avatar user={seller} size="sm" />
              <div>
                <p className="text-xs text-gray-400">Seller</p>
                <p className="text-sm font-medium text-navy-900">{seller?.display_name || seller?.username}</p>
              </div>
            </div>
          </div>

          {/* Deadline */}
          {order.deadline && ['active', 'delivered', 'revision'].includes(order.status) && (
            <div className={`mt-4 flex items-center gap-2 p-3 rounded-xl ${isLate ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'}`}>
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">
                {isLate ? 'Order is overdue — ' : 'Delivery deadline: '}
                {formatDeadline(order.deadline)} ({formatDateTime(order.deadline)})
              </span>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-5">

          {/* Left — Main Content */}
          <div className="md:col-span-2 space-y-5">

            {/* Order Timeline */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-semibold text-navy-900 mb-4">Order timeline</h3>
              <div className="space-y-4">
                {TIMELINE.map((item, i) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${item.done ? 'bg-green-500' : 'bg-gray-100'}`}>
                      {item.done ? <CheckCircle className="w-3.5 h-3.5 text-white" /> : <div className="w-2 h-2 bg-gray-300 rounded-full" />}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${item.done ? 'text-navy-900' : 'text-gray-400'}`}>{item.label}</p>
                      {item.date && <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(item.date)}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Deliveries */}
            {deliveries.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-semibold text-navy-900 mb-4">Deliveries</h3>
                {deliveries.map((del: any, i: number) => (
                  <div key={del.id} className="border border-gray-100 rounded-xl p-4 mb-3 last:mb-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-green-600">Delivery {i + 1}</span>
                      <span className="text-xs text-gray-400">{timeAgo(del.created_at)}</span>
                    </div>
                    {del.message && <p className="text-sm text-gray-600 mb-3 leading-relaxed">{del.message}</p>}
                    {del.files && del.files.length > 0 && (
                      <div className="space-y-2">
                        {del.files.map((file: string, fi: number) => (
                          <a key={fi} href={file} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-green-600 hover:underline">
                            <Download className="w-4 h-4" /> Download file {fi + 1}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Revision History */}
            {revisions.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-semibold text-navy-900 mb-4">
                  Revision requests ({revisions.length}/{order.max_revisions})
                </h3>
                {revisions.map((rev: any, i: number) => (
                  <div key={rev.id} className="border border-amber-100 bg-amber-50 rounded-xl p-4 mb-3 last:mb-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-amber-700">Revision {i + 1}</span>
                      <span className="text-xs text-gray-400">{timeAgo(rev.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-700">{rev.reason}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Deliver Form (Seller) */}
            {showDeliverForm && isSeller && (
              <div className="bg-white rounded-2xl border border-green-200 p-5">
                <h3 className="font-semibold text-navy-900 mb-4">Deliver your work</h3>
                <textarea value={deliveryMessage} onChange={e => setDeliveryMessage(e.target.value)}
                  placeholder="Describe what you have delivered and any notes for the buyer..."
                  className="textarea mb-4 h-28" />
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center mb-4 cursor-pointer hover:border-green-400 transition-colors">
                  <Upload className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Upload delivery files</p>
                  <p className="text-xs text-gray-300 mt-1">Drag and drop or click to browse</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowDeliverForm(false)}>Cancel</Button>
                  <Button loading={actionLoading} onClick={() => handleAction('deliver', { message: deliveryMessage })} fullWidth>
                    Submit delivery
                  </Button>
                </div>
              </div>
            )}

            {/* Revision Form (Buyer) */}
            {showRevisionForm && isBuyer && (
              <div className="bg-white rounded-2xl border border-amber-200 p-5">
                <h3 className="font-semibold text-navy-900 mb-4">
                  Request revision ({order.revision_count}/{order.max_revisions} used)
                </h3>
                <textarea value={revisionReason} onChange={e => setRevisionReason(e.target.value)}
                  placeholder="Describe exactly what changes you need..."
                  className="textarea mb-4 h-24" />
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowRevisionForm(false)}>Cancel</Button>
                  <Button loading={actionLoading} variant="secondary"
                    onClick={() => handleAction('revision', { message: revisionReason })} fullWidth>
                    Request revision
                  </Button>
                </div>
              </div>
            )}

            {/* Review Form */}
            {showReviewForm && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-semibold text-navy-900 mb-4">Leave a review</h3>
                <div className="flex gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} onClick={() => setReviewRating(star)}
                      className={`text-2xl transition-transform hover:scale-110 ${star <= reviewRating ? 'text-amber-400' : 'text-gray-200'}`}>
                      ★
                    </button>
                  ))}
                  <span className="text-sm text-gray-400 ml-2 self-center">{reviewRating}/5</span>
                </div>
                <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)}
                  placeholder="Share your experience with this seller..."
                  className="textarea mb-4 h-24" />
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowReviewForm(false)}>Skip</Button>
                  <Button loading={actionLoading} onClick={handleReview} fullWidth>
                    <Star className="w-4 h-4" /> Submit review
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Right — Actions */}
          <div className="space-y-4">

            {/* Action Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-semibold text-navy-900 mb-4">Order actions</h3>
              <div className="space-y-2">

                {/* Seller Actions */}
                {isSeller && order.status === 'active' && (
                  <Button fullWidth onClick={() => setShowDeliverForm(true)}>
                    <Upload className="w-4 h-4" /> Deliver order
                  </Button>
                )}
                {isSeller && order.status === 'revision' && (
                  <Button fullWidth onClick={() => setShowDeliverForm(true)}>
                    <Upload className="w-4 h-4" /> Re-deliver
                  </Button>
                )}

                {/* Buyer Actions */}
                {isBuyer && order.status === 'delivered' && (
                  <>
                    <Button fullWidth onClick={() => handleAction('complete')} loading={actionLoading}>
                      <CheckCircle className="w-4 h-4" /> Accept delivery
                    </Button>
                    <Button variant="outline" fullWidth onClick={() => setShowRevisionForm(true)}
                      disabled={order.revision_count >= order.max_revisions}>
                      <RotateCcw className="w-4 h-4" />
                      {order.revision_count >= order.max_revisions ? 'No revisions left' : `Request revision (${order.max_revisions - order.revision_count} left)`}
                    </Button>
                  </>
                )}

                {/* Review */}
                {isBuyer && order.status === 'completed' && !showReviewForm && (
                  <Button variant="outline" fullWidth onClick={() => setShowReviewForm(true)}>
                    <Star className="w-4 h-4" /> Leave a review
                  </Button>
                )}

                {/* Message */}
                <Link href={`/dashboard/messages`}>
                  <Button variant="outline" fullWidth>
                    <MessageSquare className="w-4 h-4" /> Message {isBuyer ? 'seller' : 'buyer'}
                  </Button>
                </Link>

                {/* Cancel */}
                {['pending', 'active'].includes(order.status) && (
                  <Button variant="ghost" fullWidth
                    onClick={() => handleAction('cancel', { message: 'Cancelled by user' })}
                    loading={actionLoading}
                    className="text-red-500 hover:bg-red-50">
                    <XCircle className="w-4 h-4" /> Cancel order
                  </Button>
                )}

                {/* Dispute */}
                {['active', 'delivered', 'revision'].includes(order.status) && (
                  <Link href={`/resolution/open?order=${order.id}`}>
                    <Button variant="ghost" fullWidth className="text-orange-500 hover:bg-orange-50">
                      <AlertTriangle className="w-4 h-4" /> Open dispute
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-semibold text-navy-900 mb-4">Order summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Package</span>
                  <span className="font-medium capitalize">{(order as any).package?.package_type || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Delivery</span>
                  <span className="font-medium">{order.delivery_days} day{order.delivery_days !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Revisions</span>
                  <span className="font-medium">{order.max_revisions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Ordered on</span>
                  <span className="font-medium">{formatDate(order.created_at)}</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between">
                  <span className="font-medium text-navy-900">Total paid</span>
                  <span className="font-bold text-navy-900">{formatCurrency(order.price)}</span>
                </div>
                {isSeller && (
                  <div className="flex justify-between text-green-600">
                    <span className="font-medium">Your earnings</span>
                    <span className="font-bold">{formatCurrency(order.seller_earnings)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
