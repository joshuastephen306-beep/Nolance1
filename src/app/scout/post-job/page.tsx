'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { ChevronLeft, Plus, X } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function PostJobPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')
  const [form, setForm] = useState({
    title: '', description: '', category_id: '', budget_type: 'fixed',
    budget_min: '', budget_max: '', duration: '', deadline: '',
    visibility: 'public', min_seller_level: 'new',
  })

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const addSkill = () => {
    const s = skillInput.trim()
    if (!s || skills.includes(s) || skills.length >= 15) return
    setSkills([...skills, s])
    setSkillInput('')
  }

  const handleSubmit = async () => {
    if (!form.title || form.title.length < 10) { toast.error('Title must be at least 10 characters'); return }
    if (!form.description || form.description.length < 50) { toast.error('Description must be at least 50 characters'); return }
    if (!form.budget_type) { toast.error('Budget type is required'); return }

    setLoading(true)
    try {
      const res = await axios.post('/api/scout/jobs', {
        ...form,
        budget_min: form.budget_min ? Number(form.budget_min) : null,
        budget_max: form.budget_max ? Number(form.budget_max) : null,
        required_skills: skills,
        deadline: form.deadline || null,
      })
      toast.success('Job posted! Sellers will start submitting proposals.')
      router.push(`/scout/jobs/${res.data.data.job.id}`)
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to post job')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/scout" className="flex items-center gap-1 text-sm text-gray-400 hover:text-navy-900 mb-5 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Scout
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h1 className="text-xl font-semibold text-navy-900 mb-1">Post a job</h1>
          <p className="text-sm text-gray-400 mb-6">Describe your project and receive proposals from qualified sellers</p>

          <div className="space-y-5">
            <div>
              <label className="input-label">Job title <span className="text-red-400">*</span></label>
              <input className="input" placeholder="e.g. Build a React website for my startup"
                value={form.title} onChange={e => update('title', e.target.value)} maxLength={200} />
              <p className="input-hint">{form.title.length}/200</p>
            </div>

            <div>
              <label className="input-label">Description <span className="text-red-400">*</span></label>
              <textarea className="textarea h-36"
                placeholder="Describe your project in detail. What do you need? What skills are required? What does success look like?"
                value={form.description} onChange={e => update('description', e.target.value)} />
              <p className="input-hint">{form.description.length} chars (minimum 50)</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">Budget type</label>
                <select className="select" value={form.budget_type} onChange={e => update('budget_type', e.target.value)}>
                  <option value="fixed">Fixed price</option>
                  <option value="hourly">Hourly rate</option>
                </select>
              </div>
              <div>
                <label className="input-label">Project duration</label>
                <select className="select" value={form.duration} onChange={e => update('duration', e.target.value)}>
                  <option value="">Flexible</option>
                  <option value="short">Short (less than 1 week)</option>
                  <option value="medium">Medium (1–4 weeks)</option>
                  <option value="long">Long term (1+ month)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">Min budget ($)</label>
                <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input type="number" className="input pl-7" placeholder="0" value={form.budget_min} onChange={e => update('budget_min', e.target.value)} /></div>
              </div>
              <div>
                <label className="input-label">Max budget ($)</label>
                <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input type="number" className="input pl-7" placeholder="0" value={form.budget_max} onChange={e => update('budget_max', e.target.value)} /></div>
              </div>
            </div>

            <div>
              <label className="input-label">Required skills (optional)</label>
              <div className="flex gap-2 mb-2">
                <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  placeholder="e.g. React, Figma, SEO" className="input flex-1" />
                <Button type="button" variant="outline" size="sm" onClick={addSkill}>Add</Button>
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {skills.map(s => (
                    <span key={s} className="flex items-center gap-1 bg-navy-50 text-navy-700 border border-navy-100 px-3 py-1 rounded-full text-sm">
                      {s}<button onClick={() => setSkills(skills.filter(x => x !== s))} className="ml-1 hover:text-red-500"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">Deadline (optional)</label>
                <input type="date" className="input" value={form.deadline} onChange={e => update('deadline', e.target.value)}
                  min={new Date().toISOString().split('T')[0]} />
              </div>
              <div>
                <label className="input-label">Minimum seller level</label>
                <select className="select" value={form.min_seller_level} onChange={e => update('min_seller_level', e.target.value)}>
                  <option value="new">Any level</option>
                  <option value="level1">Level 1+</option>
                  <option value="level2">Level 2+</option>
                  <option value="top_rated">Top Rated only</option>
                  <option value="pro_verified">Pro Verified only</option>
                </select>
              </div>
            </div>

            <div>
              <label className="input-label">Visibility</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'public', label: 'Public', desc: 'All sellers can see and apply' },
                  { value: 'invite_only', label: 'Invite only', desc: 'Only sellers you invite' },
                ].map(opt => (
                  <label key={opt.value} className={`border-2 rounded-xl p-3 cursor-pointer transition-all ${form.visibility === opt.value ? 'border-green-500 bg-green-50' : 'border-gray-100 hover:border-gray-200'}`}>
                    <input type="radio" value={opt.value} checked={form.visibility === opt.value}
                      onChange={() => update('visibility', opt.value)} className="sr-only" />
                    <p className="text-sm font-medium text-navy-900">{opt.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <Button fullWidth loading={loading} onClick={handleSubmit} size="lg">
                Post job
              </Button>
              <p className="text-xs text-gray-400 text-center mt-2">Job posts expire after 30 days. You can extend or close them at any time.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
