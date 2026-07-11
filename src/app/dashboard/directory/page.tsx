'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { Building, Plus, Eye, Edit, CheckCircle, ChevronRight, Briefcase } from 'lucide-react'
import axios from 'axios'

export default function DashboardDirectoryPage() {
  const [businesses, setBusinesses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchMyBusinesses() }, [])

  const fetchMyBusinesses = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/directory?my_listings=true')
      setBusinesses(res.data.data || [])
    } catch {}
    setLoading(false)
  }

  const PLAN_STYLES: Record<string, string> = {
    free: 'badge-gray', standard: 'badge-blue', premium: 'badge-amber',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-navy-900">My Directory Listings</h1>
            <p className="text-sm text-gray-400 mt-0.5">{businesses.length} business{businesses.length !== 1 ? 'es' : ''} listed</p>
          </div>
          <Link href="/directory/register">
            <Button><Plus className="w-4 h-4" /> Add business</Button>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2].map(i=><div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse"/>)}</div>
        ) : businesses.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Building className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <h3 className="font-medium text-navy-900 mb-1">No business listed</h3>
            <p className="text-sm text-gray-400 mb-4">List your business on the NOLANCE Directory to attract clients directly</p>
            <Link href="/directory/register"><Button>List your business</Button></Link>
          </div>
        ) : (
          <div className="space-y-4">
            {businesses.map(biz => {
              const activeNeeds = (biz.service_needs || []).filter((s: any) => s.is_active).length
              return (
                <div key={biz.id} className="bg-white border border-gray-100 rounded-xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-navy-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {biz.logo_url ? <img src={biz.logo_url} alt={biz.name} className="w-full h-full object-cover" />
                        : <Building className="w-7 h-7 text-navy-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-navy-900">{biz.name}</h3>
                        {biz.is_verified && <CheckCircle className="w-4 h-4 text-green-500" />}
                        <span className={`badge text-xs ${PLAN_STYLES[biz.plan] || 'badge-gray'}`}>{biz.plan}</span>
                      </div>
                      <p className="text-sm text-gray-400 capitalize mb-2">{biz.category}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3"/>{biz.views || 0} views</span>
                        <span>{biz.contact_count || 0} contacts</span>
                        {activeNeeds > 0 && (
                          <span className="text-green-600 font-medium flex items-center gap-1">
                            <Briefcase className="w-3 h-3"/>{activeNeeds} active need{activeNeeds > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Link href={`/directory/${biz.slug}`}>
                        <Button size="sm" variant="outline"><Eye className="w-3.5 h-3.5" /> View</Button>
                      </Link>
                      <Button size="sm" variant="ghost">
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </Button>
                    </div>
                  </div>

                  {/* Plan Upgrade Banner for Free */}
                  {biz.plan === 'free' && (
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <p className="text-xs text-gray-500">Upgrade to Standard or Premium for priority placement and more visibility</p>
                      <Button size="sm" className="flex-shrink-0">Upgrade plan</Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
