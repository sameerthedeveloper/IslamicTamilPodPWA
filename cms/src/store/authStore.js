import { create } from 'zustand'

const stored = (() => {
  try {
    return JSON.parse(localStorage.getItem('cms_auth') || 'null')
  } catch {
    return null
  }
})()

export const useAuthStore = create((set) => ({
  token: stored?.token ?? null,
  user: stored?.user ?? null,

  login: (token, user) => {
    localStorage.setItem('cms_auth', JSON.stringify({ token, user }))
    set({ token, user })
  },

  logout: () => {
    localStorage.removeItem('cms_auth')
    set({ token: null, user: null })
  },
}))
