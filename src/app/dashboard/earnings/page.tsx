'use client'
import { useState, useEffect } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { formatCurrency, formatDate, formatDateTime } from '@/utils'
import { DollarSign, Clock, TrendingUp, Download, Plus, AlertCircle, Check } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

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

const CURRENCIES = [
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'NGN', label: 'NGN — Nigerian Naira' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'CAD', label: 'CAD — Canadian Dollar' },
  { value: 'AUD', label: 'AUD — Australian Dollar' },
]

// Mock conversion rates (in production: fetch live rates)
const RATES: Record<string, number> = { USD: 1, NGN: 1580, GBP: 0.79, EUR: 0.92, CAD: 1.36, AUD: 1.53 }

export default function EarningsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [showAddMethod, setShowAddMethod] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [selectedMethod, setSelectedMethod] = useState('')
  const [targetCurrency, setTargetCurrency] = useState('USD')
  const [withdrawLoading, setWithdrawLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'pending' | 'history'>('overview')

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const res = await axios.get('/api/withdrawals')
      setData(res.data.data)
    } catch {}
    setLoading(false)
  }

  const convertedAmount = withdrawAmount
    ? parseFloat((Number(withdrawAmount) * RATES[targetCurrency]).toFixed(2))
    : 0

  const handleWithdraw = async () => {
    if (!withdrawAmount || Number(withdrawAmount) < 5) {
      toast.error('Minimum withdrawal is $5')
      return
    }
    if (!selectedMethod) {
      toast.error('Please select a withdrawal method')
      return
    }
    if (Number(withdrawAmount) > (data?.balance?.available || 0)) {
      toast.error('Insufficient available balance')
      return
    }

    setWithdrawLoading(true)
    try {
      await axios.post('/api/withdrawals', {
        amount: Number(withdrawAmount),
        method_id: selectedMethod,
        target_currency: targetCurrency !== 'USD' ? targetCurrency : undefined,
      })
      toast.success('Withdrawal initiated successfully!')
      setShowWithdraw(false)
      setWithdrawAmount('')
      fetchData()
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Withdrawal failed')
    }
    setWithdrawLoading(false)
  }

  const balance = data?.balance || { available: 0, pending_clearance: 0, total_earned: 0, total_withdrawn: 0 }
  const pendingEarnings = data?.pending_earnings || []
  const withdrawals = data?.withdrawals || []
  const methods = data?.withdrawal_methods || []

  if (loading) return (
    <div className="min-h-screen bg-gray-50"><Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="grid grid-cols-3 gap-4">{[1,2,3].map(i=><div key={i} className="h-28 bg-gray-200 rounded-2xl"/>)}</div>
        <div className="h-64 bg-gray-200 rounded-2xl"/>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-navy-900">Earnings & Withdrawals</h1>
            <p className="text-sm text-gray-400 mt-0.5">Manage your Nolance balance</p>
          </div>
          <Button onClick={() => setShowWithdraw(true)} disabled={balance.available < 5}>
            <Download className="w-4 h-4" /> Withdraw funds
          </Button>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-sm text-gray-400">Available to withdraw</p>
            </div>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(balance.available)}</p>
            <Button size="sm" onClick={() => setShowWithdraw(true)} disabled={balance.available < 5} className="mt-3 w-full">
              Withdraw
            </Button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-sm text-gray-400">Pending clearance</p>
            </div>
            <p className="text-3xl font-bold text-navy-900">{formatCurrency(balance.pending_clearance)}</p>
            <p className="text-xs text-gray-400 mt-3">Clears based on your seller level</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-sm text-gray-400">Total earned</p>
            </div>
            <p className="text-3xl font-bold text-navy-900">{formatCurrency(balance.total_earned)}</p>
            <p className="text-xs text-gray-400 mt-3">All time on Nolance</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-5">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'pending', label: `Pending (${pendingEarnings.length})` },
            { id: 'history', label: 'Withdrawal history' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-3 text-sm border-b-2 transition-colors ${activeTab === tab.id ? 'border-green-500 text-green-600 font-medium' : 'border-transparent text-gray-500 hover:text-navy-900'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Pending Clearance */}
        {activeTab === 'pending' && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {pendingEarnings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-3xl mb-2">💰</p>
                <p className="text-sm text-gray-400">No pending earnings right now</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Order</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Amount</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Clears on</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingEarnings.map((earning: any) => (
                    <tr key={earning.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{earning.order_id?.substring(0,8)}</td>
                      <td className="px-4 py-3 font-semibold text-navy-900">{formatCurrency(earning.net_amount)}</td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(earning.clears_at)}</td>
                      <td className="px-4 py-3">
                        <span className="badge badge-amber text-xs">Pending</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Withdrawal History */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {withdrawals.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-3xl mb-2">📤</p>
                <p className="text-sm text-gray-400">No withdrawals yet</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Amount</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Method</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((w: any) => (
                    <tr key={w.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500">{formatDate(w.created_at)}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-navy-900">{formatCurrency(w.amount)}</p>
                        {w.converted_amount && w.target_currency !== 'USD' && (
                          <p className="text-xs text-gray-400">≈ {w.target_currency} {w.converted_amount.toLocaleString()}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{w.method?.label || w.method?.type || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`badge text-xs ${
                          w.status === 'completed' ? 'badge-green' :
                          w.status === 'processing' ? 'badge-blue' :
                          w.status === 'flagged' ? 'badge-amber' :
                          w.status === 'failed' ? 'badge-red' : 'badge-gray'
                        }`}>
                          {w.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Withdrawal Methods */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-navy-900">Withdrawal methods</h3>
                <Button size="sm" variant="outline" onClick={() => setShowAddMethod(true)}>
                  <Plus className="w-4 h-4" /> Add method
                </Button>
              </div>

              {methods.length === 0 ? (
                <div className="border-2 border-dashed border-gray-100 rounded-xl p-8 text-center">
                  <p className="text-sm text-gray-400 mb-3">No withdrawal methods added yet</p>
                  <Button size="sm" onClick={() => setShowAddMethod(true)}>
                    <Plus className="w-4 h-4" /> Add your first method
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {methods.map((method: any) => (
                    <div key={method.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-navy-900">{method.label || method.type}</p>
                        <p className="text-xs text-gray-400">{method.type}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {method.is_verified ? (
                          <span className="badge badge-green text-xs flex items-center gap-1"><Check className="w-3 h-3" /> Verified</span>
                        ) : (
                          <span className="badge badge-amber text-xs">Pending verification</span>
                        )}
                        {method.is_default && <span className="badge badge-navy text-xs">Default</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Clearance Timeline by Level */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-semibold text-navy-900 mb-4">Fund clearance by seller level</h3>
              <div className="space-y-3">
                {[
                  { level: 'New Seller', days: 10, color: 'bg-gray-200' },
                  { level: 'Level 1', days: 7, color: 'bg-blue-200' },
                  { level: 'Level 2', days: 3, color: 'bg-purple-200' },
                  { level: 'Top Rated', days: 1, color: 'bg-green-500' },
                  { level: 'Pro Verified', days: 1, color: 'bg-green-500' },
                  { level: 'Nolance Plus', days: 5, color: 'bg-amber-300' },
                ].map(item => (
                  <div key={item.level} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-sm text-navy-900 flex-1">{item.level}</span>
                    <span className="text-sm font-medium text-gray-500">
                      {item.days === 1 ? '24 hours' : `${item.days} days`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── WITHDRAW MODAL ────────────────────────── */}
        {showWithdraw && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-modal">
              <h2 className="text-xl font-semibold text-navy-900 mb-1">Withdraw funds</h2>
              <p className="text-sm text-gray-400 mb-5">Available: {formatCurrency(balance.available)}</p>

              <div className="space-y-4">
                <div>
                  <label className="input-label">Amount (USD)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input type="number" min={5} max={balance.available} value={withdrawAmount}
                      onChange={e => setWithdrawAmount(e.target.value)}
                      placeholder="0.00" className="input pl-7" />
                  </div>
                  <p className="input-hint">Minimum $5 · Maximum {formatCurrency(balance.available)}</p>
                </div>

                <div>
                  <label className="input-label">Receive in</label>
                  <select className="select" value={targetCurrency} onChange={e => setTargetCurrency(e.target.value)}>
                    {CURRENCIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>

                {withdrawAmount && targetCurrency !== 'USD' && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                    <p className="text-sm text-green-700">
                      You will receive approximately <strong>{targetCurrency} {convertedAmount.toLocaleString()}</strong>
                    </p>
                    <p className="text-xs text-green-600 mt-1">Rate: 1 USD = {RATES[targetCurrency]} {targetCurrency} (live rate at time of processing)</p>
                  </div>
                )}

                <div>
                  <label className="input-label">Withdrawal method</label>
                  {methods.filter((m: any) => m.is_verified).length === 0 ? (
                    <div className="border border-amber-200 bg-amber-50 rounded-xl p-4 text-center">
                      <AlertCircle className="w-5 h-5 text-amber-500 mx-auto mb-2" />
                      <p className="text-sm text-amber-700">No verified withdrawal methods.</p>
                      <button onClick={() => { setShowWithdraw(false); setShowAddMethod(true) }}
                        className="text-sm text-amber-600 font-medium hover:underline mt-1">Add a method</button>
                    </div>
                  ) : (
                    <select className="select" value={selectedMethod} onChange={e => setSelectedMethod(e.target.value)}>
                      <option value="">Select method</option>
                      {methods.filter((m: any) => m.is_verified).map((m: any) => (
                        <option key={m.id} value={m.id}>{m.label || m.type}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setShowWithdraw(false)} fullWidth>Cancel</Button>
                <Button loading={withdrawLoading} onClick={handleWithdraw} fullWidth
                  disabled={!withdrawAmount || !selectedMethod || Number(withdrawAmount) < 5}>
                  Withdraw {withdrawAmount ? formatCurrency(Number(withdrawAmount)) : ''}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── ADD METHOD MODAL ──────────────────────── */}
        {showAddMethod && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-modal">
              <h2 className="text-xl font-semibold text-navy-900 mb-5">Add withdrawal method</h2>
              <AddMethodForm onClose={() => { setShowAddMethod(false); fetchData() }} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function AddMethodForm({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState('nigeria_bank')
  const [label, setLabel] = useState('')
  const [details, setDetails] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const FIELDS: Record<string, { key: string; label: string; placeholder: string }[]> = {
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

  const fields = FIELDS[type] || []

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await axios.post('/api/withdrawals/methods', { type, label: label || type, details })
      toast.success('Withdrawal method added! Verification within 24 hours.')
      onClose()
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to add method')
    }
    setLoading(false)
  }

  return (
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
          <label className="input-label">{field.label}</label>
          <input className="input" placeholder={field.placeholder}
            value={details[field.key] || ''}
            onChange={e => setDetails(prev => ({ ...prev, [field.key]: e.target.value }))} />
        </div>
      ))}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
        <p className="text-xs text-amber-700">Withdrawal methods require verification within 24 hours. You will be notified by email when verified.</p>
      </div>
      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onClose} fullWidth>Cancel</Button>
        <Button loading={loading} onClick={handleSubmit} fullWidth>Add method</Button>
      </div>
    </div>
  )
}
