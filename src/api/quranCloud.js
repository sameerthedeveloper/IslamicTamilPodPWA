// al-quran-cloud client. Cache-first w/ localStorage TTL, retry+timeout,
// offline fallback to last-known-good cache per spec.
const BASE_URL = 'https://api.alquran.cloud/v1'
const CACHE_TTL = 86400 * 1000 // 24h
const API_TIMEOUT = 5000
const RETRY_ATTEMPTS = 3

function cacheKey(url) {
  return `qc:${url}`
}

function readCache(url) {
  try {
    const raw = localStorage.getItem(cacheKey(url))
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function writeCache(url, data) {
  try {
    localStorage.setItem(cacheKey(url), JSON.stringify({ data, ts: Date.now() }))
  } catch {
    // storage full/unavailable — cache is best-effort only
  }
}

async function fetchWithTimeout(url, ms) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), ms)
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } finally {
    clearTimeout(id)
  }
}

async function getJSON(url) {
  const cached = readCache(url)
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data

  let lastErr
  for (let attempt = 0; attempt < RETRY_ATTEMPTS; attempt++) {
    try {
      const json = await fetchWithTimeout(url, API_TIMEOUT)
      writeCache(url, json)
      return json
    } catch (err) {
      lastErr = err
    }
  }

  // offline / api down — fall back to stale cache if we have any
  if (cached) return cached.data
  throw lastErr
}

export async function getSurahList() {
  const json = await getJSON(`${BASE_URL}/surah`)
  return json.data.map((s) => ({
    id: s.number,
    nameEn: s.englishName,
    nameAr: s.name,
    ayatCount: s.numberOfAyahs,
    revelation: s.revelationType,
  }))
}

export async function getSurahWithTranslation(surahId, reciter = 'ar.alafasy') {
  const json = await getJSON(`${BASE_URL}/surah/${surahId}/editions/${reciter},en.asad`)
  const [arabicEd, translationEd] = json.data
  return {
    id: arabicEd.number,
    nameEn: arabicEd.englishName,
    nameAr: arabicEd.name,
    revelation: arabicEd.revelationType,
    ayahs: arabicEd.ayahs.map((a, i) => ({
      number: a.numberInSurah,
      text: a.text,
      translation: translationEd.ayahs[i]?.text ?? '',
      audioUrl: a.audio,
    })),
  }
}

export const RECITERS = [
  { id: 'ar.alafasy', label: 'Mishary Alafasy' },
  { id: 'ar.minshawi', label: 'Al-Minshawi' },
  { id: 'ar.abdulbasit', label: 'Abdul Basit' },
]

export const FALLBACK_RECITER = 'ar.alafasy'
