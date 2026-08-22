import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { auth, db } from '../firebase'

function withId(snap) {
  return { id: snap.id, ...snap.data() }
}

// Episodes that share a series should read in the admin-set series order
// (Series page → "Reorder"), not recency — but the overall feed should
// still place each series where its most recent entry would land. Doing
// this as a client-side resort (rather than a Firestore orderBy) avoids
// needing a composite index for status+position+createdAt.
function orderWithinSeries(episodes) {
  const groupKey = (ep) => ep.seriesId || `_solo_${ep.id}`
  const groups = new Map()
  episodes.forEach((ep) => {
    const key = groupKey(ep)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(ep)
  })
  groups.forEach((group, key) => {
    if (key.startsWith('_solo_')) return
    group.sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
  })

  const seen = new Set()
  const result = []
  episodes.forEach((ep) => {
    const key = groupKey(ep)
    if (seen.has(key)) return
    seen.add(key)
    result.push(...groups.get(key))
  })
  return result
}

async function publishedEpisodes() {
  const snap = await getDocs(
    query(collection(db, 'episodes'), where('status', '==', 'PUBLISHED'), orderBy('createdAt', 'desc')),
  )
  return orderWithinSeries(snap.docs.map(withId))
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

export async function getScholarById(id) {
  const snap = await getDoc(doc(db, 'scholars', id))
  return snap.exists() ? withId(snap) : null
}

// Firestore has no OR queries across values without a composite index for
// this shape — filter client-side over the already-fetched published set.
export async function getEpisodesByScholarId(scholarId) {
  const all = await publishedEpisodes()
  return all.filter((ep) => ep.scholarId === scholarId)
}

export async function getTopics() {
  const snap = await getDocs(query(collection(db, 'topics'), orderBy('name')))
  return snap.docs.map(withId)
}

// Firestore has no OR queries across values without a composite index for
// this shape — filter client-side over the already-fetched published set.
export async function getEpisodesByTopic(topicName) {
  const all = await publishedEpisodes()
  return all.filter((ep) => ep.topics?.includes(topicName))
}

export async function getSeries(page = 1, limit = 20) {
  const snap = await getDocs(query(collection(db, 'series'), orderBy('createdAt', 'desc')))
  const all = snap.docs.map(withId)
  const start = (page - 1) * limit
  return { data: all.slice(start, start + limit), total: all.length }
}

// Firestore has no full-text search; do a simple client-side title match
// across the public collections instead. Each result is tagged with `type`
// so the UI can render/route it appropriately.
export async function search(q, type) {
  if (!q?.trim()) return []
  const needle = q.trim().toLowerCase()
  const collections = type ? [type] : ['episodes', 'scholars', 'series']
  const results = await Promise.all(
    collections.map(async (name) => {
      const items = name === 'episodes' ? await publishedEpisodes() : (await getDocs(collection(db, name))).docs.map(withId)
      return items
        .filter((item) => (item.title || item.name || '').toLowerCase().includes(needle))
        .map((item) => ({ ...item, type: name.slice(0, -1) }))
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
  const snap = await getDocs(query(collection(db, 'users', user.uid, 'bookmarks'), orderBy('savedAt', 'desc')))
  return snap.docs.map(withId)
}

export async function addBookmark(episode) {
  const uid = auth.currentUser?.uid
  if (!uid || !episode?.id) return
  await setDoc(doc(db, 'users', uid, 'bookmarks', String(episode.id)), {
    episodeId: episode.id,
    title: episode.title ?? null,
    thumbnail: episode.thumbnail ?? null,
    scholarName: episode.scholar?.name ?? null,
    youtubeId: episode.youtubeId ?? null,
    audioUrl: episode.audioAsset?.url ?? episode.audioUrl ?? null,
    duration: episode.duration ?? null,
    savedAt: serverTimestamp(),
  })
}

export async function removeBookmark(episodeId) {
  const uid = auth.currentUser?.uid
  if (!uid) return
  await deleteDoc(doc(db, 'users', uid, 'bookmarks', String(episodeId)))
}

export async function clearHistory() {
  const uid = auth.currentUser?.uid
  if (!uid) return
  const snap = await getDocs(collection(db, 'users', uid, 'history'))
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)))
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
