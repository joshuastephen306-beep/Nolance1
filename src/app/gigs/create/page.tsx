'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import axios from 'axios'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Navbar } from '@/components/layout/Navbar'
import { Check, Plus, X, Info, ChevronRight, ChevronLeft, Eye, Video, FileText, Image } from 'lucide-react'
import { cn } from '@/utils'

const STEPS = [
  { id: 1, label: 'Overview', desc: 'Title, category & tags' },
  { id: 2, label: 'Pricing', desc: 'Packages & extras' },
  { id: 3, label: 'Description', desc: 'Details & FAQ' },
  { id: 4, label: 'Requirements', desc: 'What you need' },
  { id: 5, label: 'Gallery', desc: 'Images & video' },
  { id: 6, label: 'Publish', desc: 'Review & go live' },
]

const CATEGORIES = [
  { id: '1', name: 'Graphics & Design' }, { id: '2', name: 'Programming & Tech' },
  { id: '3', name: 'Digital Marketing' }, { id: '4', name: 'Writing & Translation' },
  { id: '5', name: 'Video & Animation' }, { id: '6', name: 'Music & Audio' },
  { id: '7', name: 'AI Services' }, { id: '8', name: 'Business' },
]

export default function CreateGigPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  const goNext = (data: any) => {
    setFormData((prev: any) => ({ ...prev, ...data }))
    setStep(s => Math.min(s + 1, 6))
    window.scrollTo(0, 0)
  }

  const goBack = () => { setStep(s => Math.max(s - 1, 1)); window.scrollTo(0, 0) }

  const handlePublish = async () => {
    setLoading(true)
    try {
      await axios.post('/api/gigs', { ...formData, tags })
      toast.success('Gig submitted for review! It will be live within 24 hours.')
      router.push('/dashboard/gigs')
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to create gig')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-navy-900 mb-1">Create a new gig</h1>
          <p className="text-sm text-gray-400">Follow the steps to set up your gig and start getting orders</p>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center gap-0 mb-8 overflow-x-auto scrollbar-hide">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-shrink-0">
              <button onClick={() => step > s.id && setStep(s.id)}
                className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors',
                  step === s.id ? 'bg-green-50 text-green-700 font-medium' :
                  step > s.id ? 'text-green-600 cursor-pointer hover:bg-green-50' :
                  'text-gray-400 cursor-not-allowed')}>
                <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0',
                  step > s.id ? 'bg-green-500 text-white' :
                  step === s.id ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500')}>
                  {step > s.id ? <Check className="w-3 h-3" /> : s.id}
                </div>
                <span className="hidden sm:block">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
          {step === 1 && <StepOverview onNext={goNext} formData={formData} tags={tags} setTags={setTags} tagInput={tagInput} setTagInput={setTagInput} />}
          {step === 2 && <StepPricing onNext={goNext} onBack={goBack} formData={formData} />}
          {step === 3 && <StepDescription onNext={goNext} onBack={goBack} formData={formData} />}
          {step === 4 && <StepRequirements onNext={goNext} onBack={goBack} formData={formData} />}
          {step === 5 && <StepGallery onNext={goNext} onBack={goBack} formData={formData} />}
          {step === 6 && <StepPublish formData={formData} tags={tags} onBack={goBack} onPublish={handlePublish} loading={loading} />}
        </div>
      </div>
    </div>
  )
}

// ── STEP 1: OVERVIEW ──────────────────────────────────────────
function StepOverview({ onNext, formData, tags, setTags, tagInput, setTagInput }: any) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { title: formData.title || '', category_id: formData.category_id || '', description_short: formData.description_short || '' }
  })
  const title = watch('title') || ''

  const addTag = () => {
    const t = tagInput.trim().toLowerCase()
    if (!t) return
    if (t.length > 20) { toast.error('Tag max 20 characters'); return }
    if (t.split(' ').length > 3) { toast.error('Tag max 3 words'); return }
    if (tags.includes(t)) { toast.error('Tag already added'); return }
    if (tags.length >= 14) { toast.error('Maximum 14 tags'); return }
    setTags([...tags, t])
    setTagInput('')
  }

  const removeTag = (t: string) => setTags(tags.filter((tag: string) => tag !== t))

  return (
    <form onSubmit={handleSubmit(onNext)}>
      <GigGuideBox step={1} />
      <div className="space-y-6">
        <div>
          <div className="flex justify-between mb-1.5">
            <label className="input-label mb-0">Gig title</label>
            <span className={cn('text-xs', title.length > 70 ? 'text-red-500' : 'text-gray-400')}>{title.length}/80</span>
          </div>
          <input className={cn('input', errors.title ? 'input-error' : '')} maxLength={80}
            placeholder="I will design a professional logo for your brand"
            {...register('title', { required: 'Title is required', minLength: { value: 10, message: 'Too short' }, maxLength: 80 })} />
          {errors.title && <p className="input-error-msg">{errors.title.message as string}</p>}
          <p className="input-hint">Start with "I will" — be specific and clear about what you offer</p>
        </div>

        <div>
          <label className="input-label">Category</label>
          <select className={cn('select', errors.category_id ? 'input-error' : '')}
            {...register('category_id', { required: 'Category is required' })}>
            <option value="">Select a category</option>
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {errors.category_id && <p className="input-error-msg">{errors.category_id.message as string}</p>}
        </div>

        <div>
          <div className="flex justify-between mb-1.5">
            <label className="input-label mb-0">Search tags ({tags.length}/14)</label>
            <span className="text-xs text-gray-400">Max 20 chars, 3 words each</span>
          </div>
          <div className="flex gap-2 mb-3">
            <input value={tagInput} onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder="e.g. logo design" maxLength={20}
              className="input flex-1" />
            <Button type="button" onClick={addTag} variant="outline" size="sm">Add</Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((t: string) => (
                <span key={t} className="flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 px-3 py-1 rounded-full text-sm">
                  {t}
                  <button type="button" onClick={() => removeTag(t)} className="ml-1 hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <p className="input-hint">Tags help buyers find your gig. Use all 14 for best results.</p>
        </div>
      </div>
      <StepNav onBack={null} />
    </form>
  )
}

// ── STEP 2: PRICING ───────────────────────────────────────────
function StepPricing({ onNext, onBack, formData }: any) {
  const [packages, setPackages] = useState(formData.packages || {
    basic: { name: 'Basic', description: '', price: 5, delivery_days: 1, revisions: 1 },
    standard: { name: 'Standard', description: '', price: 15, delivery_days: 3, revisions: 3 },
    premium: { name: 'Premium', description: '', price: 30, delivery_days: 7, revisions: 5 },
  })
  const [extras, setExtras] = useState(formData.extras || [])

  const updatePkg = (tier: string, field: string, value: any) => {
    setPackages((p: any) => ({ ...p, [tier]: { ...p[tier], [field]: value } }))
  }

  const addExtra = () => {
    if (extras.length >= 5) { toast.error('Maximum 5 extras'); return }
    setExtras([...extras, { title: '', description: '', price: 5, delivery_days_extra: 0 }])
  }

  const updateExtra = (i: number, field: string, value: any) => {
    const updated = [...extras]
    updated[i] = { ...updated[i], [field]: value }
    setExtras(updated)
  }

  const removeExtra = (i: number) => setExtras(extras.filter((_: any, idx: number) => idx !== i))

  return (
    <div>
      <GigGuideBox step={2} />
      <div className="space-y-6">
        {/* Packages */}
        <div>
          <h3 className="font-medium text-navy-900 mb-4">Packages</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {['basic', 'standard', 'premium'].map(tier => (
              <div key={tier} className="border border-gray-100 rounded-xl p-4">
                <div className={cn('text-xs font-semibold uppercase tracking-wide mb-3 px-2 py-1 rounded-full inline-block',
                  tier === 'basic' ? 'bg-gray-100 text-gray-600' : tier === 'standard' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600')}>
                  {tier}
                </div>
                <div className="space-y-3">
                  <input className="input text-sm" placeholder="Package name" value={packages[tier]?.name}
                    onChange={e => updatePkg(tier, 'name', e.target.value)} />
                  <textarea className="textarea text-sm h-16" placeholder="What's included..."
                    value={packages[tier]?.description} onChange={e => updatePkg(tier, 'description', e.target.value)} />
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input type="number" min={5} className="input pl-6 text-sm" placeholder="Price"
                      value={packages[tier]?.price} onChange={e => updatePkg(tier, 'price', Number(e.target.value))} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Delivery (days)</label>
                      <input type="number" min={1} max={365} className="input text-sm"
                        value={packages[tier]?.delivery_days} onChange={e => updatePkg(tier, 'delivery_days', Number(e.target.value))} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Revisions</label>
                      <input type="number" min={0} className="input text-sm"
                        value={packages[tier]?.revisions} onChange={e => updatePkg(tier, 'revisions', Number(e.target.value))} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Extras */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-navy-900">Gig extras (optional)</h3>
            <Button type="button" onClick={addExtra} variant="outline" size="sm" disabled={extras.length >= 5}>
              <Plus className="w-4 h-4" /> Add extra
            </Button>
          </div>
          {extras.map((extra: any, i: number) => (
            <div key={i} className="border border-gray-100 rounded-xl p-4 mb-3 relative">
              <button onClick={() => removeExtra(i)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500">
                <X className="w-4 h-4" />
              </button>
              <div className="grid sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <input className="input text-sm" placeholder="Extra title" value={extra.title}
                    onChange={e => updateExtra(i, 'title', e.target.value)} />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input type="number" min={1} className="input pl-6 text-sm" placeholder="Price"
                    value={extra.price} onChange={e => updateExtra(i, 'price', Number(e.target.value))} />
                </div>
                <input type="number" min={0} className="input text-sm" placeholder="Extra days"
                  value={extra.delivery_days_extra} onChange={e => updateExtra(i, 'delivery_days_extra', Number(e.target.value))} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <StepNav onBack={onBack} onNext={() => onNext({ packages, extras })} />
    </div>
  )
}

// ── STEP 3: DESCRIPTION ───────────────────────────────────────
function StepDescription({ onNext, onBack, formData }: any) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { description: formData.description || '', faqs: formData.faqs || [] }
  })
  const description = watch('description') || ''
  const [faqs, setFaqs] = useState(formData.faqs || [])

  const addFaq = () => {
    if (faqs.length >= 10) { toast.error('Maximum 10 FAQs'); return }
    setFaqs([...faqs, { question: '', answer: '' }])
  }

  const updateFaq = (i: number, field: string, value: string) => {
    const updated = [...faqs]; updated[i] = { ...updated[i], [field]: value }; setFaqs(updated)
  }

  return (
    <form onSubmit={handleSubmit(data => onNext({ ...data, faqs }))}>
      <GigGuideBox step={3} />
      <div className="space-y-6">
        <div>
          <div className="flex justify-between mb-1.5">
            <label className="input-label mb-0">Gig description</label>
            <span className={cn('text-xs', description.length < 120 ? 'text-red-500' : 'text-gray-400')}>{description.length}/1200</span>
          </div>
          <textarea className={cn('textarea min-h-40', errors.description ? 'input-error' : '')} maxLength={1200}
            placeholder="Describe your service in detail. What will you do? What does the buyer receive? What makes you the best choice?"
            {...register('description', { required: 'Description required', minLength: { value: 120, message: 'Minimum 120 characters' } })} />
          {errors.description && <p className="input-error-msg">{errors.description.message as string}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <div><h3 className="font-medium text-navy-900">FAQ (optional)</h3>
              <p className="text-xs text-gray-400">Answer common questions buyers ask before ordering</p></div>
            <Button type="button" onClick={addFaq} variant="outline" size="sm"><Plus className="w-4 h-4" /> Add FAQ</Button>
          </div>
          {faqs.map((faq: any, i: number) => (
            <div key={i} className="border border-gray-100 rounded-xl p-4 mb-3">
              <div className="flex justify-between mb-2">
                <span className="text-xs font-medium text-gray-400">FAQ {i + 1}</span>
                <button type="button" onClick={() => setFaqs(faqs.filter((_: any, idx: number) => idx !== i))}
                  className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
              </div>
              <input className="input text-sm mb-2" placeholder="Question buyers often ask..."
                value={faq.question} onChange={e => updateFaq(i, 'question', e.target.value)} />
              <textarea className="textarea text-sm" placeholder="Your clear and helpful answer..."
                value={faq.answer} onChange={e => updateFaq(i, 'answer', e.target.value)} />
            </div>
          ))}
        </div>
      </div>
      <StepNav onBack={onBack} />
    </form>
  )
}

// ── STEP 4: REQUIREMENTS ──────────────────────────────────────
function StepRequirements({ onNext, onBack, formData }: any) {
  const [requirements, setRequirements] = useState(formData.requirements || [])

  const addReq = () => setRequirements([...requirements, { question: '', type: 'text', is_required: true }])
  const updateReq = (i: number, field: string, value: any) => {
    const updated = [...requirements]; updated[i] = { ...updated[i], [field]: value }; setRequirements(updated)
  }

  return (
    <div>
      <GigGuideBox step={4} />
      <div>
        <div className="flex items-center justify-between mb-4">
          <div><h3 className="font-medium text-navy-900">Order requirements</h3>
            <p className="text-xs text-gray-400">What do you need from the buyer before you can start?</p></div>
          <Button type="button" onClick={addReq} variant="outline" size="sm"><Plus className="w-4 h-4" /> Add question</Button>
        </div>
        {requirements.length === 0 && (
          <div className="border-2 border-dashed border-gray-100 rounded-xl p-8 text-center">
            <p className="text-sm text-gray-400">No requirements added yet. Add questions to get the information you need from buyers before starting their order.</p>
          </div>
        )}
        {requirements.map((req: any, i: number) => (
          <div key={i} className="border border-gray-100 rounded-xl p-4 mb-3">
            <div className="flex justify-between mb-3">
              <select value={req.type} onChange={e => updateReq(i, 'type', e.target.value)} className="select text-sm w-auto">
                <option value="text">Free text answer</option>
                <option value="multiple_choice">Multiple choice</option>
                <option value="file">File upload</option>
              </select>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer">
                  <input type="checkbox" checked={req.is_required} onChange={e => updateReq(i, 'is_required', e.target.checked)}
                    className="w-3.5 h-3.5" /> Required
                </label>
                <button type="button" onClick={() => setRequirements(requirements.filter((_: any, idx: number) => idx !== i))}
                  className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
              </div>
            </div>
            <input className="input text-sm" placeholder="Your question to the buyer..."
              value={req.question} onChange={e => updateReq(i, 'question', e.target.value)} />
          </div>
        ))}
      </div>
      <StepNav onBack={onBack} onNext={() => onNext({ requirements })} />
    </div>
  )
}

// ── STEP 5: GALLERY ───────────────────────────────────────────
function StepGallery({ onNext, onBack, formData }: any) {
  return (
    <div>
      <GigGuideBox step={5} />
      <div className="space-y-6">
        <div>
          <h3 className="font-medium text-navy-900 mb-2">Gig images (up to 3)</h3>
          <p className="text-xs text-gray-400 mb-4">Upload high-quality images that showcase your work. Min 712x430px, JPG or PNG.</p>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(n => (
              <div key={n} className="border-2 border-dashed border-gray-200 rounded-xl h-32 flex flex-col items-center justify-center cursor-pointer hover:border-green-400 transition-colors">
                <Image className="w-6 h-6 text-gray-300 mb-1" />
                <span className="text-xs text-gray-400">Upload image {n}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-medium text-navy-900 mb-2">Gig video (optional but recommended)</h3>
          <p className="text-xs text-gray-400 mb-4">Max 75 seconds. MP4 or AVI. A video increases orders significantly.</p>
          <div className="border-2 border-dashed border-gray-200 rounded-xl h-32 flex flex-col items-center justify-center cursor-pointer hover:border-green-400 transition-colors">
            <Video className="w-6 h-6 text-gray-300 mb-1" />
            <span className="text-xs text-gray-400">Upload gig video</span>
          </div>
        </div>
        <div>
          <h3 className="font-medium text-navy-900 mb-2">PDF document (optional)</h3>
          <div className="border-2 border-dashed border-gray-200 rounded-xl h-24 flex flex-col items-center justify-center cursor-pointer hover:border-green-400 transition-colors">
            <FileText className="w-5 h-5 text-gray-300 mb-1" />
            <span className="text-xs text-gray-400">Upload portfolio PDF (max 9MB)</span>
          </div>
        </div>
      </div>
      <StepNav onBack={onBack} onNext={() => onNext({})} />
    </div>
  )
}

// ── STEP 6: PUBLISH ───────────────────────────────────────────
function StepPublish({ formData, tags, onBack, onPublish, loading }: any) {
  return (
    <div>
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Eye className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold text-navy-900 mb-2">Ready to publish!</h2>
        <p className="text-sm text-gray-400">Review your gig before submitting for approval</p>
      </div>

      <div className="bg-gray-50 rounded-xl p-6 mb-6 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Title</span>
          <span className="font-medium text-navy-900 text-right max-w-xs">{formData.title || '—'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Tags</span>
          <span className="font-medium text-navy-900">{tags.length} tags added</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Packages</span>
          <span className="font-medium text-navy-900">{Object.keys(formData.packages || {}).length} packages</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Starting price</span>
          <span className="font-medium text-green-600">${formData.packages?.basic?.price || 0}</span>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800 mb-1">What happens next?</p>
            <p className="text-xs text-blue-600 leading-relaxed">Your gig will be reviewed by the Nolance team within 24 hours. You will receive an email when it goes live. Make sure your gig follows our community guidelines.</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <Button fullWidth loading={loading} onClick={onPublish}>
          Submit for review 🚀
        </Button>
      </div>
    </div>
  )
}

// ── SHARED COMPONENTS ─────────────────────────────────────────
function StepNav({ onBack, onNext }: { onBack: (() => void) | null; onNext?: () => void }) {
  return (
    <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
      {onBack ? (
        <Button variant="outline" onClick={onBack} type="button">
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
      ) : <div />}
      <Button type={onNext ? 'button' : 'submit'} onClick={onNext}>
        Continue <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  )
}

function GigGuideBox({ step }: { step: number }) {
  const guides: Record<number, { title: string; tips: string[] }> = {
    1: { title: '💡 Tips for a great gig title', tips: ['Start with "I will"', 'Be specific about what you deliver', 'Include your most important keyword', 'Avoid vague phrases like "help with" or "work on"'] },
    2: { title: '💡 Pricing tips', tips: ['Price your Basic package to attract first-time buyers', 'Make your Premium clearly worth the upgrade', 'Add extras that genuinely add value', 'Research what others in your category charge'] },
    3: { title: '💡 Description tips', tips: ['Open strong — tell buyers exactly what they get', 'Describe your process and what makes you unique', 'Include keywords naturally throughout', 'End with a call to action'] },
    4: { title: '💡 Requirements tips', tips: ['Ask only what you actually need to start', 'Be specific so buyers give complete answers', 'Well-written requirements reduce revision requests'] },
    5: { title: '💡 Gallery tips', tips: ['Your first image is your thumbnail — make it count', 'Show actual examples of your work', 'A gig video increases orders significantly', 'Keep visuals clean and professional'] },
  }
  const guide = guides[step]
  if (!guide) return null

  return (
    <div className="bg-navy-50 border border-navy-100 rounded-xl p-4 mb-6">
      <p className="text-sm font-medium text-navy-800 mb-2">{guide.title}</p>
      <ul className="space-y-1">
        {guide.tips.map(tip => (
          <li key={tip} className="flex items-start gap-2 text-xs text-navy-600">
            <span className="text-green-500 mt-0.5">✓</span> {tip}
          </li>
        ))}
      </ul>
    </div>
  )
}
