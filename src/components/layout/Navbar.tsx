'use client'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth.store'
import { Avatar } from '@/components/ui'
import { Button } from '@/components/ui/Button'
import { useState } from 'react'
import { Search, Bell, MessageSquare, ChevronDown, Menu, X, LogOut, Settings, LayoutDashboard, Briefcase, Store, Users, MapPin } from 'lucide-react'
import { cn } from '@/utils'

const SECTIONS = [
  { id: 'gigs', label: 'Gigs', href: '/explore', icon: Briefcase },
  { id: 'scout', label: 'Scout', href: '/scout', icon: Search },
  { id: 'marketplace', label: 'Marketplace', href: '/marketplace', icon: Store },
  { id: 'community', label: 'Community', href: '/community', icon: Users },
  { id: 'directory', label: 'Directory', href: '/directory', icon: MapPin },
]

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-navy-900 border-b border-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-16 gap-4">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className="text-xl font-semibold text-white tracking-tight">
              Nol<span className="text-green-500">ance</span>
            </span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-lg hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search for any service..."
                className="w-full bg-navy-800 border border-navy-700 text-white placeholder-gray-500 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-green-500 focus:bg-navy-700 transition-colors"
              />
            </div>
          </form>

          {/* Section Links — Desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            {SECTIONS.map(s => (
              <Link key={s.id} href={s.href}
                className="text-sm text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-navy-800 transition-colors">
                {s.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 ml-auto">
            {isAuthenticated && user ? (
              <>
                {/* Notifications */}
                <Link href="/dashboard/notifications"
                  className="relative w-9 h-9 flex items-center justify-center text-gray-400 hover:text-white hover:bg-navy-800 rounded-lg transition-colors">
                  <Bell className="w-5 h-5" />
                </Link>

                {/* Messages */}
                <Link href="/dashboard/messages"
                  className="relative w-9 h-9 flex items-center justify-center text-gray-400 hover:text-white hover:bg-navy-800 rounded-lg transition-colors">
                  <MessageSquare className="w-5 h-5" />
                </Link>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 p-1 rounded-lg hover:bg-navy-800 transition-colors">
                    <Avatar user={user} size="sm" />
                    <ChevronDown className="w-3 h-3 text-gray-400 hidden sm:block" />
                  </button>

                  {profileOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-modal border border-gray-100 py-2 z-50">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-navy-900">{user.display_name || user.username}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                        <nav className="py-1">
                          <Link href="/dashboard" onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            <LayoutDashboard className="w-4 h-4" /> Dashboard
                          </Link>
                          <Link href="/dashboard/orders" onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            <Briefcase className="w-4 h-4" /> My Orders
                          </Link>
                          <Link href="/dashboard/earnings" onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            <Store className="w-4 h-4" /> Earnings
                          </Link>
                          <Link href="/settings/profile" onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            <Settings className="w-4 h-4" /> Settings
                          </Link>
                          <div className="border-t border-gray-100 mt-1 pt-1">
                            <button onClick={() => { logout(); setProfileOpen(false) }}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left">
                              <LogOut className="w-4 h-4" /> Sign out
                            </button>
                          </div>
                        </nav>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <button className="text-sm text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-navy-800 transition-colors hidden sm:block">
                    Sign in
                  </button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="bg-green-500 hover:bg-green-600">
                    Join free
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-white lg:hidden">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-navy-800 py-3 space-y-1">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="px-0 pb-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full bg-navy-800 border border-navy-700 text-white placeholder-gray-500 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-green-500"
                />
              </div>
            </form>
            {SECTIONS.map(s => (
              <Link key={s.id} href={s.href} onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-2 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-navy-800">
                <s.icon className="w-4 h-4" /> {s.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}
