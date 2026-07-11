import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-3xl font-semibold text-navy-900 mb-2">{title}</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed">{children}</div>
      </div>
      <Footer />
    </div>
  )
}

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service">
      <h2 className="text-xl font-semibold text-navy-900 mt-8 mb-3">1. Acceptance of Terms</h2>
      <p>By creating an account or using Nolance, you agree to these Terms of Service. If you do not agree, please do not use the platform.</p>

      <h2 className="text-xl font-semibold text-navy-900 mt-8 mb-3">2. User Accounts</h2>
      <p>You must be at least 18 years old to use Nolance. You are responsible for maintaining the security of your account and for all activities under your account.</p>

      <h2 className="text-xl font-semibold text-navy-900 mt-8 mb-3">3. Commissions and Payments</h2>
      <p>Nolance charges commissions on completed transactions: 15% on Gigs and Scout, 5% on Marketplace, 10% on Scout-to-Business payments, and 25% on Managed Services. All payments are processed through our secure escrow system.</p>

      <h2 className="text-xl font-semibold text-navy-900 mt-8 mb-3">4. Fund Clearance</h2>
      <p>Fund clearance periods vary by seller level: New Sellers (10 days), Level 1 (7 days), Level 2 (3 days), Top Rated and Pro Verified (24 hours). NOLANCE Plus subscribers receive 5-day clearance.</p>

      <h2 className="text-xl font-semibold text-navy-900 mt-8 mb-3">5. Prohibited Activities</h2>
      <p>You may not use Nolance for off-platform payments, fraud, impersonation, spam, or any illegal activities. Violations may result in account suspension and fund holds.</p>

      <h2 className="text-xl font-semibold text-navy-900 mt-8 mb-3">6. Suspension Policy</h2>
      <p>Suspended accounts have funds held for 30 days (not 90 days like other platforms). Flagged accounts have a 2-week review period before the 30-day hold applies.</p>

      <h2 className="text-xl font-semibold text-navy-900 mt-8 mb-3">7. Dispute Resolution</h2>
      <p>Disputes are reviewed within 48 hours. Resolved disputes can be appealed within 7 days. Our team makes final decisions based on evidence provided by both parties.</p>

      <h2 className="text-xl font-semibold text-navy-900 mt-8 mb-3">8. Intellectual Property</h2>
      <p>Sellers retain ownership of their work until full payment is received. Buyers receive the agreed-upon rights upon order completion.</p>

      <h2 className="text-xl font-semibold text-navy-900 mt-8 mb-3">9. Limitation of Liability</h2>
      <p>Nolance is a marketplace platform. We are not responsible for the quality of services provided by third-party sellers unless using Managed Services.</p>

      <h2 className="text-xl font-semibold text-navy-900 mt-8 mb-3">10. Changes to Terms</h2>
      <p>We may update these terms at any time. Continued use of Nolance after changes constitutes acceptance of the new terms.</p>
    </LegalPage>
  )
}
