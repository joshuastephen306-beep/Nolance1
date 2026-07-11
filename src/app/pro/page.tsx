// ── PRO VERIFIED ─────────────────────────────────────────────
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { Shield, CheckCircle, Award, Star, Zap, ArrowRight } from 'lucide-react'

export default function ProPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="bg-navy-900 py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-14 h-14 bg-amber-400/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Award className="w-7 h-7 text-amber-400" />
          </div>
          <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-3">NOLANCE PRO VERIFIED</p>
          <h1 className="text-5xl font-semibold text-white mb-5">The highest honour on Nolance</h1>
          <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            Pro Verified is the pinnacle of seller achievement on NOLANCE. It is awarded — not earned by numbers alone. Background checked, skills tested, and hand-reviewed by our team.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="bg-amber-400 hover:bg-amber-500 text-navy-900 font-semibold">
              Start your journey
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-navy-900 mb-3">What makes Pro Verified?</h2>
            <p className="text-gray-500">Three things that matter: who you are, what you can do, and your track record.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'Background check', desc: 'Full identity verification and background check conducted by our team. We confirm you are who you say you are.', badge: 'Step 1' },
              { icon: CheckCircle, title: 'Skills assessment', desc: 'Category-specific skills test designed by industry experts. You must score in the top 10% to qualify.', badge: 'Step 2' },
              { icon: Award, title: 'Manual review', desc: 'Our team personally reviews your portfolio, work history, client reviews, and professional standing on the platform.', badge: 'Step 3' },
            ].map(item => (
              <div key={item.title} className="border border-gray-100 rounded-2xl p-6 text-center">
                <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full mb-4 inline-block">{item.badge}</span>
                <item.icon className="w-8 h-8 text-navy-700 mx-auto mb-3" />
                <h3 className="font-semibold text-navy-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-semibold text-navy-900 mb-10 text-center">Pro Verified benefits</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              'Exclusive Pro Verified badge on your profile and gigs',
              '24-hour fund clearance — the fastest on the platform',
              'Priority placement in search results — always shown first',
              'Eligibility for NOLANCE Managed Services partnerships',
              'Dedicated account manager for large projects',
              'Early access to all new platform features',
              'Exclusive access to Pro Verified community and events',
              'Higher proposal limits in Scout (unlimited)',
            ].map(benefit => (
              <div key={benefit} className="flex items-start gap-3 bg-white border border-gray-100 rounded-xl p-4">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-navy-800">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 bg-navy-900 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-3">Requirements</p>
          <h2 className="text-3xl font-semibold text-white mb-4">How to qualify</h2>
          <div className="text-left bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 space-y-3">
            {[
              'Top Rated seller status (30+ orders, 20+ clients, $10,000+ earnings, 4.9★)',
              'Active on NOLANCE for at least 180 days',
              'Zero policy violations in the past 12 months',
              'Pass the background check and skills assessment',
              'Manual approval by the NOLANCE team',
            ].map(req => (
              <div key={req} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-amber-400 flex-shrink-0 mt-0.5">→</span> {req}
              </div>
            ))}
          </div>
          <Link href="/auth/signup">
            <Button size="lg" className="bg-amber-400 hover:bg-amber-500 text-navy-900 font-semibold">
              Apply for Pro Verified <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  )
}
