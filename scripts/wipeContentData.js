// DESTRUCTIVE. Permanently deletes every document in the 'episodes',
// 'scholars', 'series', and 'topics' Firestore collections — including
// anything created by hand in the admin CMS, not just imported data.
// There is no undo. Meant to be run once immediately before
// `npm run seed:tamildawah`, to reseed those collections from scratch.
//
// Usage:
//   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=••••• CONFIRM_WIPE=yes-delete-everything node scripts/wipeContentData.js
//
// CONFIRM_WIPE must be exactly "yes-delete-everything" — this is a
// deliberate typed confirmation, not a boolean flag, so it can't be
// tripped by accident (e.g. a stray CONFIRM_WIPE=1 left in the shell).

import 'dotenv/config'
import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, collection, getDocs, writeBatch } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
}

const COLLECTIONS = ['episodes', 'scholars', 'series', 'topics']
const BATCH_CHUNK_SIZE = 400

async function wipeCollection(db, name) {
  const snap = await getDocs(collection(db, name))
  for (let i = 0; i < snap.docs.length; i += BATCH_CHUNK_SIZE) {
    const batch = writeBatch(db)
    snap.docs.slice(i, i + BATCH_CHUNK_SIZE).forEach((d) => batch.delete(d.ref))
    await batch.commit()
  }
  console.log(`  deleted ${snap.docs.length} doc(s) from '${name}'`)
}

async function main() {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD
  if (!email || !password) {
    console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD env vars (an existing users/{uid}.role === "ADMIN" account).')
    process.exit(1)
  }
  if (!firebaseConfig.projectId) {
    console.error('Missing VITE_FIREBASE_* env vars — run from the project root with a .env file, same as `npm run dev`.')
    process.exit(1)
  }
  if (process.env.CONFIRM_WIPE !== 'yes-delete-everything') {
    console.error(
      'Refusing to run: this permanently deletes every document in episodes/scholars/series/topics.\n' +
      'Re-run with CONFIRM_WIPE=yes-delete-everything to proceed.',
    )
    process.exit(1)
  }

  const app = initializeApp(firebaseConfig)
  const auth = getAuth(app)
  const db = getFirestore(app)
  await signInWithEmailAndPassword(auth, email, password)

  console.log('Wiping episodes, scholars, series, topics…')
  for (const name of COLLECTIONS) {
    await wipeCollection(db, name)
  }
  console.log('Done. Collections are empty — run `npm run seed:tamildawah` to reseed.')
  process.exit(0)
}

main().catch((err) => {
  console.error('Wipe failed:', err.message)
  process.exit(1)
})
