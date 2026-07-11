import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import axios from 'axios'

export function useAuth(requireAuth = false) {
  const { user, token, isAuthenticated, setUser, setToken, logout } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (requireAuth && !isAuthenticated) {
      router.push(`/auth/login?redirect=${window.location.pathname}`)
    }
  }, [isAuthenticated, requireAuth])

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }, [token])

  const refreshUser = async () => {
    if (!user?.username) return
    try {
      const res = await axios.get(`/api/users/${user.username}`)
      setUser(res.data.data)
    } catch {}
  }

  return { user, token, isAuthenticated, setUser, setToken, logout, refreshUser }
}
