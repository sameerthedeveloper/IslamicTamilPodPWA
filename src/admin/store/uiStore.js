import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { NAV_ITEMS, DEFAULT_BOTTOM_NAV_KEYS, BOTTOM_NAV_MAX } from '../navConfig'

const VALID_KEYS = new Set(NAV_ITEMS.map((n) => n.key))

export const useAdminUiStore = create(
  persist(
    (set) => ({
      sidebarOpen: false,
      openSidebar: () => set({ sidebarOpen: true }),
      closeSidebar: () => set({ sidebarOpen: false }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

      bottomNavKeys: DEFAULT_BOTTOM_NAV_KEYS,
      toggleBottomNavKey: (key) =>
        set((s) => {
          if (s.bottomNavKeys.includes(key)) {
            return { bottomNavKeys: s.bottomNavKeys.filter((k) => k !== key) }
          }
          if (s.bottomNavKeys.length >= BOTTOM_NAV_MAX) return s
          return { bottomNavKeys: [...s.bottomNavKeys, key] }
        }),
      resetBottomNavKeys: () => set({ bottomNavKeys: DEFAULT_BOTTOM_NAV_KEYS }),
    }),
    {
      name: 'admin-ui',
      partialize: (s) => ({ bottomNavKeys: s.bottomNavKeys }),
      merge: (persisted, current) => {
        const merged = { ...current, ...persisted }
        // Drop any stale/unknown keys (e.g. a nav item that got removed later).
        merged.bottomNavKeys = (merged.bottomNavKeys ?? DEFAULT_BOTTOM_NAV_KEYS).filter((k) => VALID_KEYS.has(k))
        if (merged.bottomNavKeys.length === 0) merged.bottomNavKeys = DEFAULT_BOTTOM_NAV_KEYS
        return merged
      },
    },
  ),
)
