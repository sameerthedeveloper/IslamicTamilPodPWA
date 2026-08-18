import { create } from 'zustand'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'

export const useAuthStore = create((set) => ({
  user: null,
  // 'pending' until Firebase reports the initial auth state, then 'ready'.
  status: 'pending',

  login: async (email, password) => {
    const { user: fbUser } = await signInWithEmailAndPassword(auth, email, password)
    const profile = await loadProfile(fbUser)
    if (profile.role !== 'ADMIN') {
      await signOut(auth)
      throw new Error('This account does not have admin access.')
    }
    set({ user: profile })
    return profile
  },

  logout: () => signOut(auth),
}))

async function loadProfile(fbUser) {
  const snap = await getDoc(doc(db, 'users', fbUser.uid))
  const data = snap.exists() ? snap.data() : {}
  return {
    uid: fbUser.uid,
    email: fbUser.email,
    name: data.name ?? fbUser.displayName ?? fbUser.email,
    role: data.role ?? 'USER',
  }
}

onAuthStateChanged(auth, async (fbUser) => {
  if (!fbUser) {
    useAuthStore.setState({ user: null, status: 'ready' })
    return
  }
  try {
    const profile = await loadProfile(fbUser)
    useAuthStore.setState({ user: profile, status: 'ready' })
  } catch {
    useAuthStore.setState({ user: null, status: 'ready' })
  }
})
