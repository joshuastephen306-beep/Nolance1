// ── BLOG PAGE ─────────────────────────────────────────────────
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Calendar, Clock, ArrowRight } from 'lucide-react'

const POSTS = [
  { title: 'How to earn $5,000/month on NOLANCE as a graphic designer', category: 'Seller Tips', date: 'Jul 5, 2026', readTime: '8 min', slug: 'earn-5000-graphic-designer' },
  { title: 'NOLANCE vs Fiverr vs Upwork: A complete 2026 comparison', category: 'Platform News', date: 'Jul 1, 2026', readTime: '12 min', slug: 'nolance-vs-fiverr-upwork-2026' },
  { title: 'The complete guide to Scout: How to win high-value projects', category: 'Scout', date: 'Jun 28, 2026', readTime: '10 min', slug: 'scout-guide-win-projects' },
  { title: 'Why Nigerian freelancers are choosing NOLANCE over Fiverr', category: 'Community', date: 'Jun 25, 2026', readTime: '6 min', slug: 'nigerian-freelancers-nolance' },
  { title: 'How NOLANCE Market AI predicts what clients want next week', category: 'Technology', date: 'Jun 20, 2026', readTime: '7 min', slug: 'market-ai-predictions' },
  { title: 'The 14-tag strategy: How to get your gig to page 1', category: 'Seller Tips', date: 'Jun 15, 2026', readTime: '5 min', slug: '14-tag-gig-strategy' },
  { title: 'Selling social media accounts on the NOLANCE Marketplace', category: 'Marketplace', date: 'Jun 10, 2026', readTime: '9 min', slug: 'selling-social-media-accounts' },
  { title: 'NOLANCE Communities: The feature top sellers use to find clients', category: 'Community', date: 'Jun 5, 2026', readTime: '7 min', slug: 'communities-find-clients' },
]

const CATEGORY_COLORS: Record<string, string> = {
  'Seller Tips': 'badge-green', 'Platform News': 'badge-blue', 'Scout': 'badge-purple',
  'Community': 'badge-amber', 'Technology': 'badge-navy', 'Marketplace': 'badge-blue',
}

export default function BlogPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="bg-navy-900 py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-green-400 text-sm font-semibold uppercase tracking-widest mb-3">NOLANCE BLOG</p>
          <h1 className="text-4xl font-semibold text-white mb-3">Tips, stories, and platform news</h1>
          <p className="text-gray-400">For freelancers who take their career seriously</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {/* Featured */}
        <div className="mb-10">
          <div className="bg-gradient-to-br from-navy-900 to-navy-800 rounded-2xl p-8 text-white mb-5">
            <span className="badge badge-green text-xs mb-3 inline-block">Featured</span>
            <h2 className="text-2xl font-semibold mb-3 leading-tight">{POSTS[0].title}</h2>
            <p className="text-gray-400 text-sm mb-5">Discover exactly how top sellers on NOLANCE consistently earn $5,000 and more every month — with step-by-step strategies you can implement today.</p>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/>{POSTS[0].date}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3"/>{POSTS[0].readTime} read</span>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {POSTS.slice(1).map(post => (
            <div key={post.slug} className="bg-white border border-gray-100 rounded-xl p-5 hover:border-green-300 hover:shadow-card transition-all cursor-pointer">
              <span className={`badge text-xs mb-3 inline-block ${CATEGORY_COLORS[post.category] || 'badge-gray'}`}>{post.category}</span>
              <h3 className="text-sm font-semibold text-navy-900 mb-3 leading-snug line-clamp-3">{post.title}</h3>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/>{post.date}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3"/>{post.readTime}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}
