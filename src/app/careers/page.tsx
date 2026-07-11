import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { MapPin, Briefcase, ArrowRight } from 'lucide-react'

const ROLES = [
  { title: 'Senior Full-Stack Engineer', team: 'Engineering', location: 'Remote', type: 'Full-time' },
  { title: 'Product Manager — Marketplace', team: 'Product', location: 'Remote', type: 'Full-time' },
  { title: 'Senior UI/UX Designer', team: 'Design', location: 'Remote', type: 'Full-time' },
  { title: 'Trust & Safety Specialist', team: 'Operations', location: 'Lagos or Remote', type: 'Full-time' },
  { title: 'Community Growth Manager', team: 'Marketing', location: 'Remote', type: 'Full-time' },
  { title: 'Customer Success Manager (Africa)', team: 'Support', location: 'Lagos', type: 'Full-time' },
]

const VALUES = [
  { emoji: '🏆', title: 'Excellence above all', desc: 'We build things that last. Every line of code, every word of copy, every decision matters.' },
  { emoji: '🌍', title: 'Global by default', desc: 'We are building for everyone, everywhere. Diversity of thought is our competitive advantage.' },
  { emoji: '⚡', title: 'Move fast, fix things', desc: 'We ship, learn, and improve. Speed without quality means nothing. Quality without speed means nothing.' },
  { emoji: '🤝', title: 'Seller-first always', desc: 'We exist to serve our sellers. Every product decision starts with: does this help our sellers earn more?' },
]

export default function CareersPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="bg-navy-900 py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-green-400 text-sm font-semibold uppercase tracking-widest mb-3">CAREERS AT NOLANCE</p>
          <h1 className="text-5xl font-semibold text-white mb-5 leading-tight">
            Build the future<br />of work with us
          </h1>
          <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            We are a small, high-output team building a platform that changes how millions of people earn a living. Join us.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-semibold text-navy-900 mb-3">What we believe</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {VALUES.map(v => (
              <div key={v.title} className="border border-gray-100 rounded-2xl p-6">
                <p className="text-3xl mb-3">{v.emoji}</p>
                <h3 className="font-semibold text-navy-900 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Roles */}
      <section className="py-16 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-semibold text-navy-900 mb-3">Open roles</h2>
            <p className="text-gray-500">All roles are fully remote unless stated</p>
          </div>
          <div className="space-y-3">
            {ROLES.map(role => (
              <div key={role.title} className="bg-white border border-gray-100 rounded-xl p-5 hover:border-green-300 transition-all cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-navy-900 mb-1">{role.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Briefcase className="w-3 h-3"/>{role.team}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/>{role.location}</span>
                      <span className="badge badge-green text-xs">{role.type}</span>
                    </div>
                  </div>
                  <button className="text-green-600 text-sm font-medium flex items-center gap-1 flex-shrink-0 hover:gap-2 transition-all">
                    Apply <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-navy-900 rounded-2xl p-6 text-center">
            <p className="text-white font-medium mb-2">Do not see your role?</p>
            <p className="text-gray-400 text-sm mb-4">We are always looking for exceptional people. Send us your CV and tell us how you can help.</p>
            <a href="mailto:careers@nolance.com">
              <Button className="bg-green-500 hover:bg-green-600">Send an open application</Button>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
