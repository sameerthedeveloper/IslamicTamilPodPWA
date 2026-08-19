import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import {
  initializeFirestore,
  getFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore'
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

// Persistent local cache so reads already made (episodes, bookmarks,
// history) keep working offline, not just the static PWA shell. Falls
// back to the plain in-memory client if IndexedDB persistence throws
// (private browsing, some in-app browsers, etc).
export let db
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  })
} catch {
  db = getFirestore(app)
}

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
