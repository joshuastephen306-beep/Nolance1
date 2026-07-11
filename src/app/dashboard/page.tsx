'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth.store'
import { Navbar } from '@/components/layout/Navbar'
import { Avatar, LevelBadge, ProgressBar, StarRating } from '@/components/ui'
import { Button } from '@/components/ui/Button'
import { formatCurrency, getNextLevelRequirements, timeAgo } from '@/utils'
import {
  Briefcase, Search, Store, Users, MapPin, TrendingUp, Bell,
  MessageSquare, Package, DollarSign, Clock, Star, ArrowRight,
  Plus, ChevronRight, Lock, Zap
} from 'lucide-react'
import axios from 'axios'

const SECTIONS = [
  { id: 'gigs', label: 'Gigs', icon: Briefcase, href: '/explore', dashHref: '/dashboard/gigs', color: 'bg-blue-500', desc: 'Create and manage your gigs' },
  { id: 'scout', label: 'Scout', icon: Search, href: '/scout', dashHref: '/dashboard/scout', color: 'bg-purple-500', desc: 'Find jobs and send proposals' },
  { id: 'marketplace', label: 'Marketplace', icon: Store, href: '/marketplace', dashHref: '/dashboard/marketplace', color: 'bg-amber-500', desc: 'Buy and sell digital assets' },
  { id: 'community', label: 'Community', icon: Users, href: '/community', dashHref: '/dashboard/community', color: 'bg-green-500', desc: 'Connect with buyers and sellers' },
  { id: 'directory', label: 'Directory', icon: MapPin, href: '/directory', dashHref: '/dashboard/directory', color: 'bg-red-500', desc: 'Discover and list businesses' },
]

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<any>(null)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [balance, setBalance] = useState({ available: 0, pending: 0 })
  const [registeredSections, setRegisteredSections] = useState<string[]>(['gigs'])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, balanceRes, sectionsRes] = await Promise.all([
        axios.get('/api/users/dashboard-stats'),
        axios.get('/api/users/balance'),
        axios.get('/api/users/sections'),
      ])
      setStats(statsRes.data.data)
      setBalance(balanceRes.data.data)
      setRegisteredSections(sectionsRes.data.data?.map((s: any) => s.section) || ['gigs'])
    } catch {}
    setLoading(false)
  }

  const sellerProfile = user?.seller_profile
  const nextLevel = sellerProfile ? getNextLevelRequirements(sellerProfile.level) : null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Welcome Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Avatar user={user || undefined} size="lg" />
            <div>
              <h1 className="text-xl font-semibold text-navy-900">
                Welcome back, {user?.display_name || user?.username} 👋
              </h1>
              <p className="text-sm text-gray-400">
                {sellerProfile ? (
                  <span className="flex items-center gap-2">
                    <LevelBadge level={sellerProfile.level} />
                    <span>· {sellerProfile.average_rating > 0 ? `${sellerProfile.average_rating.toFixed(1)}★` : 'No reviews yet'}</span>
                  </span>
                ) : 'Buyer account'}
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <Link href="/dashboard/notifications">
              <button className="relative w-9 h-9 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-white transition-colors">
                <Bell className="w-4 h-4 text-gray-500" />
              </button>
            </Link>
            <Link href="/dashboard/messages">
              <button className="relative w-9 h-9 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-white transition-colors">
                <MessageSquare className="w-4 h-4 text-gray-500" />
              </button>
            </Link>
            {(user?.role === 'seller' || user?.role === 'both') && (
              <Link href="/gigs/create">
                <Button size="sm">
                  <Plus className="w-4 h-4" /> New Gig
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <p className="stat-label text-xs">Available balance</p>
            </div>
            <p className="stat-value text-green-600">{formatCurrency(balance.available)}</p>
            <Link href="/dashboard/earnings" className="text-xs text-green-600 hover:underline mt-1 block">Withdraw →</Link>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <p className="stat-label text-xs">Pending clearance</p>
            </div>
            <p className="stat-value">{formatCurrency(balance.pending)}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-blue-500" />
              <p className="stat-label text-xs">Active orders</p>
            </div>
            <p className="stat-value">{stats?.active_orders ?? 0}</p>
            <Link href="/dashboard/orders" className="text-xs text-blue-600 hover:underline mt-1 block">View all →</Link>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-amber-500" />
              <p className="stat-label text-xs">Average rating</p>
            </div>
            <p className="stat-value">{sellerProfile?.average_rating?.toFixed(1) ?? '—'}</p>
            <p className="text-xs text-gray-400">{sellerProfile?.total_reviews ?? 0} reviews</p>
          </div>
        </div>

        {/* Section Switcher — The Hub */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-navy-900">Your sections</h2>
            <Link href="/settings/sections" className="text-sm text-green-600 hover:underline">Manage sections</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {SECTIONS.map(section => {
              const isRegistered = registeredSections.includes(section.id)
              return (
                <div key={section.id}
                  className={`card p-4 relative ${isRegistered ? 'card-hover' : 'opacity-60'}`}>
                  {!isRegistered && (
                    <div className="absolute top-3 right-3">
                      <Lock className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                  )}
                  <div className={`w-9 h-9 rounded-lg ${section.color} flex items-center justify-center mb-3`}>
                    <section.icon className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-navy-900 mb-1">{section.label}</h3>
                  <p className="text-xs text-gray-400 mb-3">{section.desc}</p>
                  {isRegistered ? (
                    <Link href={section.dashHref} className="text-xs text-green-600 font-medium flex items-center gap-1 hover:gap-2 transition-all">
                      Open <ChevronRight className="w-3 h-3" />
                    </Link>
                  ) : (
                    <Link href="/settings/sections" className="text-xs text-gray-400 flex items-center gap-1">
                      Register <ChevronRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Seller Performance */}
            {sellerProfile && (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-semibold text-navy-900">Seller performance</h3>
                  <Link href="/dashboard/analytics" className="text-sm text-green-600 hover:underline">Full analytics →</Link>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-2xl font-semibold text-navy-900">{sellerProfile.completion_rate}%</p>
                    <p className="text-xs text-gray-400 mt-1">Completion rate</p>
                    <ProgressBar value={sellerProfile.completion_rate} className="mt-2" />
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-semibold text-navy-900">{sellerProfile.response_rate}%</p>
                    <p className="text-xs text-gray-400 mt-1">Response rate</p>
                    <ProgressBar value={sellerProfile.response_rate} className="mt-2" />
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-semibold text-navy-900">{sellerProfile.on_time_delivery_rate}%</p>
                    <p className="text-xs text-gray-400 mt-1">On-time delivery</p>
                    <ProgressBar value={sellerProfile.on_time_delivery_rate} className="mt-2" />
                  </div>
                </div>

                {/* Level Progress */}
                {nextLevel && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-navy-900">Progress to {nextLevel.label}</p>
                      <LevelBadge level={sellerProfile.level} />
                    </div>
                    <div className="space-y-2.5">
                      {[
                        { label: 'Orders completed', current: sellerProfile.total_orders_completed, target: nextLevel.orders },
                        { label: 'Unique clients', current: sellerProfile.unique_clients, target: nextLevel.clients },
                        { label: 'Total earnings', current: sellerProfile.total_earnings, target: nextLevel.earnings, currency: true },
                      ].map(item => (
                        <div key={item.label}>
                          <div className="flex justify-between mb-1">
                            <span className="text-xs text-gray-500">{item.label}</span>
                            <span className="text-xs font-medium text-navy-900">
                              {item.currency ? formatCurrency(item.current) : item.current} / {item.currency ? formatCurrency(item.target) : item.target}
                            </span>
                          </div>
                          <ProgressBar value={item.current} max={item.target} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick Actions */}
            <div className="card p-6">
              <h3 className="font-semibold text-navy-900 mb-4">Quick actions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Create gig', icon: Plus, href: '/gigs/create', color: 'text-blue-600 bg-blue-50' },
                  { label: 'Browse jobs', icon: Search, href: '/scout/jobs', color: 'text-purple-600 bg-purple-50' },
                  { label: 'List item', icon: Store, href: '/marketplace/sell', color: 'text-amber-600 bg-amber-50' },
                  { label: 'Withdraw', icon: DollarSign, href: '/dashboard/earnings', color: 'text-green-600 bg-green-50' },
                ].map(action => (
                  <Link key={action.label} href={action.href}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-green-300 hover:bg-green-50/50 transition-all text-center">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${action.color}`}>
                      <action.icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium text-navy-900">{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">

            {/* Market AI Widget */}
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-green-500" />
                <h3 className="text-sm font-semibold text-navy-900">Market AI Insights</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Logo design', trend: '↑ 23% this week', hot: true },
                  { label: 'AI automation', trend: '↑ 41% this week', hot: true },
                  { label: 'Video editing', trend: '↑ 12% this week', hot: false },
                  { label: 'Web development', trend: 'Stable demand', hot: false },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {item.hot && <span className="text-xs">🔥</span>}
                      <span className="text-sm text-navy-800">{item.label}</span>
                    </div>
                    <span className={`text-xs font-medium ${item.hot ? 'text-green-600' : 'text-gray-400'}`}>
                      {item.trend}
                    </span>
                  </div>
                ))}
              </div>
              <Link href="/trends" className="flex items-center gap-1 text-xs text-green-600 hover:underline mt-4">
                View full market report <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Seller Tips */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-navy-900 mb-3">💡 Tips for you</h3>
              <div className="space-y-3">
                {[
                  'Stay online to boost your gig impressions',
                  'Reply within 1 hour to improve your response rate',
                  'Add a gig video to increase orders by 40%',
                  'Use all 14 search tags on every gig',
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Links */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-navy-900 mb-3">Your links</h3>
              <div className="space-y-2">
                {[
                  { label: 'View my profile', href: `/seller/${user?.username}` },
                  { label: 'My reviews', href: '/dashboard/gigs?tab=reviews' },
                  { label: 'Nolance Learn', href: '/learn' },
                  { label: 'Affiliate program', href: '/affiliate' },
                  { label: 'Help center', href: 'https://help.nolance.com' },
                ].map(link => (
                  <Link key={link.label} href={link.href}
                    className="flex items-center justify-between py-1.5 text-sm text-gray-600 hover:text-green-600 transition-colors">
                    {link.label}
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
