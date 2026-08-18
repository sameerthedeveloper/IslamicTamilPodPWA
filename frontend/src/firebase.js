import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { isSupported, getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: 'AIzaSyAp86xFTd2hwuWKVCEPian7A1h7LsD_760',
  authDomain: 'tamilpodcasts-f017c.firebaseapp.com',
  projectId: 'tamilpodcasts-f017c',
  storageBucket: 'tamilpodcasts-f017c.firebasestorage.app',
  messagingSenderId: '554368268909',
  appId: '1:554368268909:web:0f3d836a08d913551d5d64',
  measurementId: 'G-5EXNC008Y6',
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Analytics only works in a browser that supports it (not during SSR/build).
export const analyticsReady = isSupported().then((ok) => (ok ? getAnalytics(app) : null))
