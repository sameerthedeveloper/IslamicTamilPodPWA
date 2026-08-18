import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
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

// Persistent local cache + multi-tab support so reads (and the last
// snapshot of anything already fetched) keep working offline — a plain
// service-worker app-shell cache alone wouldn't cover live Firestore data.
// Falls back to the default in-memory-only client if IndexedDB isn't
// available (private browsing, some in-app browsers, etc).
export let db
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  })
} catch {
  db = getFirestore(app)
}

export const storage = getStorage(app)

// Analytics only works in a browser that supports it (not during SSR/build).
export const analyticsReady = firebaseConfig.measurementId
  ? isSupported().then((ok) => (ok ? getAnalytics(app) : null))
  : Promise.resolve(null)
