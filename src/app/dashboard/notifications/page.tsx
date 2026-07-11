'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { timeAgo } from '@/utils'
import { Bell, CheckCheck, Package, MessageSquare, Star, DollarSign, Shield, Zap } from 'lucide-react'
import axios from 'axios'

const TYPE_ICONS: Record<string, any> = {
  order: Package, message: MessageSquare, review: Star,
  payment: DollarSign, security: Shield, system: Bell, scout: Zap, community: Zap,
}

const TYPE_COLORS: Record<string, string> = {
  order: 'text-blue-500 bg-blue-50', message: 'text-purple-500 bg-purple-50',
  review: 'text-amber-500 bg-amber-50', payment: 'text-green-500 bg-green-50',
  security: 'text-red-500 bg-red-50', system: 'text-gray-500 bg-gray-50',
  scout: 'text-indigo-500 bg-indigo-50', community: 'text-green-500 bg-green-50',
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => { fetchNotifications() }, [])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/notifications')
      setNotifications(res.data.data || [])
      setUnreadCount(res.data.unread_count || 0)
    } catch {}
    setLoading(false)
  }

  const markAllRead = async () => {
    try {
      await axios.patch('/api/notifications', { mark_all: true })
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch {}
  }

  const markRead = async (id: string) => {
    try {
      await axios.patch('/api/notifications', { notification_ids: [id] })
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch {}
  }

  const filtered = filter === 'unread' ? notifications.filter(n => !n.is_read) : notifications

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-navy-900">Notifications</h1>
            {unreadCount > 0 && <p className="text-sm text-gray-400 mt-0.5">{unreadCount} unread</p>}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-1.5 text-sm text-green-600 hover:underline">
              <CheckCheck className="w-4 h-4" /> Mark all as read
            </button>
          )}
        </div>

        <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 mb-5 w-fit">
          {[{ id: 'all', label: 'All' }, { id: 'unread', label: `Unread (${unreadCount})` }].map(tab => (
            <button key={tab.id} onClick={() => setFilter(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${filter === tab.id ? 'bg-navy-900 text-white font-medium' : 'text-gray-500 hover:text-navy-900 hover:bg-gray-50'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-2">{[1,2,3,4,5].map(i=><div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse"/>)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Bell className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">{filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {filtered.map(notif => {
              const Icon = TYPE_ICONS[notif.type] || Bell
              const colorClass = TYPE_COLORS[notif.type] || 'text-gray-500 bg-gray-50'
              return (
                <button key={notif.id} onClick={() => !notif.is_read && markRead(notif.id)}
                  className={`w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-all hover:border-green-300 ${notif.is_read ? 'bg-white border-gray-100' : 'bg-green-50/30 border-green-100'}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm leading-snug ${notif.is_read ? 'text-navy-800' : 'text-navy-900 font-medium'}`}>{notif.title}</p>
                      <span className="text-xs text-gray-400 flex-shrink-0 mt-0.5">{timeAgo(notif.created_at)}</span>
                    </div>
                    {notif.body && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.body}</p>}
                  </div>
                  {!notif.is_read && <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-1.5" />}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
