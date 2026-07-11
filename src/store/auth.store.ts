import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, AuthStore } from '@/types'

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      setUser: (user: User | null) =>
        set({ user, isAuthenticated: !!user }),

      setToken: (token: string | null) =>
        set({ token }),

      logout: () =>
        set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'nolance-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
