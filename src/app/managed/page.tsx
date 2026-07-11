'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/auth.store'
import { Shield, Zap, Star, Clock, ChevronRight, CheckCircle, ArrowRight, Plus, X } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function ManagedServicesPage() {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', budget_min: '', budget_max: '',
    deadline: '', trust_reason: '', category_id: '',
  })

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async () => {
    if (!form.title || !form.description) { toast.error('Title and description are required'); return }
    if (form.description.length < 50) { toast.error('Please describe your project in more detail'); return }
    setLoading(true)
    try {
      const res = await axios.post('/api/managed', {
        ...form,
        budget_min: form.budget_min ? Number(form.budget_min) : null,
        budget_max: form.budget_max ? Number(form.budget_max) : null,
        deadline: form.deadline || null,
      })
      toast.success('Request submitted! Our team will respond within 4 hours.')
      router.push('/dashboard')
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to submit request')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <section className="bg-navy-900 py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Shield className="w-7 h-7 text-green-400" />
          </div>
          <p className="text-green-400 text-sm font-semibold uppercase tracking-widest mb-3">NOLANCE MANAGED SERVICES</p>
          <h1 className="text-5xl font-semibold text-white mb-5 leading-tight">
            Hand it off completely.<br /><span className="text-green-400">We guarantee the result.</span>
          </h1>
          <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            Tell us what you need. Our AI matches you with the perfect seller, manages the project from start to finish, and guarantees delivery. Only 25% commission — all included.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            {isAuthenticated ? (
              <Button size="lg" className="bg-green-500 hover:bg-green-600" onClick={() => setShowForm(true)}>
                Submit a project request <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Link href="/auth/signup"><Button size="lg" className="bg-green-500 hover:bg-green-600">Get started free</Button></Link>
            )}
            <button className="px-7 py-3.5 text-white border border-white/20 rounded-lg hover:border-white/40 transition-colors text-base">
              How it works
            </button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="sec-label">Process</p>
            <h2 className="sec-title">How Managed Services works</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Submit a brief', desc: 'Tell us about your project — what you need, your budget, and deadline.' },
              { step: '2', title: 'AI matches you', desc: 'Our AI reviews your brief and selects the best seller from our verified pool.' },
              { step: '3', title: 'We manage it', desc: 'Nolance oversees the entire project — milestones, quality checks, revisions.' },
              { step: '4', title: 'You approve', desc: 'Review the final delivery. We do not release payment until you are satisfied.' },
            ].map(item => (
              <div key={item.step} className="text-center">
                <div className="w-10 h-10 rounded-full bg-green-500 text-white text-sm font-semibold flex items-center justify-center mx-auto mb-3">{item.step}</div>
                <h3 className="text-sm font-semibold text-navy-900 mb-2">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="sec-label">Why choose Managed</p>
            <h2 className="sec-title">Everything handled for you</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { icon: Zap, title: 'AI-powered seller matching', desc: 'We analyse your brief and match you with a seller who has proven results in your exact category.' },
              { icon: Shield, title: 'Full project responsibility', desc: 'We own the outcome. If the delivery does not meet requirements, we fix it at no extra charge.' },
              { icon: Star, title: 'Verified top sellers only', desc: 'Managed projects are assigned only to Level 2, Top Rated, or Pro Verified sellers.' },
              { icon: Clock, title: 'Response within 4 hours', desc: 'Our team reviews every brief and responds with a matched seller within 4 business hours.' },
              { icon: CheckCircle, title: 'Quality reviewed delivery', desc: 'Every delivery is reviewed by our quality team before it reaches you.' },
              { icon: Shield, title: 'Money-back guarantee', desc: 'If we cannot deliver what we promised, you get a full refund. No questions asked.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 bg-white rounded-xl border border-gray-100 p-5">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-navy-900 mb-1">{title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-4 sm:px-6 bg-navy-900">
        <div className="max-w-2xl mx-auto text-center">
          <p className="sec-label text-green-400">Pricing</p>
          <h2 className="text-3xl font-semibold text-white mb-4">Simple, transparent pricing</h2>
          <p className="text-gray-400 mb-8">25% commission — covers AI matching, project management, quality review, and our guarantee. Minimum project value $50.</p>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-left">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white font-medium">Your project cost</span>
              <span className="text-white font-medium">$500</span>
            </div>
            <div className="flex items-center justify-between mb-4 text-gray-400">
              <span>Nolance Managed fee (25%)</span>
              <span>$125</span>
            </div>
            <div className="flex items-center justify-between mb-4 text-gray-400">
              <span>Seller receives (75%)</span>
              <span>$375</span>
            </div>
            <div className="border-t border-white/10 pt-4 flex items-center justify-between">
              <span className="text-white font-semibold">You pay total</span>
              <span className="text-green-400 text-xl font-bold">$500</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">All prices in USD. Escrow protected. Money released only on your approval.</p>
          <Button size="lg" className="mt-8 bg-green-500 hover:bg-green-600" onClick={() => isAuthenticated ? setShowForm(true) : router.push('/auth/signup')}>
            Submit your project brief
          </Button>
        </div>
      </section>

      {/* Request Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-modal relative">
            <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold text-navy-900 mb-1">Submit your project brief</h2>
            <p className="text-sm text-gray-400 mb-5">Our team will respond within 4 hours with the perfect seller match</p>

            <div className="space-y-4">
              <div>
                <label className="input-label">Project title <span className="text-red-400">*</span></label>
                <input className="input" placeholder="e.g. Build a complete e-commerce website for my fashion brand"
                  value={form.title} onChange={e => update('title', e.target.value)} />
              </div>
              <div>
                <label className="input-label">Project description <span className="text-red-400">*</span></label>
                <textarea className="textarea h-28"
                  placeholder="Describe exactly what you need. The more detail you provide, the better we can match you with the right seller..."
                  value={form.description} onChange={e => update('description', e.target.value)} />
                <p className="input-hint">{form.description.length} chars (minimum 50)</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Min budget ($)</label>
                  <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input type="number" min={50} className="input pl-7" placeholder="50"
                      value={form.budget_min} onChange={e => update('budget_min', e.target.value)} /></div>
                </div>
                <div>
                  <label className="input-label">Max budget ($)</label>
                  <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input type="number" className="input pl-7" placeholder="500"
                      value={form.budget_max} onChange={e => update('budget_max', e.target.value)} /></div>
                </div>
              </div>
              <div>
                <label className="input-label">Deadline (optional)</label>
                <input type="date" className="input" value={form.deadline} onChange={e => update('deadline', e.target.value)}
                  min={new Date().toISOString().split('T')[0]} />
              </div>
              <div>
                <label className="input-label">Why do you want Managed Services? (optional)</label>
                <textarea className="textarea h-16"
                  placeholder="e.g. I've been burned by unreliable freelancers before and need guaranteed results..."
                  value={form.trust_reason} onChange={e => update('trust_reason', e.target.value)} />
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                <p className="text-xs text-green-700 flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  Our team will review your brief and assign the best verified seller. You will be notified by email within 4 hours.
                </p>
              </div>
              <Button fullWidth loading={loading} onClick={handleSubmit}>
                Submit project brief
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
