// ── ABOUT PAGE ────────────────────────────────────────────────
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ArrowRight, Users, Globe, Star, Shield } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="bg-navy-900 py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-semibold text-white mb-5 leading-tight">
            We built Nolance to fix<br /><span className="text-green-400">what was broken.</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            The existing platforms took too much, paid too slowly, and treated sellers like commodities. We decided to build something better.
          </p>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-semibold text-navy-900 mb-6">The story of Nolance</h2>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 leading-relaxed mb-4">
              Nolance was created by Joshua Eniola — an entrepreneur, developer, and freelancer who was tired of watching talented people lose 20-30% of their earnings to platforms that took months to release their money.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              The name NOLANCE comes from two roots: <strong>NOL</strong> from eNiOLa — a Yoruba name meaning "person of wealth and honour" — and <strong>ANCE</strong> from freelANCE. The meaning is intentional. This platform was built to bring wealth and honour to every freelancer who uses it.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              In the Yoruba language, Eniola means wealth and honour. In Hebrew, the name Joshua means deliverer. Nolance is built to deliver opportunity, fair pay, and genuine freedom to everyone who builds their living online.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We are not just building a platform. We are building the future of work — one where sellers keep 85% of every sale, top sellers get paid in 24 hours, and every person — regardless of where they are from — can access global opportunity.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto grid md:grid-cols-4 gap-6 text-center">
          {[
            { icon: Users, stat: '2M+', label: 'Active freelancers' },
            { icon: Globe, stat: '180+', label: 'Countries served' },
            { icon: Star, stat: '4.9★', label: 'Average rating' },
            { icon: Shield, stat: '100%', label: 'Escrow protected' },
          ].map(({ icon: Icon, stat, label }) => (
            <div key={label}>
              <Icon className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-navy-900">{stat}</p>
              <p className="text-sm text-gray-400 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 bg-navy-900 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-semibold text-white mb-4">Ready to join?</h2>
          <p className="text-gray-400 mb-8">Millions of buyers and sellers already chose Nolance.</p>
          <Link href="/auth/signup">
            <button className="bg-green-500 hover:bg-green-600 text-white font-medium px-8 py-4 rounded-xl text-base transition-colors">
              Create free account <ArrowRight className="w-4 h-4 inline ml-1" />
            </button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
