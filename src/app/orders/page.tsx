'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Avatar, OrderStatusBadge, Skeleton } from '@/components/ui'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDate, formatDeadline } from '@/utils'
import { Order } from '@/types'
import { Package, Clock, ChevronRight, Search } from 'lucide-react'
import axios from 'axios'

const STATUS_TABS = [
  { value: '', label: 'All orders' },
  { value: 'active', label: 'In Progress' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<'buyer' | 'seller' | 'both'>('both')
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => { fetchOrders() }, [role, status])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ role })
      if (status) params.set('status', status)
      const res = await axios.get(`/api/orders?${params}`)
      setOrders(res.data.data || [])
      setTotal(res.data.total || 0)
    } catch {}
    setLoading(false)
  }

  const filtered = orders.filter(o =>
    !search || o.order_number.toLowerCase().includes(search.toLowerCase()) ||
    o.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-navy-900">Orders</h1>
            <p className="text-sm text-gray-400 mt-0.5">{total} total orders</p>
          </div>
          <div className="flex gap-2">
            {(['buyer', 'seller', 'both'] as const).map(r => (
              <button key={r} onClick={() => setRole(r)}
                className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${role === r ? 'bg-navy-900 text-white' : 'border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                {r === 'both' ? 'All' : r === 'buyer' ? 'As buyer' : 'As seller'}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by order number or title..."
            className="input pl-9" />
        </div>

        {/* Status Tabs */}
        <div className="flex gap-1 overflow-x-auto scrollbar-hide mb-5 bg-white border border-gray-100 rounded-xl p-1">
          {STATUS_TABS.map(tab => (
            <button key={tab.value} onClick={() => setStatus(tab.value)}
              className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors flex-shrink-0 ${status === tab.value ? 'bg-navy-900 text-white font-medium' : 'text-gray-500 hover:text-navy-900 hover:bg-gray-50'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h3 className="font-medium text-navy-900 mb-1">No orders found</h3>
            <p className="text-sm text-gray-400 mb-4">
              {status ? `No ${status} orders yet` : 'You have not placed or received any orders yet'}
            </p>
            <Link href="/explore"><Button size="sm">Browse gigs</Button></Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(order => <OrderRow key={order.id} order={order} role={role} />)}
          </div>
        )}
      </div>
    </div>
  )
}

function OrderRow({ order, role }: { order: Order; role: string }) {
  const buyer = (order as any).buyer
  const seller = (order as any).seller
  const gig = (order as any).gig
  const thumb = gig?.gallery?.find((g: any) => g.type === 'image')
  const otherParty = role === 'seller' ? buyer : seller
  const isLate = order.deadline && new Date(order.deadline) < new Date() && ['active', 'revision'].includes(order.status)

  return (
    <Link href={`/orders/${order.order_number}`}
      className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl p-4 hover:border-green-300 hover:shadow-card transition-all">

      {/* Gig Thumbnail */}
      <div className="w-16 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
        {thumb ? <img src={thumb.url} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full bg-gradient-to-br from-navy-100 to-green-50 flex items-center justify-center text-lg">📦</div>}
      </div>

      {/* Main Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono text-gray-400">{order.order_number}</span>
          <OrderStatusBadge status={order.status} />
          {isLate && <span className="badge badge-red text-xs">Late</span>}
        </div>
        <p className="text-sm font-medium text-navy-900 line-clamp-1 mb-1">{order.title}</p>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span>{role === 'seller' ? `From ${buyer?.username}` : `By ${seller?.username}`}</span>
          <span>·</span>
          <span>{formatDate(order.created_at)}</span>
          {order.deadline && ['active', 'delivered', 'revision'].includes(order.status) && (
            <>
              <span>·</span>
              <span className={`flex items-center gap-1 ${isLate ? 'text-red-500' : 'text-gray-400'}`}>
                <Clock className="w-3 h-3" /> {formatDeadline(order.deadline)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Price & Arrow */}
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-semibold text-navy-900">{formatCurrency(order.price)}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {role === 'seller' ? `You earn ${formatCurrency(order.seller_earnings)}` : 'Paid'}
        </p>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
    </Link>
  )
}
