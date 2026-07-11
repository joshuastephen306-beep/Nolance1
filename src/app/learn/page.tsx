import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { BookOpen, Play, Award, ChevronRight, Clock, Star } from 'lucide-react'

const COURSES = [
  {
    category: 'Getting Started',
    color: 'bg-green-50 text-green-700',
    items: [
      { title: 'How to create a winning gig', duration: '12 min', level: 'Beginner', rating: 4.9 },
      { title: 'Writing a gig title that converts', duration: '8 min', level: 'Beginner', rating: 4.8 },
      { title: 'Gig pricing strategy for new sellers', duration: '15 min', level: 'Beginner', rating: 4.9 },
      { title: 'Your first 5 orders — what to do', duration: '20 min', level: 'Beginner', rating: 4.7 },
    ],
  },
  {
    category: 'Growing Your Business',
    color: 'bg-blue-50 text-blue-700',
    items: [
      { title: 'Mastering NOLANCE Scout proposals', duration: '18 min', level: 'Intermediate', rating: 4.8 },
      { title: 'How to rank #1 in search results', duration: '22 min', level: 'Intermediate', rating: 4.9 },
      { title: 'Using NOLANCE Communities to find clients', duration: '14 min', level: 'Intermediate', rating: 4.7 },
      { title: 'Upselling with gig extras', duration: '10 min', level: 'Intermediate', rating: 4.8 },
    ],
  },
  {
    category: 'Advanced Strategies',
    color: 'bg-purple-50 text-purple-700',
    items: [
      { title: 'Reaching Top Rated seller status', duration: '30 min', level: 'Advanced', rating: 4.9 },
      { title: 'Managing multiple orders without burnout', duration: '25 min', level: 'Advanced', rating: 4.8 },
      { title: 'Becoming a NOLANCE Managed Partner', duration: '20 min', level: 'Advanced', rating: 4.9 },
      { title: 'Using Scout-to-Business for big clients', duration: '28 min', level: 'Advanced', rating: 4.7 },
    ],
  },
  {
    category: 'Finance & Payments',
    color: 'bg-amber-50 text-amber-700',
    items: [
      { title: 'Understanding fund clearance', duration: '8 min', level: 'Beginner', rating: 4.9 },
      { title: 'Withdrawal methods explained', duration: '12 min', level: 'Beginner', rating: 4.8 },
      { title: 'Managing your NOLANCE income as a business', duration: '22 min', level: 'Intermediate', rating: 4.7 },
      { title: 'Tax tips for Nigerian freelancers', duration: '18 min', level: 'Intermediate', rating: 4.8 },
    ],
  },
]

const STATS = [
  { value: '200+', label: 'Free lessons' },
  { value: '50K+', label: 'Sellers trained' },
  { value: '4.9★', label: 'Average rating' },
  { value: '100%', label: 'Free forever' },
]

export default function LearnPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="bg-navy-900 py-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <BookOpen className="w-7 h-7 text-green-400" />
          </div>
          <p className="text-green-400 text-sm font-semibold uppercase tracking-widest mb-3">NOLANCE LEARN</p>
          <h1 className="text-4xl font-semibold text-white mb-4 leading-tight">
            Everything you need to succeed<br />on Nolance — for free
          </h1>
          <p className="text-gray-400 text-base mb-8 max-w-xl mx-auto">
            Bite-sized lessons, practical strategies, and real examples from top sellers. Learn at your own pace and start earning more today.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-green-500 hover:bg-green-600">
              <Play className="w-4 h-4" /> Start learning free
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="bg-green-500 py-6 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {STATS.map(s => (
            <div key={s.label}>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-sm text-green-100">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Courses */}
      <section className="py-16 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          {COURSES.map(section => (
            <div key={section.category} className="mb-10">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <span className={`badge text-sm font-medium px-3 py-1 ${section.color}`}>{section.category}</span>
                </div>
                <button className="text-sm text-green-600 hover:underline flex items-center gap-1">
                  View all <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                {section.items.map(course => (
                  <div key={course.title}
                    className="bg-white border border-gray-100 rounded-xl p-4 hover:border-green-300 hover:shadow-card transition-all cursor-pointer">
                    <div className="w-10 h-10 bg-navy-900 rounded-lg flex items-center justify-center mb-3">
                      <Play className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-sm font-semibold text-navy-900 mb-2 leading-snug">{course.title}</h3>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {course.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400" /> {course.rating}
                      </div>
                    </div>
                    <span className={`badge text-xs mt-2 inline-block ${
                      course.level === 'Beginner' ? 'badge-green' :
                      course.level === 'Intermediate' ? 'badge-blue' : 'badge-purple'
                    }`}>{course.level}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Certification */}
      <section className="py-16 px-4 sm:px-6 bg-navy-900 text-center">
        <div className="max-w-2xl mx-auto">
          <Award className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-3xl font-semibold text-white mb-4">Earn a NOLANCE certificate</h2>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Complete a learning path and earn a shareable certificate that you can add to your NOLANCE profile and LinkedIn. Show buyers you are committed to professional excellence.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="bg-green-500 hover:bg-green-600">Start your certificate</Button>
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  )
}
