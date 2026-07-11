'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { ChevronLeft, Info } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { value: 'social_media', label: 'Social Media Account' },
  { value: 'domain', label: 'Domain Name or Website' },
  { value: 'template', label: 'Template (Canva, Figma, etc.)' },
  { value: 'digital_product', label: 'Digital Product' },
  { value: 'software', label: 'Software License' },
  { value: 'source_code', label: 'Source Code / App' },
  { value: 'ebook', label: 'E-book or Guide' },
  { value: 'physical', label: 'Physical Item' },
  { value: 'other', label: 'Other' },
]

export default function SellPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '', category: '', description: '', price: '',
    delivery_type: 'manual', condition: 'new', proof_of_ownership: '',
  })

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async () => {
    if (!form.title || !form.category || !form.description || !form.price) {
      toast.error('All required fields must be filled')
      return
    }
    if (Number(form.price) < 1) { toast.error('Minimum price is $1'); return }

    setLoading(true)
    try {
      const res = await axios.post('/api/marketplace', { ...form, price: Number(form.price) })
      toast.success('Listing submitted for review!')
      router.push('/dashboard/marketplace')
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to create listing')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/marketplace" className="flex items-center gap-1 text-sm text-gray-400 hover:text-navy-900 mb-5 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Marketplace
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h1 className="text-xl font-semibold text-navy-900 mb-1">List an item for sale</h1>
          <p className="text-sm text-gray-400 mb-6">Only 5% commission on every sale. 1–2 day clearance after delivery confirmed.</p>

          <div className="space-y-5">
            <div>
              <label className="input-label">Listing title <span className="text-red-400">*</span></label>
              <input className="input" placeholder="e.g. 50K Instagram account - Fashion niche - Nigeria"
                value={form.title} onChange={e => update('title', e.target.value)} maxLength={200} />
            </div>

            <div>
              <label className="input-label">Category <span className="text-red-400">*</span></label>
              <select className="select" value={form.category} onChange={e => update('category', e.target.value)}>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            <div>
              <label className="input-label">Description <span className="text-red-400">*</span></label>
              <textarea className="textarea h-32"
                placeholder="Describe exactly what you are selling. Include all relevant details — for social media accounts: follower count, engagement rate, niche, account age, etc."
                value={form.description} onChange={e => update('description', e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">Price (USD) <span className="text-red-400">*</span></label>
                <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input type="number" min={1} className="input pl-7" placeholder="0.00"
                    value={form.price} onChange={e => update('price', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="input-label">Delivery method</label>
                <select className="select" value={form.delivery_type} onChange={e => update('delivery_type', e.target.value)}>
                  <option value="instant">⚡ Instant digital delivery</option>
                  <option value="manual">Manual delivery (within 24h)</option>
                  <option value="physical">Physical shipping</option>
                </select>
              </div>
            </div>

            <div>
              <label className="input-label">Proof of ownership</label>
              <textarea className="textarea h-20"
                placeholder="Briefly describe how you will prove ownership to the buyer (e.g. screenshot of account admin, domain registrar login, etc.)"
                value={form.proof_of_ownership} onChange={e => update('proof_of_ownership', e.target.value)} />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-700">
                  <p className="font-medium mb-1">Listing guidelines</p>
                  <ul className="space-y-1 text-xs">
                    <li>• You must own what you are selling</li>
                    <li>• No fake or bot-filled accounts</li>
                    <li>• Accurately describe the item — misrepresentation leads to account ban</li>
                    <li>• Listings are reviewed within 24 hours</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button fullWidth loading={loading} onClick={handleSubmit} size="lg">Submit listing for review</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
