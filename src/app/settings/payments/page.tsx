'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Avatar } from '@/components/ui'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/auth.store'
import { User, Shield, Bell, CreditCard, Download, Settings, Plus, Check, Trash2, AlertCircle } from 'lucide-react'
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

// ── PAYMENT METHODS (for buying) ─────────────────────────────
export default function PaymentsSettingsPage() {
  const [cards, setCards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddCard, setShowAddCard] = useState(false)
  const [cardForm, setCardForm] = useState({ number: '', expiry: '', cvv: '', name: '' })

  useEffect(() => {
    // In production: fetch saved cards from Stripe/Paystack
    setCards([])
    setLoading(false)
  }, [])

  const handleAddCard = async () => {
    toast('Card saving coming soon! For now, enter card details at checkout.', { icon: 'ℹ️' })
    setShowAddCard(false)
  }

  return (
    <SettingsLayout title="Payment methods">
      <div className="space-y-5">
        <p className="text-sm text-gray-400">
          Payment methods are used when purchasing services, Marketplace items, and NOLANCE Plus. Cards are stored securely by our payment providers and never on NOLANCE servers.
        </p>

        {/* Balance */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm font-medium text-green-800 mb-1">NOLANCE Balance</p>
          <p className="text-xs text-green-700">You can also pay using your NOLANCE balance. Fund your balance through a withdrawal reversal or direct top-up.</p>
        </div>

        {/* Saved Cards */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-navy-900">Saved cards</h3>
            <Button size="sm" variant="outline" onClick={() => setShowAddCard(true)}>
              <Plus className="w-3.5 h-3.5" /> Add card
            </Button>
          </div>

          {cards.length === 0 ? (
            <div className="border-2 border-dashed border-gray-100 rounded-xl p-8 text-center">
              <CreditCard className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400 mb-3">No saved payment methods</p>
              <Button size="sm" variant="outline" onClick={() => setShowAddCard(true)}>Add a card</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {cards.map((card: any) => (
                <div key={card.id} className="flex items-center justify-between border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-7 bg-gray-100 rounded flex items-center justify-center text-xs font-bold text-gray-500">
                      {card.brand?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-navy-900">•••• {card.last4}</p>
                      <p className="text-xs text-gray-400">Expires {card.exp_month}/{card.exp_year}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {card.is_default && <span className="badge badge-green text-xs">Default</span>}
                    <button className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Supported Payment Methods */}
        <div>
          <h3 className="font-medium text-navy-900 mb-3">Accepted payment methods</h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {['Visa', 'Mastercard', 'Paystack', 'Stripe', 'Balance'].map(method => (
              <div key={method} className="border border-gray-100 rounded-xl p-3 text-center">
                <p className="text-xs font-medium text-gray-600">{method}</p>
              </div>
            ))}
          </div>
        </div>

        {showAddCard && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-modal">
              <h2 className="text-xl font-semibold text-navy-900 mb-5">Add a payment card</h2>
              <div className="space-y-4">
                <div>
                  <label className="input-label">Card number</label>
                  <input className="input" placeholder="1234 5678 9012 3456" value={cardForm.number}
                    onChange={e => setCardForm(p => ({ ...p, number: e.target.value }))} maxLength={19} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Expiry date</label>
                    <input className="input" placeholder="MM/YY" value={cardForm.expiry}
                      onChange={e => setCardForm(p => ({ ...p, expiry: e.target.value }))} maxLength={5} />
                  </div>
                  <div>
                    <label className="input-label">CVV</label>
                    <input className="input" placeholder="123" type="password" value={cardForm.cvv}
                      onChange={e => setCardForm(p => ({ ...p, cvv: e.target.value }))} maxLength={4} />
                  </div>
                </div>
                <div>
                  <label className="input-label">Cardholder name</label>
                  <input className="input" placeholder="Name on card" value={cardForm.name}
                    onChange={e => setCardForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl p-3">
                  <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700">Your card details are encrypted and processed securely by Stripe. NOLANCE never stores your full card number.</p>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setShowAddCard(false)} fullWidth>Cancel</Button>
                  <Button onClick={handleAddCard} fullWidth>Save card</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SettingsLayout>
  )
}
