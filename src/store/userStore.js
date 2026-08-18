import { create } from 'zustand'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'

export const useUserStore = create(() => ({
  user: null,
  // 'pending' until Firebase reports the initial auth state, then 'ready'.
  status: 'pending',
}))

async function loadProfile(fbUser) {
  if (fbUser.isAnonymous) return { uid: fbUser.uid, isAnonymous: true }
  const snap = await getDoc(doc(db, 'users', fbUser.uid))
  const data = snap.exists() ? snap.data() : {}
  return {
    uid: fbUser.uid,
    email: fbUser.email,
    name: data.name ?? fbUser.displayName ?? fbUser.email,
    isAnonymous: false,
  }
}

auth.onAuthStateChanged(async (fbUser) => {
  if (!fbUser) {
    useUserStore.setState({ user: null, status: 'ready' })
    return
  }
  try {
    const profile = await loadProfile(fbUser)
    useUserStore.setState({ user: profile, status: 'ready' })
  } catch {
    useUserStore.setState({ user: null, status: 'ready' })
  }
})
