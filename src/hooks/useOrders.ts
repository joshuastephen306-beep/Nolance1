import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { Order } from '@/types'

export function useOrders(role: 'buyer' | 'seller' | 'both' = 'both', status?: string) {
  const [orders, setOrders] = useState<Order[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ role, page: String(page) })
      if (status) params.set('status', status)
      const res = await axios.get(`/api/orders?${params}`)
      setOrders(res.data.data || [])
      setTotal(res.data.total || 0)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to fetch orders')
    }
    setLoading(false)
  }, [role, status, page])

  useEffect(() => { fetch() }, [fetch])

  return { orders, total, loading, error, page, setPage, refetch: fetch }
}

export function useOrder(orderNumber: string) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!orderNumber) return
    setLoading(true)
    try {
      const res = await axios.get(`/api/orders/${orderNumber}`)
      setOrder(res.data.data)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Order not found')
    }
    setLoading(false)
  }, [orderNumber])

  useEffect(() => { fetch() }, [fetch])

  const performAction = async (action: string, extras?: Record<string, any>) => {
    try {
      const res = await axios.patch(`/api/orders/${orderNumber}`, { action, ...extras })
      await fetch()
      return res.data
    } catch (err: any) {
      throw new Error(err?.response?.data?.error || 'Action failed')
    }
  }

  return { order, loading, error, refetch: fetch, performAction }
}
