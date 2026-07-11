import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default function CookiesPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-3xl font-semibold text-navy-900 mb-2">Cookie Policy</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-navy-900 mb-3">What are cookies?</h2>
            <p>Cookies are small text files that are placed on your device when you visit a website. They help the website function correctly and provide a better experience. Cookies cannot run programs or deliver viruses to your computer.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900 mb-3">Cookies we use</h2>
            <div className="space-y-4">
              {[
                {
                  type: 'Essential cookies', required: true,
                  desc: 'These cookies are necessary for the website to function and cannot be switched off. They are set in response to actions you take such as logging in, setting your privacy preferences, or filling in forms.',
                  examples: ['nolance-token (authentication)', 'session-id (session management)', 'csrf-token (security)'],
                },
                {
                  type: 'Functional cookies', required: false,
                  desc: 'These cookies enable the website to provide enhanced functionality and personalisation. They remember your preferences and settings.',
                  examples: ['language preference', 'currency preference', 'theme preference'],
                },
                {
                  type: 'Analytics cookies', required: false,
                  desc: 'These cookies help us understand how visitors interact with our website. All information collected is aggregated and anonymous.',
                  examples: ['page views', 'session duration', 'feature usage'],
                },
              ].map(cat => (
                <div key={cat.type} className="border border-gray-100 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-navy-900">{cat.type}</h3>
                    <span className={`badge text-xs ${cat.required ? 'badge-red' : 'badge-gray'}`}>
                      {cat.required ? 'Required' : 'Optional'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{cat.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {cat.examples.map(ex => (
                      <span key={ex} className="bg-gray-50 border border-gray-200 text-gray-600 text-xs px-2 py-1 rounded-lg">{ex}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900 mb-3">Cookies we do NOT use</h2>
            <ul className="space-y-1 text-sm">
              <li>• Advertising or targeting cookies</li>
              <li>• Third-party tracking cookies</li>
              <li>• Social media tracking pixels</li>
              <li>• Cross-site tracking cookies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900 mb-3">Managing cookies</h2>
            <p>You can control cookies through your browser settings. Most browsers allow you to refuse cookies or delete existing cookies. Note that disabling essential cookies will prevent you from signing in to Nolance.</p>
            <p className="mt-3">For more information on managing cookies, visit your browser's help documentation.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy-900 mb-3">Contact</h2>
            <p>For questions about our cookie policy, contact us at <a href="mailto:privacy@nolance.com" className="text-green-600 hover:underline">privacy@nolance.com</a></p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  )
}
