'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { ChevronLeft, Plus, X, Save } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function EditGigPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const [gig, setGig] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', category_id: '' })
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [packages, setPackages] = useState<any>({})
  const [faqs, setFaqs] = useState<any[]>([])

  useEffect(() => { fetchGig() }, [slug])

  const fetchGig = async () => {
    try {
      const res = await axios.get(`/api/gigs/${slug}`)
      const g = res.data.data
      setGig(g)
      setForm({ title: g.title, description: g.description, category_id: g.category_id })
      setTags(g.tags?.map((t: any) => t.tag) || [])
      const pkgMap: any = {}
      g.packages?.forEach((p: any) => { pkgMap[p.package_type] = p })
      setPackages(pkgMap)
      setFaqs(g.faqs || [])
    } catch { router.push('/dashboard/gigs') }
    setLoading(false)
  }

  const addTag = () => {
    const t = tagInput.trim().toLowerCase()
    if (!t || tags.includes(t) || tags.length >= 14) return
    if (t.length > 20) { toast.error('Tag max 20 characters'); return }
    if (t.split(' ').length > 3) { toast.error('Tag max 3 words'); return }
    setTags([...tags, t])
    setTagInput('')
  }

  const updatePkg = (tier: string, field: string, value: any) => {
    setPackages((p: any) => ({ ...p, [tier]: { ...p[tier], [field]: value } }))
  }

  const handleSave = async () => {
    if (!form.title || form.title.length < 10) { toast.error('Title must be at least 10 characters'); return }
    if (!form.description || form.description.length < 120) { toast.error('Description must be at least 120 characters'); return }
    setSaving(true)
    try {
      await axios.put(`/api/gigs/${slug}`, { ...form, tags, packages, faqs })
      toast.success('Gig updated! It will be reviewed within 24 hours.')
      router.push('/dashboard/gigs')
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to save gig')
    }
    setSaving(false)
  }

  if (loading) return <div className="min-h-screen bg-gray-50"><Navbar /><div className="max-w-3xl mx-auto px-4 py-8 animate-pulse"><div className="h-96 bg-gray-200 rounded-2xl"/></div></div>
  if (!gig) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link href="/dashboard/gigs" className="flex items-center gap-1 text-sm text-gray-400 hover:text-navy-900 transition-colors">
            <ChevronLeft className="w-4 h-4" /> My Gigs
          </Link>
          <Button loading={saving} onClick={handleSave}>
            <Save className="w-4 h-4" /> Save changes
          </Button>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
          <p className="text-sm text-amber-700">Saving changes will re-submit your gig for review. It may take up to 24 hours to go live again.</p>
        </div>

        <div className="space-y-5">
          {/* Title */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-semibold text-navy-900 mb-4">Gig overview</h3>
            <div className="space-y-4">
              <div>
                <label className="input-label">Title</label>
                <input className="input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} maxLength={80} />
                <p className="input-hint">{form.title.length}/80</p>
              </div>
              <div>
                <label className="input-label">Tags ({tags.length}/14)</label>
                <div className="flex gap-2 mb-2">
                  <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add a tag..." className="input flex-1" />
                  <Button type="button" variant="outline" size="sm" onClick={addTag}>Add</Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map(t => (
                      <span key={t} className="flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 px-3 py-1 rounded-full text-sm">
                        {t}<button onClick={() => setTags(tags.filter(x => x !== t))} className="ml-1 hover:text-red-500"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-semibold text-navy-900 mb-4">Description</h3>
            <textarea className="textarea h-40" value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            <p className="input-hint">{form.description.length} chars (minimum 120)</p>
          </div>

          {/* Packages */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-semibold text-navy-900 mb-4">Packages</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {['basic', 'standard', 'premium'].map(tier => packages[tier] && (
                <div key={tier} className="border border-gray-100 rounded-xl p-4">
                  <p className="text-xs font-semibold uppercase text-gray-400 mb-3">{tier}</p>
                  <div className="space-y-2">
                    <input className="input text-sm" placeholder="Package name" value={packages[tier]?.name || ''}
                      onChange={e => updatePkg(tier, 'name', e.target.value)} />
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                      <input type="number" min={5} className="input pl-7 text-sm" value={packages[tier]?.price || ''}
                        onChange={e => updatePkg(tier, 'price', Number(e.target.value))} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-400">Days</label>
                        <input type="number" min={1} className="input text-sm mt-1" value={packages[tier]?.delivery_days || ''}
                          onChange={e => updatePkg(tier, 'delivery_days', Number(e.target.value))} />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">Revisions</label>
                        <input type="number" min={0} className="input text-sm mt-1" value={packages[tier]?.revisions || ''}
                          onChange={e => updatePkg(tier, 'revisions', Number(e.target.value))} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQs */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-navy-900">FAQs</h3>
              <Button type="button" variant="outline" size="sm" onClick={() => setFaqs([...faqs, { question: '', answer: '' }])}>
                <Plus className="w-4 h-4" /> Add FAQ
              </Button>
            </div>
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-4 mb-3">
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-gray-400">FAQ {i + 1}</span>
                  <button onClick={() => setFaqs(faqs.filter((_, idx) => idx !== i))} className="text-gray-400 hover:text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <input className="input text-sm mb-2" placeholder="Question" value={faq.question}
                  onChange={e => { const f = [...faqs]; f[i] = { ...f[i], question: e.target.value }; setFaqs(f) }} />
                <textarea className="textarea text-sm" placeholder="Answer" value={faq.answer}
                  onChange={e => { const f = [...faqs]; f[i] = { ...f[i], answer: e.target.value }; setFaqs(f) }} />
              </div>
            ))}
          </div>

          <Button fullWidth loading={saving} onClick={handleSave} size="lg">
            <Save className="w-4 h-4" /> Save all changes
          </Button>
        </div>
      </div>
    </div>
  )
}
