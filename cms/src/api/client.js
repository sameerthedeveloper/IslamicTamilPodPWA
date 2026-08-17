import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

export const api = axios.create({ baseURL })

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(err)
  },
)

export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password })
  return data
}

// Episodes — full CRUD (backend supports it)
export const episodesApi = {
  // /episodes/admin returns all statuses (not just PUBLISHED, unlike the public /episodes list)
  list: (page = 1, limit = 50) => api.get('/episodes/admin', { params: { page, limit } }).then((r) => r.data),
  get: (id) => api.get(`/episodes/${id}`).then((r) => r.data),
  create: (data) => api.post('/episodes/admin', data).then((r) => r.data),
  update: (id, data) => api.patch(`/episodes/admin/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/episodes/admin/${id}`).then((r) => r.data),
}

// Scholars — create/list/update/delete
export const scholarsApi = {
  list: () => api.get('/scholars/admin').then((r) => r.data),
  create: (data) => api.post('/scholars/admin', data).then((r) => r.data),
  update: (id, data) => api.patch(`/scholars/admin/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/scholars/admin/${id}`).then((r) => r.data),
}

// Series — create/list/update/delete
export const seriesApi = {
  list: (page = 1, limit = 50) => api.get('/series/admin', { params: { page, limit } }).then((r) => r.data),
  create: (data) => api.post('/series/admin', data).then((r) => r.data),
  update: (id, data) => api.patch(`/series/admin/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/series/admin/${id}`).then((r) => r.data),
}

// Topics — create/list only (no backend edit/delete yet)
export const topicsApi = {
  list: () => api.get('/topics').then((r) => r.data),
  create: (data) => api.post('/topics/admin', data).then((r) => r.data),
}

export const audioApi = {
  upload: (episodeId, file, onProgress) => {
    const form = new FormData()
    form.append('episodeId', episodeId)
    form.append('file', file)
    return api
      .post('/audio/admin/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => onProgress?.(Math.round((e.loaded / e.total) * 100)),
      })
      .then((r) => r.data)
  },
}

export const rightsApi = {
  list: () => api.get('/admin/rights').then((r) => r.data),
  create: (data) => api.post('/admin/rights', data).then((r) => r.data),
  update: (id, data) => api.patch(`/admin/rights/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/admin/rights/${id}`).then((r) => r.data),
}

export const featuredApi = {
  list: () => api.get('/admin/featured').then((r) => r.data),
  create: (data) => api.post('/admin/featured', data).then((r) => r.data),
  update: (id, data) => api.patch(`/admin/featured/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/admin/featured/${id}`).then((r) => r.data),
}

export const settingsApi = {
  get: () => api.get('/admin/settings').then((r) => r.data),
  update: (data) => api.patch('/admin/settings', data).then((r) => r.data),
}

export const statsApi = {
  get: () => api.get('/admin/stats').then((r) => r.data),
}

export const usersApi = {
  list: () => api.get('/admin/users').then((r) => r.data),
}
