'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/auth.store'
import { DollarSign, Users, TrendingUp, Copy, Check, ArrowRight, Gift } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function AffiliatePage() {
  const { user, isAuthenticated } = useAuthStore()
  const [affiliate, setAffiliate] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) fetchAffiliate()
  }, [isAuthenticated])

  const fetchAffiliate = async () => {
    try {
      const res = await axios.get('/api/users/affiliate')
      setAffiliate(res.data.data)
    } catch {}
  }

  const handleJoin = async () => {
    setLoading(true)
    try {
      const res = await axios.post('/api/users/affiliate', {})
      setAffiliate(res.data.data)
      toast.success('Welcome to the NOLANCE Affiliate Program!')
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to join affiliate program')
    }
    setLoading(false)
  }

  const referralLink = affiliate
    ? `${process.env.NEXT_PUBLIC_APP_URL || 'https://nolance.com'}?ref=${affiliate.referral_code}`
    : ''

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    toast.success('Link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const HOW_IT_WORKS = [
    { step: '1', title: 'Get your link', desc: 'Join the program and get your unique referral link instantly' },
    { step: '2', title: 'Share it', desc: 'Share your link on social media, blogs, YouTube — anywhere' },
    { step: '3', title: 'They sign up', desc: 'When someone signs up through your link, they are tracked to you' },
    { step: '4', title: 'You earn 10%', desc: 'Earn 10% of every sale your referrals make for 12 months' },
  ]

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="bg-navy-900 py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Gift className="w-7 h-7 text-green-400" />
          </div>
          <p className="text-green-400 text-sm font-semibold uppercase tracking-widest mb-3">AFFILIATE PROGRAM</p>
          <h1 className="text-5xl font-semibold text-white mb-5">Earn 10% on every<br /><span className="text-green-400">referral you make</span></h1>
          <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            Refer sellers and buyers to NOLANCE. Earn 10% of every transaction your referrals make — for a full 12 months. No cap.
          </p>
          {isAuthenticated ? (
            affiliate ? (
              <div className="bg-white/10 border border-white/20 rounded-2xl p-5 max-w-md mx-auto">
                <p className="text-green-400 text-sm font-medium mb-2">Your referral link</p>
                <div className="flex gap-2">
                  <input readOnly value={referralLink}
                    className="flex-1 bg-white/10 border border-white/20 text-white text-sm rounded-xl px-4 py-2.5 outline-none" />
                  <button onClick={copyLink}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${copied ? 'bg-green-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-2">Code: {affiliate.referral_code}</p>
              </div>
            ) : (
              <Button size="lg" className="bg-green-500 hover:bg-green-600" loading={loading} onClick={handleJoin}>
                Join the affiliate program <ArrowRight className="w-4 h-4" />
              </Button>
            )
          ) : (
            <Link href="/auth/signup">
              <Button size="lg" className="bg-green-500 hover:bg-green-600">
                Get started free <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Stats */}
      <div className="bg-white border-b border-gray-100 py-8 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[
            { icon: DollarSign, value: '10%', label: 'Commission rate' },
            { icon: TrendingUp, value: '12 months', label: 'Per referral tracking' },
            { icon: Users, value: 'Unlimited', label: 'Referral cap' },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label}>
              <Icon className="w-5 h-5 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-navy-900">{value}</p>
              <p className="text-sm text-gray-400">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <section className="py-16 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="sec-label">Process</p>
            <h2 className="sec-title">How the affiliate program works</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map(item => (
              <div key={item.step} className="text-center">
                <div className="w-10 h-10 rounded-full bg-green-500 text-white text-sm font-semibold flex items-center justify-center mx-auto mb-3">{item.step}</div>
                <h3 className="text-sm font-semibold text-navy-900 mb-2">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Affiliate Dashboard (if joined) */}
      {affiliate && (
        <section className="py-16 px-4 sm:px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-navy-900 mb-6">Your affiliate stats</h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Total referrals', value: affiliate.total_referrals || 0 },
                { label: 'Total earnings', value: `$${affiliate.total_earnings || 0}` },
                { label: 'Pending payout', value: '$0' },
              ].map(stat => (
                <div key={stat.label} className="bg-gray-50 border border-gray-100 rounded-xl p-5 text-center">
                  <p className="text-3xl font-bold text-navy-900">{stat.value}</p>
                  <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="py-16 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold text-navy-900 mb-6 text-center">Frequently asked questions</h2>
          <div className="space-y-4">
            {[
              { q: 'When do I get paid?', a: 'Affiliate earnings are paid on the 1st of every month to your NOLANCE balance. You can then withdraw using any supported method.' },
              { q: 'Is there a minimum payout?', a: 'Yes, the minimum affiliate payout is $20. Balances below this roll over to the next month.' },
              { q: 'Who counts as a referral?', a: 'Anyone who signs up through your unique referral link and completes at least one transaction on the platform.' },
              { q: 'Can I refer businesses too?', a: 'Yes! You earn 10% on all transactions your referrals make — whether they are buyers, sellers, or both.' },
              { q: 'Is there a limit to how much I can earn?', a: 'No cap whatsoever. Some top affiliates earn $5,000+ per month by promoting Nolance to large audiences.' },
            ].map(({ q, a }) => (
              <div key={q} className="bg-white border border-gray-100 rounded-xl p-5">
                <p className="text-sm font-semibold text-navy-900 mb-2">{q}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
