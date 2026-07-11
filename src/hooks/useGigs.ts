import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { Gig, GigSearchFilters } from '@/types'

export function useGigs(initialFilters?: GigSearchFilters) {
  const [gigs, setGigs] = useState<Gig[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<GigSearchFilters>(initialFilters || { page: 1, limit: 20 })

  const fetch = useCallback(async (overrides?: Partial<GigSearchFilters>) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      const merged = { ...filters, ...overrides }
      Object.entries(merged).forEach(([k, v]) => { if (v !== undefined && v !== '') params.set(k, String(v)) })
      const res = await axios.get(`/api/gigs?${params}`)
      setGigs(res.data.data || [])
      setTotal(res.data.total || 0)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to fetch gigs')
    }
    setLoading(false)
  }, [filters])

  useEffect(() => { fetch() }, [filters])

  const updateFilter = (key: keyof GigSearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const nextPage = () => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))
  const prevPage = () => setFilters(prev => ({ ...prev, page: Math.max(1, (prev.page || 1) - 1) }))

  return { gigs, total, loading, error, filters, updateFilter, nextPage, prevPage, refetch: fetch }
}

export function useMyGigs() {
  const [gigs, setGigs] = useState<Gig[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async (status?: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (status) params.set('status', status)
      const res = await axios.get(`/api/gigs/mine?${params}`)
      setGigs(res.data.data || [])
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to fetch gigs')
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [])

  return { gigs, loading, error, refetch: fetch }
}
