import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  linkWithCredential,
  linkWithPopup,
  signInWithPopup,
  EmailAuthProvider,
  GoogleAuthProvider,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase'

const googleProvider = new GoogleAuthProvider()

export async function registerUser(name, email, password) {
  const current = auth.currentUser
  let fbUser

  // Every visitor already has an anonymous session (see firebase.js) that
  // may carry continue-listening/bookmark history — upgrade it in place
  // via linkWithCredential so registering doesn't lose that data. Only
  // falls back to a fresh account if there's no anonymous session, or it's
  // already tied to a different email (link fails).
  if (current?.isAnonymous) {
    try {
      const cred = EmailAuthProvider.credential(email, password)
      const result = await linkWithCredential(current, cred)
      fbUser = result.user
    } catch (err) {
      if (err.code === 'auth/email-already-in-use' || err.code === 'auth/credential-already-in-use') {
        const result = await signInWithEmailAndPassword(auth, email, password)
        fbUser = result.user
      } else {
        throw err
      }
    }
  } else {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    fbUser = result.user
  }

  await updateProfile(fbUser, { displayName: name })
  await setDoc(
    doc(db, 'users', fbUser.uid),
    { name, email, role: 'USER', createdAt: serverTimestamp() },
    { merge: true },
  )
  return fbUser
}

export async function loginUser(email, password) {
  const { user } = await signInWithEmailAndPassword(auth, email, password)
  return user
}

// One flow for both login and register — Google OAuth already tells us
// whether the account is new, so there's no separate "create" step the
// way email/password needs.
export async function loginWithGoogle() {
  const current = auth.currentUser
  let fbUser

  // Same anonymous-session upgrade as registerUser — carries over any
  // continue-listening/bookmark history already saved under this device's
  // anonymous uid instead of starting a fresh, empty account.
  if (current?.isAnonymous) {
    try {
      const result = await linkWithPopup(current, googleProvider)
      fbUser = result.user
    } catch (err) {
      if (err.code === 'auth/credential-already-in-use' || err.code === 'auth/email-already-in-use') {
        const result = await signInWithPopup(auth, googleProvider)
        fbUser = result.user
      } else {
        throw err
      }
    }
  } else {
    const result = await signInWithPopup(auth, googleProvider)
    fbUser = result.user
  }

  // Only set role on first sign-in — merge:true still overwrites fields
  // it's given, so blindly writing role: 'USER' every time would demote
  // an existing ADMIN doc if that admin's email ever signs in here too.
  const userRef = doc(db, 'users', fbUser.uid)
  const existing = await getDoc(userRef)
  await setDoc(
    userRef,
    {
      name: fbUser.displayName,
      email: fbUser.email,
      ...(existing.exists() ? {} : { role: 'USER', createdAt: serverTimestamp() }),
    },
    { merge: true },
  )
  return fbUser
}

export function authErrorMessage(err) {
  switch (err?.code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password.'
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.'
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.'
    case 'auth/invalid-email':
      return 'Enter a valid email address.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Try again later.'
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return ''
    case 'auth/popup-blocked':
      return 'Your browser blocked the sign-in popup. Allow popups for this site and try again.'
    default:
      return err?.message || 'Something went wrong. Try again.'
  }
}
