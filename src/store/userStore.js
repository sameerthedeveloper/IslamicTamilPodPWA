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
    // firebase.js reacts to this same event by kicking off
    // signInAnonymously() — don't mark ready yet, or a fetch gated on
    // status stays stuck with no user forever (its effect never reruns
    // once status is already 'ready', even when the real anonymous user
    // lands moments later). Stay 'pending' until that settles; the
    // fallback timer below covers the case where it never does.
    return
  }
  try {
    const profile = await loadProfile(fbUser)
    useUserStore.setState({ user: profile, status: 'ready' })
  } catch {
    useUserStore.setState({ user: null, status: 'ready' })
  }
})

// Anonymous sign-in can fail (offline, blocked storage, etc) and never
// fire onAuthStateChanged again — without this, status would stay
// 'pending' forever and every gated fetch would just hang.
setTimeout(() => {
  if (useUserStore.getState().status === 'pending') {
    useUserStore.setState({ status: 'ready' })
  }
}, 8000)
