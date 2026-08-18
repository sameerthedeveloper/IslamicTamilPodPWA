import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { isSupported, getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)

export const db = getFirestore(app)

// The public app has no account system — sign every visitor in anonymously
// so they get a stable per-device uid, which is all "users/{uid}/history"
// (continue-listening progress) and "users/{uid}/bookmarks" need. Admin
// login (email/password) simply replaces this session when it happens.
onAuthStateChanged(auth, (user) => {
  if (!user) signInAnonymously(auth).catch(() => {})
})

export const storage = getStorage(app)

// Analytics only works in a browser that supports it (not during SSR/build).
export const analyticsReady = firebaseConfig.measurementId
  ? isSupported().then((ok) => (ok ? getAnalytics(app) : null))
  : Promise.resolve(null)
