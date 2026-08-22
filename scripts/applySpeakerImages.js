// Applies data/speaker_images.json as scholar profile pictures and
// episode/player artwork: sets scholars/{id}.image, then propagates that
// same URL to episodes/{id}.thumbnail for every episode by that scholar
// (episodes have no per-episode artwork of their own — the source site
// only has one portrait per speaker, which is what MiniPlayer/
// FullPlayerSheet/TitleCard render as `thumbnail`).
//
// Usage:
//   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=••••• node scripts/applySpeakerImages.js
//
// Idempotent: only writes docs whose image/thumbnail actually differs
// from the source, so it's safe to re-run.

import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, collection, getDocs, writeBatch, doc } from 'firebase/firestore'
import { canonicalSpeakerName } from './lib/speakerNames.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_PATH = path.join(__dirname, '..', 'data', 'speaker_images.json')

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
}

const BATCH_CHUNK_SIZE = 400

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

  const raw = JSON.parse(readFileSync(DATA_PATH, 'utf8'))
  // Keys in the source use the raw byline ("X", "X Shorts", "Abdul Basith
  // Bukhari") — canonicalize so every variant maps to the one real scholar,
  // same as the episode seed does.
  const imageByCanonicalName = new Map()
  for (const [rawName, url] of Object.entries(raw)) {
    const name = canonicalSpeakerName(rawName)
    if (name && url) imageByCanonicalName.set(name, url)
  }

  const app = initializeApp(firebaseConfig)
  const auth = getAuth(app)
  const db = getFirestore(app)
  await signInWithEmailAndPassword(auth, email, password)

  const [scholarsSnap, episodesSnap] = await Promise.all([
    getDocs(collection(db, 'scholars')),
    getDocs(collection(db, 'episodes')),
  ])

  // Pass 1 — scholar profile pictures.
  const imageByScholarId = new Map()
  let scholarsUpdated = 0
  let scholarsUnmatched = 0
  for (let i = 0; i < scholarsSnap.docs.length; i += BATCH_CHUNK_SIZE) {
    const chunk = scholarsSnap.docs.slice(i, i + BATCH_CHUNK_SIZE)
    const batch = writeBatch(db)
    let opsInBatch = 0
    chunk.forEach((d) => {
      const name = d.data().name
      const image = imageByCanonicalName.get(name)
      if (!image) {
        scholarsUnmatched += 1
        return
      }
      imageByScholarId.set(d.id, image)
      if (d.data().image === image) return
      batch.update(d.ref, { image })
      scholarsUpdated += 1
      opsInBatch += 1
    })
    if (opsInBatch > 0) await batch.commit()
  }
  console.log(`Scholars: ${scholarsUpdated} updated, ${scholarsUnmatched} with no matching image in speaker_images.json.`)

  // Pass 2 — propagate to episode/player artwork.
  let episodesUpdated = 0
  let episodesUnmatched = 0
  for (let i = 0; i < episodesSnap.docs.length; i += BATCH_CHUNK_SIZE) {
    const chunk = episodesSnap.docs.slice(i, i + BATCH_CHUNK_SIZE)
    const batch = writeBatch(db)
    let opsInBatch = 0
    chunk.forEach((d) => {
      const image = imageByScholarId.get(d.data().scholarId)
      if (!image) {
        episodesUnmatched += 1
        return
      }
      if (d.data().thumbnail === image) return
      batch.update(d.ref, { thumbnail: image })
      episodesUpdated += 1
      opsInBatch += 1
    })
    if (opsInBatch > 0) await batch.commit()
    console.log(`Processed ${Math.min(i + BATCH_CHUNK_SIZE, episodesSnap.docs.length)}/${episodesSnap.docs.length} episodes…`)
  }
  console.log(`Episodes: ${episodesUpdated} updated, ${episodesUnmatched} with no scholar image to apply.`)

  process.exit(0)
}

main().catch((err) => {
  console.error('Applying speaker images failed:', err.message)
  process.exit(1)
})
