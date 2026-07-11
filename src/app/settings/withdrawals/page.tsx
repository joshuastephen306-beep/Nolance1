'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Avatar } from '@/components/ui'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/auth.store'
import { User, Shield, Bell, CreditCard, Download, Settings, Plus, Check, Trash2, Star } from 'lucide-react'
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

const WITHDRAWAL_METHODS = [
  { value: 'nigeria_bank', label: 'Nigerian Bank Account' },
  { value: 'opay', label: 'Opay Wallet' },
  { value: 'kuda', label: 'Kuda Bank' },
  { value: 'palmpay', label: 'Palmpay' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'grey', label: 'Grey (USD Account)' },
  { value: 'wise', label: 'Wise' },
  { value: 'payoneer', label: 'Payoneer' },
  { value: 'bank_wire', label: 'International Bank Wire' },
]

const METHOD_FIELDS: Record<string, { key: string; label: string; placeholder: string }[]> = {
  nigeria_bank: [
    { key: 'bank_name', label: 'Bank name', placeholder: 'e.g. GTBank, Access, Zenith' },
    { key: 'account_number', label: 'Account number', placeholder: '10-digit account number' },
    { key: 'account_name', label: 'Account name', placeholder: 'As on your bank account' },
  ],
  paypal: [{ key: 'email', label: 'PayPal email', placeholder: 'your@paypal.com' }],
  grey: [
    { key: 'account_number', label: 'Grey account number', placeholder: 'Your Grey USD account' },
    { key: 'routing_number', label: 'Routing number', placeholder: 'US routing number' },
  ],
  wise: [{ key: 'email', label: 'Wise email', placeholder: 'your@wise.com' }],
  payoneer: [{ key: 'email', label: 'Payoneer email', placeholder: 'your@payoneer.com' }],
  opay: [{ key: 'phone', label: 'Opay phone number', placeholder: '+234....' }],
  kuda: [
    { key: 'account_number', label: 'Kuda account number', placeholder: '10-digit account number' },
    { key: 'account_name', label: 'Account name', placeholder: 'As registered on Kuda' },
  ],
  palmpay: [{ key: 'phone', label: 'Palmpay phone number', placeholder: '+234....' }],
  bank_wire: [
    { key: 'bank_name', label: 'Bank name', placeholder: 'Your bank name' },
    { key: 'account_number', label: 'Account / IBAN', placeholder: 'Account or IBAN number' },
    { key: 'swift_code', label: 'SWIFT/BIC code', placeholder: 'Bank SWIFT code' },
    { key: 'account_name', label: 'Account holder name', placeholder: 'Full name on account' },
    { key: 'country', label: 'Country', placeholder: 'Bank country' },
  ],
}

export default function WithdrawalsSettingsPage() {
  const [methods, setMethods] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const [type, setType] = useState('nigeria_bank')
  const [label, setLabel] = useState('')
  const [details, setDetails] = useState<Record<string, string>>({})

  useEffect(() => { fetchMethods() }, [])

  const fetchMethods = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/withdrawals/methods')
      setMethods(res.data.data || [])
    } catch {}
    setLoading(false)
  }

  const handleAdd = async () => {
    const fields = METHOD_FIELDS[type] || []
    for (const f of fields) {
      if (!details[f.key]) { toast.error(`${f.label} is required`); return }
    }
    setAddLoading(true)
    try {
      await axios.post('/api/withdrawals/methods', { type, label: label || type, details })
      toast.success('Withdrawal method added! Verification within 24 hours.')
      setShowAdd(false)
      setType('nigeria_bank')
      setLabel('')
      setDetails({})
      fetchMethods()
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to add method')
    }
    setAddLoading(false)
  }

  const handleDelete = async (methodId: string) => {
    if (!confirm('Remove this withdrawal method?')) return
    try {
      await axios.delete(`/api/withdrawals/methods/${methodId}`)
      toast.success('Method removed')
      fetchMethods()
    } catch {
      toast.error('Failed to remove method')
    }
  }

  const handleSetDefault = async (methodId: string) => {
    try {
      await axios.patch(`/api/withdrawals/methods/${methodId}`, { is_default: true })
      fetchMethods()
      toast.success('Default method updated')
    } catch {}
  }

  const fields = METHOD_FIELDS[type] || []

  return (
    <SettingsLayout title="Withdrawal methods">
      <div className="space-y-5">
        <p className="text-sm text-gray-400">
          Add bank accounts and payment wallets to withdraw your NOLANCE earnings. All methods require verification within 24 hours before first use.
        </p>

        <div className="flex items-center justify-between">
          <h3 className="font-medium text-navy-900">Your methods ({methods.length}/5)</h3>
          <Button size="sm" variant="outline" onClick={() => setShowAdd(true)} disabled={methods.length >= 5}>
            <Plus className="w-3.5 h-3.5" /> Add method
          </Button>
        </div>

        {loading ? (
          <div className="space-y-2">{[1,2].map(i=><div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse"/>)}</div>
        ) : methods.length === 0 ? (
          <div className="border-2 border-dashed border-gray-100 rounded-xl p-8 text-center">
            <Download className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400 mb-3">No withdrawal methods added yet</p>
            <Button size="sm" onClick={() => setShowAdd(true)}>Add your first method</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {methods.map(method => (
              <div key={method.id} className={`border rounded-xl p-4 ${method.is_default ? 'border-green-200 bg-green-50/30' : 'border-gray-100'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-navy-900">{method.label || method.type}</p>
                      {method.is_verified
                        ? <span className="badge badge-green text-xs flex items-center gap-1"><Check className="w-3 h-3"/>Verified</span>
                        : <span className="badge badge-amber text-xs">Pending verification</span>}
                      {method.is_default && <span className="badge badge-navy text-xs flex items-center gap-1"><Star className="w-3 h-3"/>Default</span>}
                    </div>
                    <p className="text-xs text-gray-400 capitalize">{method.type.replace('_', ' ')}</p>
                    {method.details && (
                      <div className="mt-1.5 flex flex-wrap gap-2">
                        {Object.entries(method.details as Record<string, string>).slice(0, 2).map(([k, v]) => (
                          <span key={k} className="text-xs text-gray-400">
                            {k.replace('_', ' ')}: <span className="text-navy-700 font-medium">
                              {k === 'account_number' ? `••••${String(v).slice(-4)}` : String(v)}
                            </span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!method.is_default && method.is_verified && (
                      <button onClick={() => handleSetDefault(method.id)} className="text-xs text-green-600 hover:underline">Set default</button>
                    )}
                    <button onClick={() => handleDelete(method.id)} className="w-7 h-7 border border-gray-200 rounded-lg flex items-center justify-center text-red-400 hover:border-red-300 hover:bg-red-50 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Supported methods info */}
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
          <p className="text-xs font-medium text-navy-900 mb-2">Supported withdrawal methods</p>
          <div className="flex flex-wrap gap-2">
            {WITHDRAWAL_METHODS.map(m => (
              <span key={m.value} className="text-xs bg-white border border-gray-200 text-gray-600 px-2 py-1 rounded-lg">{m.label}</span>
            ))}
          </div>
        </div>

        {/* Add Method Modal */}
        {showAdd && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4 py-8 overflow-y-auto">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-modal">
              <h2 className="text-xl font-semibold text-navy-900 mb-5">Add withdrawal method</h2>
              <div className="space-y-4">
                <div>
                  <label className="input-label">Method type</label>
                  <select className="select" value={type} onChange={e => { setType(e.target.value); setDetails({}) }}>
                    {WITHDRAWAL_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="input-label">Label (optional)</label>
                  <input className="input" placeholder="e.g. My GTBank account" value={label} onChange={e => setLabel(e.target.value)} />
                </div>
                {fields.map(field => (
                  <div key={field.key}>
                    <label className="input-label">{field.label} <span className="text-red-400">*</span></label>
                    <input className="input" placeholder={field.placeholder}
                      value={details[field.key] || ''}
                      onChange={e => setDetails(p => ({ ...p, [field.key]: e.target.value }))} />
                  </div>
                ))}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-xs text-amber-700">Your method will be verified within 24 hours. You will receive a confirmation email when it is ready to use.</p>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setShowAdd(false)} fullWidth>Cancel</Button>
                  <Button loading={addLoading} onClick={handleAdd} fullWidth>Add method</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SettingsLayout>
  )
}
