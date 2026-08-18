import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore'
import { auth, db } from '../firebase'

function withId(snap) {
  return { id: snap.id, ...snap.data() }
}

async function publishedEpisodes() {
  const snap = await getDocs(
    query(collection(db, 'episodes'), where('status', '==', 'PUBLISHED'), orderBy('createdAt', 'desc')),
  )
  return snap.docs.map(withId)
}

export async function getEpisodes(page, limit) {
  const all = await publishedEpisodes()
  const p = page || 1
  const l = limit || all.length
  const start = (p - 1) * l
  return { data: all.slice(start, start + l), total: all.length }
}

export async function getEpisode(id) {
  const snap = await getDoc(doc(db, 'episodes', id))
  return snap.exists() ? withId(snap) : null
}

export async function getScholars() {
  const snap = await getDocs(query(collection(db, 'scholars'), orderBy('name')))
  return snap.docs.map(withId)
}

export async function getScholar(slug) {
  const snap = await getDocs(query(collection(db, 'scholars'), where('slug', '==', slug)))
  return snap.docs[0] ? withId(snap.docs[0]) : null
}

export async function getTopics() {
  const snap = await getDocs(query(collection(db, 'topics'), orderBy('name')))
  return snap.docs.map(withId)
}

export async function getSeries(page = 1, limit = 20) {
  const snap = await getDocs(query(collection(db, 'series'), orderBy('createdAt', 'desc')))
  const all = snap.docs.map(withId)
  const start = (page - 1) * limit
  return { data: all.slice(start, start + limit), total: all.length }
}

// Firestore has no full-text search; do a simple client-side title match
// across the public collections instead.
export async function search(q, type) {
  if (!q?.trim()) return []
  const needle = q.trim().toLowerCase()
  const collections = type ? [type] : ['episodes', 'scholars', 'series']
  const results = await Promise.all(
    collections.map(async (name) => {
      const snap = await getDocs(collection(db, name))
      return snap.docs
        .map(withId)
        .filter((item) => (item.title || item.name || '').toLowerCase().includes(needle))
    }),
  )
  return results.flat()
}

export async function getHome() {
  const episodes = await publishedEpisodes()
  return { continueListening: episodes.slice(0, 10), discover: [...episodes].reverse().slice(0, 10) }
}

export async function getBookmarks() {
  const user = auth.currentUser
  if (!user) return []
  const snap = await getDocs(collection(db, 'users', user.uid, 'bookmarks'))
  return snap.docs.map(withId)
}

export async function getHistory(limit = 20) {
  const user = auth.currentUser
  if (!user) return []
  const snap = await getDocs(query(collection(db, 'users', user.uid, 'history'), orderBy('playedAt', 'desc')))
  return snap.docs.map(withId).slice(0, limit)
}

// Stub — no Quran collection yet. Shape matches Episode fields.
export async function getQuranRecitations() {
  return [
    { id: 'q1', title: 'Al-Fathiha', scholar: { name: 'The Beginning' }, thumbnail: null },
    { id: 'q2', title: 'Al-Baqarah', scholar: { name: 'The Cow' }, thumbnail: null },
  ]
}
