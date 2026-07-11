import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { Check, Zap, Award, Star, TrendingUp, BookOpen, DollarSign, Users, ArrowRight } from 'lucide-react'

// ── NOLANCE PLUS ──────────────────────────────────────────────
export default function PlusPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="bg-navy-900 py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 px-4 py-1.5 rounded-full text-sm font-medium mb-5">
            <Star className="w-4 h-4" /> NOLANCE PLUS
          </div>
          <h1 className="text-5xl font-semibold text-white mb-5">Get paid faster. Grow faster.</h1>
          <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
            NOLANCE Plus reduces your clearance to just 5 days (vs 10 for New Sellers), unlocks exclusive features, and boosts your ranking in search results.
          </p>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Monthly */}
            <div className="border-2 border-gray-100 rounded-2xl p-6">
              <p className="text-sm font-medium text-gray-400 mb-1">Monthly</p>
              <div className="flex items-end gap-1 mb-4"><span className="text-4xl font-bold text-navy-900">$9</span><span className="text-gray-400 mb-1">/month</span></div>
              <ul className="space-y-3 mb-6">
                {['5-day fund clearance', 'Priority in search results', 'Exclusive NOLANCE Plus badge', 'Early access to new features', 'Priority support'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600"><Check className="w-4 h-4 text-green-500" />{f}</li>
                ))}
              </ul>
              <Link href="/auth/signup"><Button fullWidth>Subscribe monthly</Button></Link>
            </div>
            {/* Annual */}
            <div className="border-2 border-green-500 rounded-2xl p-6 relative">
              <div className="absolute -top-3 right-4 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">Best value — save 33%</div>
              <p className="text-sm font-medium text-gray-400 mb-1">Annual</p>
              <div className="flex items-end gap-1 mb-1"><span className="text-4xl font-bold text-navy-900">$72</span><span className="text-gray-400 mb-1">/year</span></div>
              <p className="text-sm text-green-600 font-medium mb-4">Only $6/month</p>
              <ul className="space-y-3 mb-6">
                {['5-day fund clearance', 'Priority in search results', 'Exclusive NOLANCE Plus badge', 'Early access to new features', 'Priority support', '2 months free'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600"><Check className="w-4 h-4 text-green-500" />{f}</li>
                ))}
              </ul>
              <Link href="/auth/signup"><Button fullWidth>Subscribe annually</Button></Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
