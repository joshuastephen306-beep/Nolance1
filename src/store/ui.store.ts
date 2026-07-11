import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SectionType, UIStore } from '@/types'

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      activeSection: 'gigs' as SectionType,
      theme: 'light' as 'light' | 'dark',

      setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
      setActiveSection: (section: SectionType) => set({ activeSection: section }),
      setTheme: (theme: 'light' | 'dark') => set({ theme }),
    }),
    {
      name: 'nolance-ui',
      partialize: (state) => ({ activeSection: state.activeSection, theme: state.theme }),
    }
  )
)
