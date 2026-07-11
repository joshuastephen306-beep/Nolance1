import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-3xl font-semibold text-navy-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-navy-900 mb-3">What we collect</h2>
            <p>We collect information you provide directly: name, email, username, phone number, payment details, and profile information. We also collect usage data such as pages visited, features used, and device information.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-navy-900 mb-3">How we use your data</h2>
            <p>We use your data to provide and improve the Nolance platform, process payments, send transactional emails and security alerts, prevent fraud, and comply with legal obligations. We do not sell your personal data to third parties.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-navy-900 mb-3">Data sharing</h2>
            <p>We share data with payment processors (Paystack, Stripe), email providers (Resend), SMS providers (Twilio), file storage (Cloudinary), and hosting providers. All partners are bound by data processing agreements.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-navy-900 mb-3">Security</h2>
            <p>We use industry-standard encryption for data at rest and in transit. Passwords are hashed. Sensitive financial data is handled by certified payment processors. We notify you of any security events via email.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-navy-900 mb-3">Your rights</h2>
            <p>You have the right to access, correct, or delete your personal data. To exercise these rights, contact us at privacy@nolance.com. We respond to all requests within 30 days.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-navy-900 mb-3">Cookies</h2>
            <p>We use essential cookies for authentication and functional cookies for preferences. We do not use advertising cookies. You can manage cookie preferences in your browser settings.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-navy-900 mb-3">Contact</h2>
            <p>For privacy questions, contact us at <a href="mailto:privacy@nolance.com" className="text-green-600 hover:underline">privacy@nolance.com</a></p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  )
}
