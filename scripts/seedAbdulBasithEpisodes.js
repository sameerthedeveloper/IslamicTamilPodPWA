// One-time seed script: writes the 27 Abdul Basith mp3 episodes (from
// media.blubrry.com / tamildawah.com) into the same 'episodes' Firestore
// collection the admin CMS and public app already read/write — so they
// show up in the existing player, not a separate hardcoded list.
//
// Usage:
//   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=••••• node scripts/seedAbdulBasithEpisodes.js
//
// Requires an existing ADMIN-role user (src/admin/store/authStore.js checks
// users/{uid}.role === 'ADMIN') and the same VITE_FIREBASE_* env vars the
// app itself uses (loaded from .env via dotenv below). Idempotent: skips
// any title that already exists in the collection, so it's safe to re-run.

import 'dotenv/config'
import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
}

const SCHOLAR_NAME = 'Abdul Basith'

const MONTHS = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
}

// "13 Mar 2025" -> ms epoch, parsed manually instead of `new Date(str)` so
// it doesn't depend on the runtime's locale/engine date-parsing quirks.
function parseDDMonYYYY(str) {
  const [day, mon, year] = str.split(' ')
  const month = MONTHS[mon]
  if (month === undefined) throw new Error(`Unrecognized month in date: "${str}"`)
  return new Date(Number(year), month, Number(day)).getTime()
}

const PODCASTS = [
  { title: 'Powers of Allah', date: '13 Mar 2025', url: 'https://media.blubrry.com/tamil_dawah/audio1.tamildawah.com/abdul-basith/abdul-basith-powers-allah-13-03-2025.mp3' },
  { title: 'Allah Loves - Part 23', date: '09 Aug 2024', url: 'https://media.blubrry.com/tamil_dawah/audio1.tamildawah.com/abdul-basith/abdul-basith-allah-loves-part-23-09-08-2024.mp3' },
  { title: 'Allah Loves - Part 22', date: '09 Aug 2024', url: 'https://media.blubrry.com/tamil_dawah/audio1.tamildawah.com/abdul-basith/abdul-basith-allah-loves-part-22-09-08-2024.mp3' },
  { title: 'Allah Loves - Part 21', date: '09 Aug 2024', url: 'https://media.blubrry.com/tamil_dawah/audio1.tamildawah.com/abdul-basith/abdul-basith-allah-loves-part-21-09-08-2024.mp3' },
  { title: 'Allah Loves - Part 20', date: '08 Aug 2024', url: 'https://media.blubrry.com/tamil_dawah/audio1.tamildawah.com/abdul-basith/abdul-basith-allah-loves-part-20-09-08-2024.mp3' },
  { title: 'Allah Loves - Part 19', date: '08 Aug 2024', url: 'https://media.blubrry.com/tamil_dawah/audio1.tamildawah.com/abdul-basith/abdul-basith-allah-loves-part-19-09-08-2024.mp3' },
  { title: 'Allah Loves - Part 18', date: '08 Aug 2024', url: 'https://media.blubrry.com/tamil_dawah/audio1.tamildawah.com/abdul-basith/abdul-basith-allah-loves-part-18-09-08-2024.mp3' },
  { title: 'Allah Loves - Part 17', date: '08 Aug 2024', url: 'https://media.blubrry.com/tamil_dawah/audio1.tamildawah.com/abdul-basith/abdul-basith-allah-loves-part-17-09-08-2024.mp3' },
  { title: 'Allah Loves - Part 16', date: '08 Aug 2024', url: 'https://media.blubrry.com/tamil_dawah/audio1.tamildawah.com/abdul-basith/abdul-basith-allah-loves-part-16-09-08-2024.mp3' },
  { title: 'Allah Loves - Part 15', date: '08 Aug 2024', url: 'https://media.blubrry.com/tamil_dawah/audio1.tamildawah.com/abdul-basith/abdul-basith-allah-loves-part-15-08-08-2024.mp3' },
  { title: 'Allah Loves - Part 14', date: '08 Aug 2024', url: 'https://media.blubrry.com/tamil_dawah/audio1.tamildawah.com/abdul-basith/abdul-basith-allah-loves-part-14-08-08-2024.mp3' },
  { title: 'Allah Loves - Part 13', date: '08 Aug 2024', url: 'https://media.blubrry.com/tamil_dawah/audio1.tamildawah.com/abdul-basith/abdul-basith-allah-loves-part-13-08-08-2024.mp3' },
  { title: 'Allah Loves - Part 12', date: '08 Aug 2024', url: 'https://media.blubrry.com/tamil_dawah/audio1.tamildawah.com/abdul-basith/abdul-basith-allah-loves-part-12-08-08-2024.mp3' },
  { title: 'Allah Loves - Part 11', date: '08 Aug 2024', url: 'https://media.blubrry.com/tamil_dawah/audio1.tamildawah.com/abdul-basith/abdul-basith-allah-loves-part-11-08-08-2024.mp3' },
  { title: 'Allah Loves - Part 10', date: '07 Aug 2024', url: 'https://media.blubrry.com/tamil_dawah/audio1.tamildawah.com/abdul-basith/abdul-basith-allah-loves-part-10-07-08-2024.mp3' },
  { title: 'Allah Loves - Part 9', date: '07 Aug 2024', url: 'https://media.blubrry.com/tamil_dawah/audio1.tamildawah.com/abdul-basith/abdul-basith-allah-loves-part-9-07-08-2024.mp3' },
  { title: 'Allah Loves - Part 8', date: '07 Aug 2024', url: 'https://media.blubrry.com/tamil_dawah/audio1.tamildawah.com/abdul-basith/abdul-basith-allah-loves-part-8-07-08-2024.mp3' },
  { title: 'Allah Loves - Part 7', date: '07 Aug 2024', url: 'https://media.blubrry.com/tamil_dawah/audio1.tamildawah.com/abdul-basith/abdul-basith-allah-loves-part-7-07-08-2024.mp3' },
  { title: 'Allah Loves - Part 6', date: '07 Aug 2024', url: 'https://media.blubrry.com/tamil_dawah/audio1.tamildawah.com/abdul-basith/abdul-basith-allah-loves-part-6-07-08-2024.mp3' },
  { title: 'Allah Loves - Part 5', date: '07 Aug 2024', url: 'https://media.blubrry.com/tamil_dawah/audio1.tamildawah.com/abdul-basith/abdul-basith-allah-loves-part-5-07-08-2024.mp3' },
  { title: 'Allah Loves - Part 4', date: '07 Aug 2024', url: 'https://media.blubrry.com/tamil_dawah/audio1.tamildawah.com/abdul-basith/abdul-basith-allah-loves-part-4-07-08-2024.mp3' },
  { title: 'Allah Loves - Part 3', date: '06 Aug 2024', url: 'https://media.blubrry.com/tamil_dawah/audio1.tamildawah.com/abdul-basith/abdul-basith-allah-loves-part-3-06-08-2024.mp3' },
  { title: 'Allah Loves - Part 2', date: '06 Aug 2024', url: 'https://media.blubrry.com/tamil_dawah/audio1.tamildawah.com/abdul-basith/abdul-basith-allah-loves-part-2-06-08-2024.mp3' },
  { title: 'Allah Loves - Part 1', date: '06 Aug 2024', url: 'https://media.blubrry.com/tamil_dawah/audio1.tamildawah.com/abdul-basith/abdul-basith-allah-loves-part-1-06-08-2024.mp3' },
  { title: 'Question for You', date: '04 Oct 2022', url: 'https://media.blubrry.com/tamil_dawah/audio1.tamildawah.com/abdul-basith/abdul-basith-question-you-04-10-2022.mp3' },
  { title: 'Towards Knowledge', date: '01 Aug 2015', url: 'http://media.blubrry.com/tamil_dawah/audio1.tamildawah.com/abdul-basith/abdul-basith-towards-knowledge-01-08-2015.mp3' },
]

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

  const app = initializeApp(firebaseConfig)
  const auth = getAuth(app)
  const db = getFirestore(app)

  await signInWithEmailAndPassword(auth, email, password)

  const existingSnap = await getDocs(collection(db, 'episodes'))
  const existingTitles = new Set(existingSnap.docs.map((d) => d.data().title))

  let created = 0
  let skipped = 0

  for (const p of PODCASTS) {
    if (existingTitles.has(p.title)) {
      skipped += 1
      continue
    }
    await addDoc(collection(db, 'episodes'), {
      title: p.title,
      scholarId: null,
      scholar: { name: SCHOLAR_NAME },
      series: null,
      topics: [],
      status: 'PUBLISHED',
      sourceType: 'UPLOAD',
      youtubeId: null,
      audioUrl: p.url,
      createdAt: parseDDMonYYYY(p.date),
    })
    created += 1
  }

  console.log(`Done. Created ${created}, skipped ${skipped} (already existed).`)
  process.exit(0)
}

main().catch((err) => {
  console.error('Seed failed:', err.message)
  process.exit(1)
})
