// One-time import: writes the scraped tamildawah.com catalogue
// (tamildawah_audio_v2.json at the repo root) into Firestore — creating
// any missing scholars/series/topics along the way and linking each
// episode to them, into the same 'episodes'/'scholars'/'series'/'topics'
// collections the admin CMS and public app already read/write.
//
// Usage:
//   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=••••• node scripts/seedTamilDawahEpisodes.js
//
// Requires an existing ADMIN-role user (src/admin/store/authStore.js checks
// users/{uid}.role === 'ADMIN') and the same VITE_FIREBASE_* env vars the
// app itself uses (loaded from .env via dotenv below). Idempotent/upsert:
// episodes are matched to existing Firestore docs by title — a new title
// creates a doc, a title that already exists gets only its changed fields
// updated — so it's safe to re-run after editing the source JSON.

import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  writeBatch,
  doc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore'
import { canonicalSpeakerName } from './lib/speakerNames.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_PATH = path.join(__dirname, '..', 'tamildawah_audio_v2.json')

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
}

// Firestore batched writes cap at 500 ops — chunk well under that.
const BATCH_CHUNK_SIZE = 400

// "31-07-2026" -> ms epoch, parsed manually instead of `new Date(str)` so
// it doesn't depend on the runtime's locale/engine date-parsing quirks.
function parseDDMMYYYY(str) {
  const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(str || '')
  if (!m) return null
  const [, day, month, year] = m
  return new Date(Number(year), Number(month) - 1, Number(day)).getTime()
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

  const records = JSON.parse(readFileSync(DATA_PATH, 'utf8'))
  if (!Array.isArray(records) || records.length === 0) {
    console.error(`No records found in ${DATA_PATH}`)
    process.exit(1)
  }

  const app = initializeApp(firebaseConfig)
  const auth = getAuth(app)
  const db = getFirestore(app)

  await signInWithEmailAndPassword(auth, email, password)

  const [scholarsSnap, seriesSnap, topicsSnap, episodesSnap] = await Promise.all([
    getDocs(collection(db, 'scholars')),
    getDocs(collection(db, 'series')),
    getDocs(collection(db, 'topics')),
    getDocs(collection(db, 'episodes')),
  ])

  const scholarsByName = new Map(scholarsSnap.docs.map((d) => [d.data().name, d.id]))
  const seriesByName = new Map(seriesSnap.docs.map((d) => [d.data().name, d.id]))
  const topicsByName = new Map(topicsSnap.docs.map((d) => [d.data().name, d.id]))
  const existingByTitle = new Map(episodesSnap.docs.map((d) => [d.data().title, d]))

  // Pass 0 — repair: an earlier run (before canonicalSpeakerName existed)
  // may have already created a duplicate scholar for a raw "<Name> Shorts"
  // byline or an alias source, and linked episodes to it. Merge any such
  // duplicate into the canonical scholar and re-point its episodes.
  const duplicateScholars = scholarsSnap.docs.filter((d) => canonicalSpeakerName(d.data().name) !== d.data().name)
  if (duplicateScholars.length > 0) {
    console.log(`Repairing ${duplicateScholars.length} duplicate scholar(s) from a prior run…`)
    for (const dup of duplicateScholars) {
      const canonicalName = canonicalSpeakerName(dup.data().name)
      let canonicalId = scholarsByName.get(canonicalName)
      if (!canonicalId) {
        const ref = await addDoc(collection(db, 'scholars'), {
          name: canonicalName,
          biography: '',
          status: 'ACTIVE',
          createdAt: Date.now(),
        })
        canonicalId = ref.id
        scholarsByName.set(canonicalName, canonicalId)
      }

      const mislinkedSnap = await getDocs(query(collection(db, 'episodes'), where('scholarId', '==', dup.id)))
      for (let i = 0; i < mislinkedSnap.docs.length; i += BATCH_CHUNK_SIZE) {
        const batch = writeBatch(db)
        mislinkedSnap.docs.slice(i, i + BATCH_CHUNK_SIZE).forEach((epDoc) => {
          batch.update(epDoc.ref, { scholarId: canonicalId, scholar: { name: canonicalName } })
        })
        await batch.commit()
      }

      await deleteDoc(dup.ref)
      scholarsByName.delete(dup.data().name)
      console.log(`  merged "${dup.data().name}" -> "${canonicalName}" (${mislinkedSnap.docs.length} episode(s) re-linked)`)
    }
  }

  // Pass 1 — create any missing scholars, series, topics referenced by the
  // import (episodes reference these by id, so they must exist first).
  const speakerNames = new Set(records.map((r) => canonicalSpeakerName(r.speaker)).filter(Boolean))
  const seriesNames = new Set(records.map((r) => r.series).filter(Boolean))
  const topicNames = new Set(records.flatMap((r) => r.topics || []).filter(Boolean))

  for (const name of speakerNames) {
    if (scholarsByName.has(name)) continue
    const ref = await addDoc(collection(db, 'scholars'), {
      name,
      biography: '',
      status: 'ACTIVE',
      createdAt: Date.now(),
    })
    scholarsByName.set(name, ref.id)
  }

  for (const name of topicNames) {
    if (topicsByName.has(name)) continue
    const ref = await addDoc(collection(db, 'topics'), { name, createdAt: Date.now() })
    topicsByName.set(name, ref.id)
  }

  for (const name of seriesNames) {
    if (seriesByName.has(name)) continue
    // A series belongs to whichever scholar's records reference it first.
    const owner = canonicalSpeakerName(records.find((r) => r.series === name)?.speaker)
    const ref = await addDoc(collection(db, 'series'), {
      name,
      scholarId: scholarsByName.get(owner) ?? null,
      createdAt: Date.now(),
    })
    seriesByName.set(name, ref.id)
  }

  console.log(`Scholars: ${scholarsByName.size}, Series: ${seriesByName.size}, Topics: ${topicsByName.size}`)

  // Pass 2 — upsert episodes: create any new title, update changed fields
  // on any title that already exists (so edits to the source JSON — a
  // fixed audioUrl, a re-tagged topic, a corrected series — propagate).
  function fieldsFor(r) {
    const speakerName = canonicalSpeakerName(r.speaker)
    return {
      scholarId: speakerName ? scholarsByName.get(speakerName) ?? null : null,
      scholar: { name: speakerName || null },
      seriesId: r.series ? seriesByName.get(r.series) ?? null : null,
      series: r.series ? { name: r.series } : null,
      topics: r.topics || [],
      description: r.description_tamil || '',
      location: r.location || '',
      sourceUrl: r.url || null,
      audioUrl: r.audio_url || null,
      createdAt: parseDDMMYYYY(r.date) ?? (r.published ? new Date(r.published).getTime() : Date.now()),
    }
  }

  function diff(next, existing) {
    const changed = {}
    for (const key of Object.keys(next)) {
      if (JSON.stringify(next[key]) !== JSON.stringify(existing[key])) changed[key] = next[key]
    }
    return changed
  }

  const withTitle = records.filter((r) => r.title)
  let created = 0
  let updated = 0
  let unchanged = 0

  for (let i = 0; i < withTitle.length; i += BATCH_CHUNK_SIZE) {
    const chunk = withTitle.slice(i, i + BATCH_CHUNK_SIZE)
    const batch = writeBatch(db)
    let opsInBatch = 0

    chunk.forEach((r) => {
      const existingDoc = existingByTitle.get(r.title)
      const next = fieldsFor(r)

      if (!existingDoc) {
        const ref = doc(collection(db, 'episodes'))
        batch.set(ref, {
          title: r.title,
          ...next,
          status: 'PUBLISHED',
          sourceType: 'IMPORT',
          youtubeId: null,
        })
        created += 1
        opsInBatch += 1
        return
      }

      const changed = diff(next, existingDoc.data())
      if (Object.keys(changed).length === 0) {
        unchanged += 1
        return
      }
      batch.update(existingDoc.ref, changed)
      updated += 1
      opsInBatch += 1
    })

    if (opsInBatch > 0) await batch.commit()
    console.log(`Processed ${Math.min(i + BATCH_CHUNK_SIZE, withTitle.length)}/${withTitle.length} episodes…`)
  }

  console.log(`Done. Created ${created}, updated ${updated}, unchanged ${unchanged}.`)
  process.exit(0)
}

main().catch((err) => {
  console.error('Seed failed:', err.message)
  process.exit(1)
})
