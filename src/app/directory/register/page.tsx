'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { ChevronLeft, Building, Plus, X } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function RegisterBusinessPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [serviceNeeds, setServiceNeeds] = useState<{title: string; description: string; budget_range: string}[]>([])
  const [form, setForm] = useState({
    name: '', category: '', description: '', website_url: '', phone: '',
    email: '', address: '', city: '', country: '', size: '', year_founded: '',
    plan: 'free',
    social_links: { instagram: '', linkedin: '', twitter: '', facebook: '' },
  })

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))
  const updateSocial = (k: string, v: string) => setForm(p => ({ ...p, social_links: { ...p.social_links, [k]: v } }))

  const addServiceNeed = () => setServiceNeeds([...serviceNeeds, { title: '', description: '', budget_range: '' }])
  const updateNeed = (i: number, k: string, v: string) => {
    const n = [...serviceNeeds]; n[i] = { ...n[i], [k]: v }; setServiceNeeds(n)
  }

  const handleSubmit = async () => {
    if (!form.name || !form.category) { toast.error('Business name and category are required'); return }
    setLoading(true)
    try {
      const res = await axios.post('/api/directory', { ...form, service_needs: serviceNeeds.filter(n => n.title) })
      toast.success('Business registered! Verification within 24 hours.')
      router.push(`/directory/${res.data.data.business.slug}`)
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to register business')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/directory" className="flex items-center gap-1 text-sm text-gray-400 hover:text-navy-900 mb-5 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Directory
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-navy-50 rounded-xl flex items-center justify-center">
              <Building className="w-5 h-5 text-navy-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-navy-900">List your business</h1>
              <p className="text-sm text-gray-400">Free listing · Verification within 24 hours</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Basic Info */}
            <div>
              <h3 className="font-medium text-navy-900 mb-3">Basic information</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="input-label">Business name <span className="text-red-400">*</span></label>
                    <input className="input" value={form.name} onChange={e => update('name', e.target.value)} placeholder="Your business name" />
                  </div>
                  <div>
                    <label className="input-label">Category <span className="text-red-400">*</span></label>
                    <input className="input" value={form.category} onChange={e => update('category', e.target.value)} placeholder="e.g. Marketing Agency" />
                  </div>
                </div>
                <div>
                  <label className="input-label">Description</label>
                  <textarea className="textarea h-24" value={form.description} onChange={e => update('description', e.target.value)}
                    placeholder="Describe your business, what you do, and who you serve..." />
                </div>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-medium text-navy-900 mb-3">Contact details</h3>
              <div className="space-y-3">
                <input className="input" value={form.website_url} onChange={e => update('website_url', e.target.value)} placeholder="Website URL" />
                <div className="grid grid-cols-2 gap-3">
                  <input className="input" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="Phone number" />
                  <input className="input" value={form.email} onChange={e => update('email', e.target.value)} placeholder="Business email" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <input className="input" value={form.city} onChange={e => update('city', e.target.value)} placeholder="City" />
                  <input className="input" value={form.country} onChange={e => update('country', e.target.value)} placeholder="Country" />
                  <input className="input" value={form.year_founded} onChange={e => update('year_founded', e.target.value)} placeholder="Year founded" type="number" />
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="font-medium text-navy-900 mb-3">Social links (optional)</h3>
              <div className="space-y-2">
                {['instagram', 'linkedin', 'twitter', 'facebook'].map(platform => (
                  <div key={platform} className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-20 capitalize">{platform}</span>
                    <input className="input flex-1" placeholder={`${platform}.com/yourpage`}
                      value={form.social_links[platform as keyof typeof form.social_links]}
                      onChange={e => updateSocial(platform, e.target.value)} />
                  </div>
                ))}
              </div>
            </div>

            {/* Service Needs */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-medium text-navy-900">Services you need (optional)</h3>
                  <p className="text-xs text-gray-400">Attract freelancers by listing what services you are looking for</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addServiceNeed} disabled={serviceNeeds.length >= 5}>
                  <Plus className="w-3.5 h-3.5" /> Add need
                </Button>
              </div>
              {serviceNeeds.map((need, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-4 mb-3">
                  <div className="flex justify-between mb-3">
                    <span className="text-xs text-gray-400">Service need {i + 1}</span>
                    <button onClick={() => setServiceNeeds(serviceNeeds.filter((_, idx) => idx !== i))} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                  </div>
                  <input className="input text-sm mb-2" placeholder="What service do you need?" value={need.title} onChange={e => updateNeed(i, 'title', e.target.value)} />
                  <textarea className="textarea text-sm mb-2 h-16" placeholder="Brief description of what you need..." value={need.description} onChange={e => updateNeed(i, 'description', e.target.value)} />
                  <input className="input text-sm" placeholder="Budget range (e.g. $500–$2000)" value={need.budget_range} onChange={e => updateNeed(i, 'budget_range', e.target.value)} />
                </div>
              ))}
            </div>

            {/* Plan */}
            <div>
              <h3 className="font-medium text-navy-900 mb-3">Listing plan</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'free', label: 'Free', desc: 'Basic listing', price: 'Free' },
                  { value: 'standard', label: 'Standard', desc: 'Priority placement', price: '$29/mo' },
                  { value: 'premium', label: 'Premium', desc: 'Top placement + featured', price: '$79/mo' },
                ].map(plan => (
                  <label key={plan.value} className={`border-2 rounded-xl p-3 text-center cursor-pointer transition-all ${form.plan === plan.value ? 'border-green-500 bg-green-50' : 'border-gray-100 hover:border-gray-200'}`}>
                    <input type="radio" value={plan.value} checked={form.plan === plan.value} onChange={() => update('plan', plan.value)} className="sr-only" />
                    <p className="text-sm font-semibold text-navy-900">{plan.label}</p>
                    <p className="text-xs text-gray-400">{plan.desc}</p>
                    <p className={`text-sm font-bold mt-1 ${plan.value === 'free' ? 'text-green-600' : 'text-navy-900'}`}>{plan.price}</p>
                  </label>
                ))}
              </div>
            </div>

            <Button fullWidth loading={loading} onClick={handleSubmit} size="lg">Register business</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
