'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { ProgressBar, LevelBadge } from '@/components/ui'
import { formatCurrency, getNextLevelRequirements } from '@/utils'
import { useAuthStore } from '@/store/auth.store'
import { TrendingUp, Star, Package, DollarSign, Clock, CheckCircle, Users, Eye, MousePointer, BarChart2 } from 'lucide-react'
import axios from 'axios'

export default function DashboardAnalyticsPage() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<any>(null)
  const [gigs, setGigs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d')

  useEffect(() => { fetchData() }, [period])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [statsRes, gigsRes] = await Promise.all([
        axios.get(`/api/users/dashboard-stats?period=${period}`),
        axios.get('/api/gigs/mine'),
      ])
      setStats(statsRes.data.data)
      setGigs(gigsRes.data.data || [])
    } catch {}
    setLoading(false)
  }

  const sp = user?.seller_profile as any
  const nextLevel = sp ? getNextLevelRequirements(sp.level) : null

  // Mock chart data — in production from database
  const chartData = [
    { label: 'Mon', orders: 2, earnings: 120 },
    { label: 'Tue', orders: 1, earnings: 80 },
    { label: 'Wed', orders: 4, earnings: 340 },
    { label: 'Thu', orders: 3, earnings: 210 },
    { label: 'Fri', orders: 5, earnings: 450 },
    { label: 'Sat', orders: 2, earnings: 180 },
    { label: 'Sun', orders: 1, earnings: 90 },
  ]
  const maxEarnings = Math.max(...chartData.map(d => d.earnings))

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-navy-900">Seller Analytics</h1>
            <p className="text-sm text-gray-400 mt-0.5">Track your performance and growth</p>
          </div>
          {/* Period Selector */}
          <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1">
            {[{ id: '7d', label: '7 days' }, { id: '30d', label: '30 days' }, { id: '90d', label: '90 days' }, { id: 'all', label: 'All time' }].map(p => (
              <button key={p.id} onClick={() => setPeriod(p.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${period === p.id ? 'bg-navy-900 text-white font-medium' : 'text-gray-500 hover:text-navy-900'}`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { icon: DollarSign, label: 'Earnings', value: formatCurrency(stats?.earnings_this_month || 0), color: 'bg-green-50 text-green-600', sub: 'This month' },
            { icon: Package, label: 'Orders', value: stats?.active_orders || 0, color: 'bg-blue-50 text-blue-600', sub: 'Active now' },
            { icon: Star, label: 'Rating', value: sp?.average_rating ? `${sp.average_rating.toFixed(1)}★` : '—', color: 'bg-amber-50 text-amber-600', sub: `${sp?.total_reviews || 0} reviews` },
            { icon: CheckCircle, label: 'Completion', value: `${sp?.completion_rate || 0}%`, color: 'bg-purple-50 text-purple-600', sub: 'Completion rate' },
          ].map(({ icon: Icon, label, value, color, sub }) => (
            <div key={label} className="bg-white border border-gray-100 rounded-xl p-4">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-xl font-bold text-navy-900">{value}</p>
              <p className="text-xs font-medium text-navy-700">{label}</p>
              <p className="text-xs text-gray-400">{sub}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-5 mb-5">
          {/* Earnings Chart */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-navy-900">Earnings this week</h3>
              <BarChart2 className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex items-end gap-2 h-28">
              {chartData.map(d => (
                <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-gray-100 rounded-t-md relative" style={{ height: '80px' }}>
                    <div className="absolute bottom-0 left-0 right-0 bg-green-500 rounded-t-md transition-all"
                      style={{ height: `${(d.earnings / maxEarnings) * 80}px` }} />
                  </div>
                  <span className="text-xs text-gray-400">{d.label}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-3 text-xs text-gray-400">
              <span>Total: {formatCurrency(chartData.reduce((s, d) => s + d.earnings, 0))}</span>
              <span>{chartData.reduce((s, d) => s + d.orders, 0)} orders</span>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <h3 className="font-semibold text-navy-900 mb-4">Performance metrics</h3>
            <div className="space-y-4">
              {[
                { label: 'Response rate', value: sp?.response_rate || 0, target: 90, suffix: '%', icon: Clock },
                { label: 'Completion rate', value: sp?.completion_rate || 0, target: 95, suffix: '%', icon: CheckCircle },
                { label: 'On-time delivery', value: sp?.on_time_delivery_rate || 0, target: 90, suffix: '%', icon: TrendingUp },
              ].map(({ label, value, target, suffix, icon: Icon }) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-sm text-gray-600">{label}</span>
                    </div>
                    <span className={`text-sm font-bold ${value >= target ? 'text-green-600' : 'text-amber-600'}`}>{value}{suffix}</span>
                  </div>
                  <ProgressBar value={value} max={100} />
                  <p className="text-xs text-gray-400 mt-0.5">Target: {target}{suffix}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Level Progress */}
        {sp && nextLevel && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-navy-900">Seller level progress</h3>
                <p className="text-sm text-gray-400 mt-0.5">Progress toward {nextLevel.label}</p>
              </div>
              <LevelBadge level={sp.level} />
            </div>
            <div className="grid sm:grid-cols-3 gap-5">
              {[
                { label: 'Orders completed', current: sp.total_orders_completed, target: nextLevel.orders },
                { label: 'Unique clients', current: sp.unique_clients, target: nextLevel.clients },
                { label: 'Total earnings', current: sp.total_earnings, target: nextLevel.earnings, currency: true },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs text-gray-500">{item.label}</span>
                    <span className="text-xs font-medium text-navy-900">
                      {item.currency ? formatCurrency(item.current) : item.current} / {item.currency ? formatCurrency(item.target) : item.target}
                    </span>
                  </div>
                  <ProgressBar value={item.current} max={item.target} />
                  <p className="text-xs text-gray-400 mt-0.5">
                    {Math.round((item.current / item.target) * 100)}% complete
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Also requires: avg rating of {nextLevel.rating}★ and {nextLevel.days} days on platform.
                Current rating: {sp.average_rating?.toFixed(1) || '—'}★
              </p>
            </div>
          </div>
        )}

        {/* Gig Performance Table */}
        {gigs.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-navy-900">Gig performance</h3>
              <Link href="/dashboard/gigs"><Button size="sm" variant="outline">Manage gigs</Button></Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">Gig</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-400">
                      <span className="flex items-center gap-1 justify-center"><Eye className="w-3 h-3"/>Impressions</span>
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-400">
                      <span className="flex items-center gap-1 justify-center"><MousePointer className="w-3 h-3"/>Clicks</span>
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-400">Orders</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-400">Rating</th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-gray-400">Conv. Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {gigs.slice(0, 8).map(gig => {
                    const convRate = gig.clicks > 0 ? ((gig.orders_count / gig.clicks) * 100).toFixed(1) : '0.0'
                    return (
                      <tr key={gig.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-5 py-3">
                          <Link href={`/gig/${gig.slug}`} className="text-sm font-medium text-navy-900 hover:text-green-600 line-clamp-1 max-w-48 block">
                            {gig.title}
                          </Link>
                          <span className={`badge text-xs mt-0.5 ${gig.status === 'active' ? 'badge-green' : gig.status === 'paused' ? 'badge-gray' : 'badge-amber'}`}>{gig.status}</span>
                        </td>
                        <td className="px-4 py-3 text-center text-gray-600">{gig.impressions?.toLocaleString() || 0}</td>
                        <td className="px-4 py-3 text-center text-gray-600">{gig.clicks?.toLocaleString() || 0}</td>
                        <td className="px-4 py-3 text-center font-medium text-navy-900">{gig.orders_count || 0}</td>
                        <td className="px-4 py-3 text-center">
                          {gig.average_rating > 0
                            ? <span className="text-amber-500 font-medium">{gig.average_rating.toFixed(1)}★</span>
                            : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className={`text-sm font-medium ${Number(convRate) >= 2 ? 'text-green-600' : 'text-amber-500'}`}>{convRate}%</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
