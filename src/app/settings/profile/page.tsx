'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui'
import { useAuthStore } from '@/store/auth.store'
import { formatDate } from '@/utils'
import {
  User, Shield, Bell, CreditCard, Download, Settings,
  Briefcase, Search, Store, Users, MapPin, Lock, Check,
  Eye, EyeOff, ChevronRight, Smartphone, Globe, LogOut
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const SIDEBAR_LINKS = [
  { href: '/settings/profile', label: 'Profile', icon: User },
  { href: '/settings/security', label: 'Security', icon: Shield },
  { href: '/settings/notifications', label: 'Notifications', icon: Bell },
  { href: '/settings/payments', label: 'Payment methods', icon: CreditCard },
  { href: '/settings/withdrawals', label: 'Withdrawal methods', icon: Download },
  { href: '/settings/sections', label: 'Section access', icon: Settings },
]

function SettingsLayout({ children, title }: { children: React.ReactNode; title: string }) {
  const pathname = usePathname()
  const { user } = useAuthStore()
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-semibold text-navy-900 mb-6">Settings</h1>
        <div className="grid md:grid-cols-4 gap-5">
          {/* Sidebar */}
          <div className="bg-white rounded-2xl border border-gray-100 p-3 h-fit">
            <div className="flex items-center gap-3 px-3 py-3 mb-2 border-b border-gray-100">
              <Avatar user={user || undefined} size="sm" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-navy-900 truncate">{user?.display_name || user?.username}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
            {SIDEBAR_LINKS.map(link => (
              <Link key={link.href} href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors mb-0.5 ${pathname === link.href ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-navy-900'}`}>
                <link.icon className="w-4 h-4" /> {link.label}
              </Link>
            ))}
          </div>
          {/* Content */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-navy-900 mb-5">{title}</h2>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── PROFILE SETTINGS ──────────────────────────────────────────
export function ProfileSettings() {
  const { user, setUser } = useAuthStore()
  const [form, setForm] = useState({
    display_name: user?.display_name || '',
    bio: user?.bio || '',
    professional_headline: user?.professional_headline || '',
    website_url: user?.website_url || '',
    country: user?.country || '',
    language: user?.language || 'en',
    currency: user?.currency || 'USD',
  })
  const [loading, setLoading] = useState(false)
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleSave = async () => {
    setLoading(true)
    try {
      await axios.patch(`/api/users/${user?.username}`, { ...form, skills })
      toast.success('Profile updated successfully!')
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to update profile')
    }
    setLoading(false)
  }

  return (
    <SettingsLayout title="Profile settings">
      <div className="space-y-5">
        {/* Avatar */}
        <div className="flex items-center gap-4 pb-5 border-b border-gray-100">
          <Avatar user={user || undefined} size="xl" />
          <div>
            <Button size="sm" variant="outline">Change photo</Button>
            <p className="text-xs text-gray-400 mt-1.5">JPG, PNG. Max 5MB. Min 200x200px.</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="input-label">Display name</label>
            <input className="input" value={form.display_name} onChange={e => update('display_name', e.target.value)} placeholder="Your full name" />
          </div>
          <div>
            <label className="input-label">Username</label>
            <input className="input bg-gray-50 text-gray-400" value={user?.username || ''} readOnly />
            <p className="input-hint">Username cannot be changed after creation</p>
          </div>
        </div>

        <div>
          <label className="input-label">Professional headline</label>
          <input className="input" value={form.professional_headline} onChange={e => update('professional_headline', e.target.value)}
            placeholder="e.g. Full Stack Developer | React & Node.js Expert" maxLength={150} />
          <p className="input-hint">{form.professional_headline.length}/150</p>
        </div>

        <div>
          <label className="input-label">Bio</label>
          <textarea className="textarea h-28" value={form.bio} onChange={e => update('bio', e.target.value)}
            placeholder="Tell buyers and the community about yourself, your experience, and what you do best..." />
        </div>

        <div>
          <label className="input-label">Website</label>
          <input className="input" value={form.website_url} onChange={e => update('website_url', e.target.value)} placeholder="https://yourwebsite.com" />
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="input-label">Country</label>
            <input className="input" value={form.country} onChange={e => update('country', e.target.value)} placeholder="Nigeria" />
          </div>
          <div>
            <label className="input-label">Language</label>
            <select className="select" value={form.language} onChange={e => update('language', e.target.value)}>
              <option value="en">English</option>
              <option value="fr">French</option>
              <option value="es">Spanish</option>
              <option value="ar">Arabic</option>
              <option value="yo">Yoruba</option>
              <option value="ha">Hausa</option>
              <option value="ig">Igbo</option>
            </select>
          </div>
          <div>
            <label className="input-label">Currency</label>
            <select className="select" value={form.currency} onChange={e => update('currency', e.target.value)}>
              <option value="USD">USD</option>
              <option value="NGN">NGN</option>
              <option value="GBP">GBP</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <Button loading={loading} onClick={handleSave}>Save changes</Button>
        </div>
      </div>
    </SettingsLayout>
  )
}

// ── SECURITY SETTINGS ─────────────────────────────────────────
export function SecuritySettings() {
  const { user, logout } = useAuthStore()
  const router = useRouter()
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' })
  const [phoneForm, setPhoneForm] = useState({ phone: '', code: '' })
  const [showPasswords, setShowPasswords] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [phoneLoading, setPhoneLoading] = useState(false)

  const handlePasswordChange = async () => {
    if (passwordForm.newPass !== passwordForm.confirm) { toast.error('Passwords do not match'); return }
    if (passwordForm.newPass.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      await axios.post('/api/auth/change-password', { current_password: passwordForm.current, new_password: passwordForm.newPass })
      toast.success('Password changed successfully!')
      setPasswordForm({ current: '', newPass: '', confirm: '' })
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to change password')
    }
    setLoading(false)
  }

  const handleSendCode = async () => {
    setPhoneLoading(true)
    try {
      await axios.post('/api/users/phone', { phone: phoneForm.phone })
      setCodeSent(true)
      toast.success('Verification code sent!')
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to send code')
    }
    setPhoneLoading(false)
  }

  const handleVerifyPhone = async () => {
    setPhoneLoading(true)
    try {
      await axios.put('/api/users/phone', { phone: phoneForm.phone, code: phoneForm.code })
      toast.success('Phone number verified!')
      setCodeSent(false)
      setPhoneForm({ phone: '', code: '' })
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Invalid code')
    }
    setPhoneLoading(false)
  }

  const handleLogoutAll = async () => {
    try {
      await axios.post('/api/auth/logout-all', {})
      logout()
      router.push('/auth/login')
      toast.success('Logged out of all devices')
    } catch {}
  }

  return (
    <SettingsLayout title="Security settings">
      <div className="space-y-6">
        {/* Change Password */}
        <div className="pb-6 border-b border-gray-100">
          <h3 className="font-medium text-navy-900 mb-4">Change password</h3>
          <div className="space-y-3 max-w-md">
            <div className="relative">
              <input type={showPasswords ? 'text' : 'password'} className="input pr-10" placeholder="Current password"
                value={passwordForm.current} onChange={e => setPasswordForm(p => ({ ...p, current: e.target.value }))} />
              <button onClick={() => setShowPasswords(!showPasswords)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <input type={showPasswords ? 'text' : 'password'} className="input" placeholder="New password (min 8 characters)"
              value={passwordForm.newPass} onChange={e => setPasswordForm(p => ({ ...p, newPass: e.target.value }))} />
            <input type={showPasswords ? 'text' : 'password'} className="input" placeholder="Confirm new password"
              value={passwordForm.confirm} onChange={e => setPasswordForm(p => ({ ...p, confirm: e.target.value }))} />
            <Button loading={loading} onClick={handlePasswordChange} size="sm">Update password</Button>
          </div>
        </div>

        {/* Phone Verification */}
        <div className="pb-6 border-b border-gray-100">
          <h3 className="font-medium text-navy-900 mb-1">Phone number</h3>
          <p className="text-sm text-gray-400 mb-4">
            {user?.phone_verified ? `Verified: ${user.phone}` : 'Add and verify your phone number for account security'}
          </p>
          <div className="space-y-3 max-w-md">
            <div className="flex gap-2">
              <input className="input flex-1" placeholder="+234 800 000 0000" value={phoneForm.phone}
                onChange={e => setPhoneForm(p => ({ ...p, phone: e.target.value }))} />
              <Button size="sm" variant="outline" loading={phoneLoading && !codeSent} onClick={handleSendCode} disabled={!phoneForm.phone || codeSent}>
                {codeSent ? 'Resend' : 'Send code'}
              </Button>
            </div>
            {codeSent && (
              <div className="flex gap-2">
                <input className="input flex-1" placeholder="6-digit code" value={phoneForm.code}
                  onChange={e => setPhoneForm(p => ({ ...p, code: e.target.value }))} maxLength={6} />
                <Button size="sm" loading={phoneLoading && codeSent} onClick={handleVerifyPhone} disabled={phoneForm.code.length !== 6}>Verify</Button>
              </div>
            )}
            <p className="text-xs text-gray-400">Max 5 verification attempts per 24 hours. A security email is sent each time a phone number is added.</p>
          </div>
        </div>

        {/* Two-Factor Auth */}
        <div className="pb-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-navy-900">Two-factor authentication</h3>
              <p className="text-sm text-gray-400 mt-0.5">Add an extra layer of security to your account</p>
            </div>
            <Button size="sm" variant="outline">
              {user?.two_factor_enabled ? 'Disable 2FA' : 'Enable 2FA'}
            </Button>
          </div>
        </div>

        {/* Active Sessions */}
        <div>
          <h3 className="font-medium text-navy-900 mb-3">Active sessions</h3>
          <p className="text-sm text-gray-400 mb-4">You are logged in on this device. You can sign out of all other devices.</p>
          <button onClick={handleLogoutAll} className="flex items-center gap-2 text-sm text-red-500 hover:underline">
            <LogOut className="w-4 h-4" /> Sign out of all devices
          </button>
        </div>
      </div>
    </SettingsLayout>
  )
}

// ── NOTIFICATIONS SETTINGS ────────────────────────────────────
export function NotificationSettings() {
  const [prefs, setPrefs] = useState({
    email_orders: true, email_messages: true, email_reviews: true,
    email_payments: true, email_security: true, email_marketing: false,
    push_orders: true, push_messages: true, push_reviews: false,
  })
  const [loading, setLoading] = useState(false)

  const toggle = (key: string) => setPrefs(p => ({ ...p, [key]: !p[key as keyof typeof p] }))

  const handleSave = async () => {
    setLoading(true)
    try {
      await axios.patch('/api/users/notification-preferences', prefs)
      toast.success('Notification preferences saved!')
    } catch {}
    setLoading(false)
  }

  const groups = [
    {
      title: 'Email notifications',
      items: [
        { key: 'email_orders', label: 'Order updates', desc: 'New orders, deliveries, completions' },
        { key: 'email_messages', label: 'New messages', desc: 'When someone sends you a message' },
        { key: 'email_reviews', label: 'Reviews', desc: 'When you receive a new review' },
        { key: 'email_payments', label: 'Payments & earnings', desc: 'Fund clearance, withdrawals' },
        { key: 'email_security', label: 'Security alerts', desc: 'New logins, phone changes (cannot be disabled)', disabled: true },
        { key: 'email_marketing', label: 'Tips & promotions', desc: 'Platform tips, promotions, and updates' },
      ],
    },
    {
      title: 'Push notifications',
      items: [
        { key: 'push_orders', label: 'Order updates', desc: 'Real-time order notifications' },
        { key: 'push_messages', label: 'New messages', desc: 'Instant message alerts' },
        { key: 'push_reviews', label: 'Reviews', desc: 'When you receive a new review' },
      ],
    },
  ]

  return (
    <SettingsLayout title="Notification preferences">
      <div className="space-y-6">
        {groups.map(group => (
          <div key={group.title}>
            <h3 className="font-medium text-navy-900 mb-4">{group.title}</h3>
            <div className="space-y-3">
              {group.items.map(item => (
                <div key={item.key} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-navy-900">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                  <button onClick={() => !item.disabled && toggle(item.key)}
                    className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${prefs[item.key as keyof typeof prefs] ? 'bg-green-500' : 'bg-gray-200'} ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${prefs[item.key as keyof typeof prefs] ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="pt-4 border-t border-gray-100">
          <Button loading={loading} onClick={handleSave}>Save preferences</Button>
        </div>
      </div>
    </SettingsLayout>
  )
}

// ── SECTION ACCESS ────────────────────────────────────────────
export function SectionAccessSettings() {
  const SECTIONS = [
    { id: 'gigs', label: 'Nolance Gigs', icon: Briefcase, desc: 'Create gigs and accept orders — the core freelancing platform', default: true },
    { id: 'scout', label: 'Nolance Scout', icon: Search, desc: 'Browse job posts, send proposals, and win projects like Upwork' },
    { id: 'marketplace', label: 'Nolance Marketplace', icon: Store, desc: 'Buy and sell digital and physical assets' },
    { id: 'community', label: 'Nolance Community', icon: Users, desc: 'Join communities, share work, and find clients' },
    { id: 'directory', label: 'Nolance Directory', icon: MapPin, desc: 'List your business or find businesses that need freelancers' },
  ]

  const [registrations, setRegistrations] = useState<string[]>(['gigs'])
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState<string | null>(null)

  useEffect(() => {
    fetchSections()
  }, [])

  const fetchSections = async () => {
    try {
      const res = await axios.get('/api/users/sections')
      setRegistrations(res.data.data?.map((s: any) => s.section) || ['gigs'])
    } catch {}
    setLoading(false)
  }

  const handleRegister = async (sectionId: string) => {
    setRegistering(sectionId)
    try {
      await axios.post('/api/users/sections', { section: sectionId })
      setRegistrations(prev => [...prev, sectionId])
      toast.success(`${SECTIONS.find(s => s.id === sectionId)?.label} access activated!`)
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to register')
    }
    setRegistering(null)
  }

  return (
    <SettingsLayout title="Section access">
      <p className="text-sm text-gray-400 mb-5">
        Your Nolance account gives you access to register for any of the five sections. Each section has its own terms you must agree to.
      </p>
      <div className="space-y-3">
        {SECTIONS.map(section => {
          const isActive = registrations.includes(section.id)
          return (
            <div key={section.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${isActive ? 'border-green-200 bg-green-50' : 'border-gray-100 bg-white'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-green-500' : 'bg-gray-100'}`}>
                <section.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-navy-900">{section.label}</p>
                  {section.default && <span className="badge badge-gray text-xs">Default</span>}
                  {isActive && <span className="badge badge-green text-xs flex items-center gap-1"><Check className="w-3 h-3" /> Active</span>}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{section.desc}</p>
              </div>
              {!isActive && (
                <Button size="sm" loading={registering === section.id}
                  onClick={() => handleRegister(section.id)}>
                  Register
                </Button>
              )}
            </div>
          )
        })}
      </div>
    </SettingsLayout>
  )
}

// Default export for /settings/profile
export default ProfileSettings
