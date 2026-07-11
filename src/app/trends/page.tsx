'use client'
import { useState, useEffect } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Zap, TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'

export default function TrendsPage() {
  const [trends, setTrends] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock trends data — in production fetched from market_trends table
    setTrends([
      { keyword: 'Logo Design', demand_score: 94, trend_direction: 'rising', change: '+23%', category: 'Graphics & Design' },
      { keyword: 'AI Automation', demand_score: 91, trend_direction: 'rising', change: '+41%', category: 'AI Services' },
      { keyword: 'Web Development', demand_score: 88, trend_direction: 'rising', change: '+18%', category: 'Programming & Tech' },
      { keyword: 'Video Editing', demand_score: 85, trend_direction: 'rising', change: '+12%', category: 'Video & Animation' },
      { keyword: 'Social Media Management', demand_score: 82, trend_direction: 'stable', change: '+3%', category: 'Digital Marketing' },
      { keyword: 'SEO', demand_score: 78, trend_direction: 'stable', change: '+1%', category: 'Digital Marketing' },
      { keyword: 'Content Writing', demand_score: 75, trend_direction: 'stable', change: '0%', category: 'Writing & Translation' },
      { keyword: 'WordPress Development', demand_score: 70, trend_direction: 'declining', change: '-5%', category: 'Programming & Tech' },
      { keyword: 'Voiceover', demand_score: 65, trend_direction: 'rising', change: '+8%', category: 'Music & Audio' },
      { keyword: 'Translation', demand_score: 60, trend_direction: 'stable', change: '+2%', category: 'Writing & Translation' },
      { keyword: 'Illustration', demand_score: 72, trend_direction: 'rising', change: '+15%', category: 'Graphics & Design' },
      { keyword: 'React Development', demand_score: 86, trend_direction: 'rising', change: '+22%', category: 'Programming & Tech' },
    ])
    setLoading(false)
  }, [])

  const TREND_ICON = { rising: TrendingUp, stable: Minus, declining: TrendingDown }
  const TREND_COLOR = { rising: 'text-green-600', stable: 'text-gray-400', declining: 'text-red-500' }
  const TREND_BG = { rising: 'bg-green-50', stable: 'bg-gray-50', declining: 'bg-red-50' }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="bg-navy-900 py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-green-400" />
            <p className="text-green-400 text-sm font-semibold uppercase tracking-widest">NOLANCE MARKET AI</p>
          </div>
          <h1 className="text-4xl font-semibold text-white mb-4">Service trends this week</h1>
          <p className="text-gray-400 text-base max-w-xl mx-auto">
            Real-time demand data powered by NOLANCE Market AI. Updated every 24 hours to help sellers find the most in-demand services.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-navy-900">Top trending services</h2>
            <p className="text-xs text-gray-400">Updated {new Date().toLocaleDateString()}</p>
          </div>
          <div className="divide-y divide-gray-100">
            {trends.map((trend, i) => {
              const Icon = TREND_ICON[trend.trend_direction as keyof typeof TREND_ICON] || Minus
              const color = TREND_COLOR[trend.trend_direction as keyof typeof TREND_COLOR]
              const bg = TREND_BG[trend.trend_direction as keyof typeof TREND_BG]
              return (
                <div key={trend.keyword} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                  <span className="text-lg font-bold text-gray-200 w-6 text-right flex-shrink-0">{i + 1}</span>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${bg}`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-navy-900">{trend.keyword}</p>
                    <p className="text-xs text-gray-400">{trend.category}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-bold ${color}`}>{trend.change}</p>
                    <p className="text-xs text-gray-400 capitalize">{trend.trend_direction}</p>
                  </div>
                  <div className="w-24 bg-gray-100 rounded-full h-1.5 flex-shrink-0">
                    <div className="bg-green-500 h-1.5 rounded-full transition-all" style={{ width: `${trend.demand_score}%` }} />
                  </div>
                  <Link href={`/search?q=${encodeURIComponent(trend.keyword)}`}
                    className="text-xs text-green-600 hover:underline flex-shrink-0">
                    Browse <ArrowRight className="w-3 h-3 inline" />
                  </Link>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-6 bg-navy-900 rounded-2xl p-6 text-center">
          <Zap className="w-8 h-8 text-green-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">Get personalised alerts</h3>
          <p className="text-sm text-gray-400 mb-4">NOLANCE Market AI can notify you when demand rises in your category</p>
          <Link href="/dashboard">
            <button className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors">
              Enable alerts in dashboard
            </button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}
