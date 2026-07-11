import Link from 'next/link'
import { ArrowRight, Shield, Clock, Percent, Users, Star, TrendingUp, Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

const CATEGORIES = [
  { name: 'Graphics & Design', count: '12,400+', icon: '🎨', slug: 'graphics-design' },
  { name: 'Programming & Tech', count: '9,800+', icon: '💻', slug: 'programming-tech' },
  { name: 'Digital Marketing', count: '7,200+', icon: '📣', slug: 'digital-marketing' },
  { name: 'Writing & Translation', count: '5,600+', icon: '✍️', slug: 'writing-translation' },
  { name: 'Video & Animation', count: '4,900+', icon: '🎬', slug: 'video-animation' },
  { name: 'Music & Audio', count: '3,400+', icon: '🎵', slug: 'music-audio' },
  { name: 'AI Services', count: '6,100+', icon: '🤖', slug: 'ai-services' },
  { name: 'Business', count: '4,200+', icon: '💼', slug: 'business' },
  { name: 'Photography', count: '2,800+', icon: '📷', slug: 'photography' },
  { name: 'E-commerce', count: '3,100+', icon: '🛒', slug: 'ecommerce' },
]

const HOW_STEPS = [
  { num: '1', title: 'Search or post', desc: 'Browse thousands of gigs or post your job to Scout — your workflow, your choice' },
  { num: '2', title: 'Get matched', desc: 'NOLANCE AI finds the right talent for your exact project needs instantly' },
  { num: '3', title: 'Pay securely', desc: 'Escrow holds your funds safely — released only when you are satisfied' },
  { num: '4', title: 'Get great work', desc: 'Receive quality-reviewed delivery and grow your business with confidence' },
]

const TRENDING = [
  { label: 'Logo design', trend: 'Most ordered', color: 'bg-blue-50', icon: '🎨' },
  { label: 'Website development', trend: 'High demand', color: 'bg-purple-50', icon: '💻' },
  { label: 'AI automation', trend: 'Rising fast', color: 'bg-green-50', icon: '🤖' },
  { label: 'Video editing', trend: 'Top rated', color: 'bg-amber-50', icon: '🎬' },
]

const FEATURES = [
  { icon: Shield, title: 'Secure escrow payments', desc: 'Your money is protected until you approve the delivery' },
  { icon: Clock, title: '24-hour clearance', desc: 'Top sellers get paid faster than any other platform' },
  { icon: Percent, title: 'Only 15% commission', desc: 'Sellers keep 85% — the most generous in the industry' },
  { icon: Users, title: 'Real human support', desc: 'Every dispute reviewed by a real person, not a bot' },
]

const TESTIMONIALS = [
  { name: 'Michael O.', location: 'Business owner, Lagos', rating: 5, text: 'NOLANCE is unlike anything I have used before. The quality of sellers and speed of delivery blew my mind. This is the future of freelancing.', initials: 'MO', color: 'bg-navy-900' },
  { name: 'Amara N.', location: 'Graphic designer, Accra', rating: 5, text: 'I made $3,200 in my first month selling. The 85% payout and fast clearance make such a difference. I will never go back to other platforms.', initials: 'AN', color: 'bg-green-600' },
  { name: 'James K.', location: 'Startup founder, London', rating: 5, text: 'The Managed Services feature saved my entire project. I was stressed and NOLANCE handled everything for me. Absolutely brilliant platform.', initials: 'JK', color: 'bg-amber-700' },
]

const STATS = [
  { value: '2M+', label: 'Active freelancers' },
  { value: '500K+', label: 'Happy clients' },
  { value: '180+', label: 'Countries served' },
  { value: '4.9★', label: 'Average rating' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="bg-navy-900 py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-green-500 text-sm font-semibold uppercase tracking-widest mb-4">
            The world's greatest freelancing platform
          </p>
          <h1 className="text-5xl sm:text-6xl font-semibold text-white leading-tight mb-5">
            Find world-class talent.<br />
            <span className="text-green-400">Get results you love.</span>
          </h1>
          <p className="text-lg text-gray-400 mb-10 max-w-xl leading-relaxed">
            One account. Four powerful sections — Gigs, Scout, Marketplace, and Community. Built for the future of work.
          </p>

          {/* Search */}
          <div className="flex bg-white rounded-xl overflow-hidden max-w-xl shadow-lg mb-6">
            <input
              placeholder="Search for any service..."
              className="flex-1 px-5 py-4 text-sm text-navy-900 placeholder-gray-400 outline-none"
            />
            <button className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-4 text-sm transition-colors whitespace-nowrap">
              Search
            </button>
          </div>

          {/* Popular tags */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500">Popular:</span>
            {['Logo design', 'Web development', 'Video editing', 'AI services', 'SEO'].map(tag => (
              <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`}
                className="border border-gray-700 rounded-full px-4 py-1.5 text-xs text-gray-300 hover:border-green-500 hover:text-green-400 transition-colors">
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <div className="bg-navy-800 border-y border-navy-700 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-8 overflow-x-auto scrollbar-hide">
          <span className="text-xs text-gray-500 whitespace-nowrap">Trusted by teams at</span>
          {['Google', 'Microsoft', 'Shopify', 'Netflix', 'Spotify', 'Airbnb'].map(brand => (
            <span key={brand} className="text-sm font-medium text-gray-600 whitespace-nowrap">{brand}</span>
          ))}
        </div>
      </div>

      {/* ── CATEGORIES ───────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <p className="sec-label">Services</p>
          <h2 className="sec-title">Browse by category</h2>
          <p className="sec-sub mb-10">Over 700 categories. Every skill. One platform.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {CATEGORIES.map(cat => (
              <Link key={cat.slug} href={`/categories/${cat.slug}`}
                className="card-hover p-4 group">
                <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center text-lg mb-3 group-hover:bg-green-500 group-hover:text-white transition-colors">
                  {cat.icon}
                </div>
                <h3 className="text-sm font-medium text-navy-900 mb-1">{cat.name}</h3>
                <p className="text-xs text-gray-400">{cat.count} services</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRENDING ─────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <p className="sec-label mb-0">Trending now</p>
          </div>
          <h2 className="sec-title">Popular services this week</h2>
          <p className="sec-sub mb-10">Powered by NOLANCE Market AI — updated in real time</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TRENDING.map(item => (
              <Link key={item.label} href={`/search?q=${encodeURIComponent(item.label)}`}
                className="card-hover overflow-hidden">
                <div className={`h-32 flex items-center justify-center ${item.color} text-4xl`}>
                  {item.icon}
                </div>
                <div className="p-3">
                  <p className="text-xs text-green-600 font-medium mb-1">{item.trend}</p>
                  <h3 className="text-sm font-medium text-navy-900">{item.label}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="sec-label">How it works</p>
            <h2 className="sec-title">Get work done in 4 steps</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {HOW_STEPS.map((step, i) => (
              <div key={step.num} className="text-center px-4">
                <div className="w-12 h-12 rounded-full bg-green-500 text-white text-lg font-semibold flex items-center justify-center mx-auto mb-4">
                  {step.num}
                </div>
                <h3 className="text-base font-medium text-navy-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NOLANCE BRIEF ────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 bg-navy-900">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-green-500 text-xs font-semibold uppercase tracking-widest mb-3">NOLANCE Brief</p>
            <h2 className="text-3xl font-semibold text-white mb-4 leading-tight">
              Tell us what you need — we handle the rest
            </h2>
            <p className="text-gray-400 text-base leading-relaxed">
              Our AI reads your project brief and finds the perfect match instantly. No browsing. No guessing. Just results.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-7">
            <h3 className="text-white font-medium mb-5">Describe your project</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 font-medium block mb-1.5">What do you need help with?</label>
                <textarea className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-green-500 h-20 resize-none" placeholder="Describe your project..." />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-medium block mb-1.5">Category</label>
                <input className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-green-500" placeholder="e.g. Logo design, Web development..." />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-medium block mb-1.5">Your budget</label>
                <input className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-green-500" placeholder="e.g. $50 – $500" />
              </div>
              <Button fullWidth className="bg-green-500 hover:bg-green-600">
                Find my perfect match <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section className="py-14 px-4 sm:px-6 bg-green-500">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {FEATURES.map(feat => (
            <div key={feat.title} className="flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center">
                <feat.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-white">{feat.title}</h3>
              <p className="text-xs text-green-100 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <p className="sec-label">Reviews</p>
          <h2 className="sec-title">What people say about Nolance</h2>
          <p className="sec-sub mb-10">Real results from real people around the world</p>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="card p-6">
                <div className="text-amber-400 text-sm mb-3">{'★'.repeat(t.rating)}</div>
                <p className="text-sm text-gray-600 leading-relaxed mb-5 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${t.color} text-white flex items-center justify-center text-xs font-semibold`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-navy-900">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────── */}
      <section className="py-14 px-4 sm:px-6 bg-navy-800">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((s, i) => (
            <div key={s.label} className={cn('', i < 3 && 'md:border-r md:border-navy-700')}>
              <p className="text-4xl font-semibold text-green-400 mb-2">{s.value}</p>
              <p className="text-sm text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 bg-navy-900 text-center">
        <div className="max-w-2xl mx-auto">
          <Zap className="w-10 h-10 text-green-500 mx-auto mb-5" />
          <h2 className="text-4xl font-semibold text-white mb-4 leading-tight">
            Ready to join the world's greatest freelancing platform?
          </h2>
          <p className="text-gray-400 text-lg mb-10">
            Millions of sellers and buyers already chose Nolance
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-green-500 hover:bg-green-600">
                Start selling today
              </Button>
            </Link>
            <Link href="/explore">
              <button className="px-7 py-3.5 text-base text-white border border-white/20 rounded-lg hover:border-white/40 transition-colors">
                Find a freelancer
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}
