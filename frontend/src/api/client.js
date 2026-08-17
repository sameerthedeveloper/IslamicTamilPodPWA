import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

export const api = axios.create({ baseURL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export async function getEpisodes(page, limit) {
  // Backend @Query('limit')/@Query('page') aren't coerced to numbers
  // when passed explicitly (Prisma `take`/`skip` then reject strings),
  // so omit them to fall through to the service's numeric defaults.
  const params = {}
  if (page) params.page = page
  if (limit) params.limit = limit
  const { data } = await api.get('/episodes', { params })
  return data
}

export async function getEpisode(id) {
  const { data } = await api.get(`/episodes/${id}`)
  return data
}

export async function getScholars() {
  const { data } = await api.get('/scholars')
  return data
}

export async function getScholar(slug) {
  const { data } = await api.get(`/scholars/${slug}`)
  return data
}

export async function getTopics() {
  const { data } = await api.get('/topics')
  return data
}

export async function getSeries(page = 1, limit = 20) {
  const { data } = await api.get('/series', { params: { page, limit } })
  return data
}

export async function search(q, type) {
  const { data } = await api.get('/search', { params: { q, type } })
  return data
}

export async function getHome(userId) {
  const { data } = await api.get('/home', { params: userId ? { userId } : {} })
  return data
}

export async function getBookmarks() {
  const { data } = await api.get('/me/bookmarks')
  return data
}

export async function getHistory(limit = 20) {
  const { data } = await api.get('/me/history', { params: { limit } })
  return data
}

// Stub — no /quran endpoint on backend yet. Shape matches Episode fields.
export async function getQuranRecitations() {
  return [
    { id: 'q1', title: 'Al-Fathiha', scholar: { name: 'The Beginning' }, thumbnail: null },
    { id: 'q2', title: 'Al-Baqarah', scholar: { name: 'The Cow' }, thumbnail: null },
  ]
}
