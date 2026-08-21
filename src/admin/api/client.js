import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  getCountFromServer,
  query,
  orderBy,
  writeBatch,
} from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../firebase'

function withId(snap) {
  return { id: snap.id, ...snap.data() }
}

async function listAll(name, sortField = 'createdAt') {
  const snap = await getDocs(query(collection(db, name), orderBy(sortField, 'desc')))
  return snap.docs.map(withId)
}

async function listPaged(name, page = 1, limit = 50, sortField = 'createdAt') {
  // Firestore doesn't offset-paginate cheaply; admin lists here are small
  // enough to fetch in full and slice client-side.
  const all = await listAll(name, sortField)
  const start = (page - 1) * limit
  return { data: all.slice(start, start + limit), total: all.length, page, limit }
}

async function createDoc(name, data) {
  const ref_ = await addDoc(collection(db, name), { ...data, createdAt: Date.now() })
  return { id: ref_.id, ...data }
}

async function updateDocById(name, id, data) {
  await updateDoc(doc(db, name, id), data)
  return { id, ...data }
}

async function removeDoc(name, id) {
  await deleteDoc(doc(db, name, id))
  return { id }
}

// Firestore batched writes cap at 500 ops — chunk well under that.
const BATCH_CHUNK_SIZE = 400

async function bulkUpdateDocs(name, ids, data) {
  for (let i = 0; i < ids.length; i += BATCH_CHUNK_SIZE) {
    const batch = writeBatch(db)
    ids.slice(i, i + BATCH_CHUNK_SIZE).forEach((id) => batch.update(doc(db, name, id), data))
    await batch.commit()
  }
}

// Episodes — full CRUD
export const episodesApi = {
  list: (page = 1, limit = 50) => listPaged('episodes', page, limit),
  get: async (id) => withId(await getDoc(doc(db, 'episodes', id))),
  create: (data) => createDoc('episodes', data),
  update: (id, data) => updateDocById('episodes', id, data),
  remove: (id) => removeDoc('episodes', id),
  // Applies the same field(s) to many episodes at once — e.g. assigning a
  // batch of imported/seeded episodes to a scholar or series in one go.
  bulkUpdate: (ids, data) => bulkUpdateDocs('episodes', ids, data),
}

// Scholars — create/list/update/delete
export const scholarsApi = {
  list: () => listAll('scholars', 'name'),
  create: (data) => createDoc('scholars', data),
  update: (id, data) => updateDocById('scholars', id, data),
  remove: (id) => removeDoc('scholars', id),
}

// Series — create/list/update/delete
export const seriesApi = {
  list: (page = 1, limit = 50) => listPaged('series', page, limit),
  create: (data) => createDoc('series', data),
  update: (id, data) => updateDocById('series', id, data),
  remove: (id) => removeDoc('series', id),
}

// Topics (shown in admin as "Categories") — full CRUD
export const topicsApi = {
  list: () => listAll('topics', 'name'),
  create: (data) => createDoc('topics', data),
  update: (id, data) => updateDocById('topics', id, data),
  remove: (id) => removeDoc('topics', id),
}

// Playlists — ordered lists of episodes, full CRUD
export const playlistsApi = {
  list: () => listAll('playlists', 'createdAt'),
  create: (data) => createDoc('playlists', data),
  update: (id, data) => updateDocById('playlists', id, data),
  remove: (id) => removeDoc('playlists', id),
}

// Audio — upload a file to Storage and store its URL on the episode doc
export const audioApi = {
  upload: (episodeId, file, onProgress) =>
    new Promise((resolve, reject) => {
      const path = `audio/${episodeId}/${Date.now()}-${file.name}`
      const storageRef = ref(storage, path)
      const task = uploadBytesResumable(storageRef, file)

      task.on(
        'state_changed',
        (snapshot) => {
          onProgress?.(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100))
        },
        reject,
        async () => {
          const url = await getDownloadURL(task.snapshot.ref)
          await updateDoc(doc(db, 'episodes', episodeId), {
            audioUrl: url,
            audioPath: path,
            status: 'READY',
          })
          resolve({ url })
        },
      )
    }),
}

export const rightsApi = {
  list: () => listAll('rights'),
  create: (data) => createDoc('rights', data),
  update: (id, data) => updateDocById('rights', id, data),
  remove: (id) => removeDoc('rights', id),
}

export const featuredApi = {
  list: () => listAll('featured', 'position'),
  create: async (data) => {
    const existing = await listAll('featured', 'position')
    const position = existing.length
    return createDoc('featured', { ...data, position })
  },
  update: (id, data) => updateDocById('featured', id, data),
  remove: (id) => removeDoc('featured', id),
}

export const settingsApi = {
  get: async () => {
    const snap = await getDoc(doc(db, 'settings', 'app'))
    return snap.exists() ? snap.data() : {}
  },
  update: async (data) => {
    // merge:true creates the singleton doc on first save, updates it after.
    await setDoc(doc(db, 'settings', 'app'), data, { merge: true })
    return data
  },
}

export const statsApi = {
  get: async () => {
    const [episodes, scholars, series, users] = await Promise.all([
      getCountFromServer(collection(db, 'episodes')),
      getCountFromServer(collection(db, 'scholars')),
      getCountFromServer(collection(db, 'series')),
      getCountFromServer(collection(db, 'users')),
    ])
    return {
      episodes: episodes.data().count,
      scholars: scholars.data().count,
      series: series.data().count,
      users: users.data().count,
    }
  },
}

export const usersApi = {
  list: () => listAll('users', 'name'),
}

// Bulk JSON import — writes many records into one collection at once
// (Settings page). Firestore batched writes cap at 500 ops, so chunk
// well under that.
const BULK_IMPORT_CHUNK_SIZE = 400

export const bulkImportApi = {
  collections: ['episodes', 'scholars', 'series', 'topics', 'rights', 'featured'],
  import: async (collectionName, records) => {
    if (!Array.isArray(records) || records.length === 0) {
      throw new Error('JSON must be a non-empty array of records.')
    }
    let count = 0
    for (let i = 0; i < records.length; i += BULK_IMPORT_CHUNK_SIZE) {
      const chunk = records.slice(i, i + BULK_IMPORT_CHUNK_SIZE)
      const batch = writeBatch(db)
      chunk.forEach((record) => {
        if (typeof record !== 'object' || record === null || Array.isArray(record)) {
          throw new Error(`Record ${count + 1} is not a JSON object.`)
        }
        const ref = doc(collection(db, collectionName))
        batch.set(ref, { ...record, createdAt: record.createdAt ?? Date.now() })
        count += 1
      })
      await batch.commit()
    }
    return { count }
  },
}
