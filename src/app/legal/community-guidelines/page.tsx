import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CheckCircle, XCircle } from 'lucide-react'

export default function CommunityGuidelinesPage() {
  const ALLOWED = [
    'Share genuine service offerings via gig links (max 3 per community per week)',
    'Ask for feedback on your work and services',
    'Share industry tips, tutorials, and insights',
    'Help other community members with questions',
    'Post Scout-style job needs within community job boards',
    'Celebrate wins and milestones professionally',
    'Engage in constructive discussions about your field',
  ]

  const NOT_ALLOWED = [
    'Spam or repeated identical posts across communities',
    'Sharing external links (only Nolance gig links permitted)',
    'Soliciting off-platform payments or contact',
    'Impersonating other users or businesses',
    'Posting false, misleading, or fraudulent content',
    'Harassment, hate speech, or discriminatory content',
    'Self-promotion beyond the 3-gig-link weekly limit',
    'Sharing confidential client information',
  ]

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-3xl font-semibold text-navy-900 mb-2">Community Guidelines</h1>
        <p className="text-sm text-gray-400 mb-8">These guidelines apply to all NOLANCE Community spaces including posts, comments, and job boards.</p>

        <div className="bg-navy-50 border border-navy-100 rounded-2xl p-5 mb-8">
          <p className="text-sm text-navy-700 leading-relaxed">
            NOLANCE Communities exist to help sellers and buyers connect, share knowledge, and grow together. These guidelines exist to keep communities valuable, respectful, and focused on professional growth.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 mb-8">
          <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
            <h2 className="text-base font-semibold text-green-800 mb-4 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> What is allowed</h2>
            <ul className="space-y-2">
              {ALLOWED.map(item => (
                <li key={item} className="flex items-start gap-2 text-sm text-green-700">
                  <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
            <h2 className="text-base font-semibold text-red-800 mb-4 flex items-center gap-2"><XCircle className="w-4 h-4" /> What is not allowed</h2>
            <ul className="space-y-2">
              {NOT_ALLOWED.map(item => (
                <li key={item} className="flex items-start gap-2 text-sm text-red-700">
                  <span className="text-red-400 mt-0.5 flex-shrink-0">✗</span> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-6 text-gray-600">
          <section>
            <h2 className="text-xl font-semibold text-navy-900 mb-3">Gig link policy</h2>
            <p>You may share your Nolance gig link in community posts, but are limited to 3 gig shares per community per week. This policy exists to prevent spam and ensure communities remain valuable for discussion rather than becoming advertisement boards. Only nolance.com gig links are permitted — no external URLs.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-navy-900 mb-3">Enforcement</h2>
            <p>Violations result in post removal. Repeated violations lead to account strikes. Three strikes result in removal from all NOLANCE Communities. Severe violations (fraud, harassment) result in immediate account suspension.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-navy-900 mb-3">Reporting</h2>
            <p>Report any post or user that violates these guidelines using the flag button on posts. Our moderation team reviews all reports within 24 hours.</p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  )
}
