import { create } from 'zustand'
import { FALLBACK_RECITER } from '../api/quranCloud'

const LS_BOOKMARK = 'quran:bookmark'
const LS_FAVORITES = 'quran:favorites'
const LS_HISTORY = 'quran:history'

function readLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeLS(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // best-effort — quota exceeded or storage disabled
  }
}

function sameRef(a, b) {
  return a.surahId === b.surahId && a.ayahId === b.ayahId
}

export const useQuranStore = create((set, get) => ({
  currentSurah: null, // { id, nameEn, nameAr, ayatCount, revelation }
  currentAyah: 1,
  isPlaying: false,
  playbackSpeed: 1.0,
  reciter: FALLBACK_RECITER,

  bookmark: readLS(LS_BOOKMARK, null),
  favorites: readLS(LS_FAVORITES, []),
  history: readLS(LS_HISTORY, []),

  setSurah: (surah) => set({ currentSurah: surah, currentAyah: 1, isPlaying: false }),
  setAyah: (ayahId) => set({ currentAyah: ayahId }),
  setPlaying: (isPlaying) => set({ isPlaying }),
  setSpeed: (playbackSpeed) => set({ playbackSpeed }),
  setReciter: (reciter) => set({ reciter }),

  setBookmark: (surahId, ayahId) => {
    const bookmark = { surahId, ayahId, timestamp: new Date().toISOString() }
    writeLS(LS_BOOKMARK, bookmark)
    set({ bookmark })

    const history = [bookmark, ...get().history.filter((h) => !sameRef(h, bookmark))].slice(0, 50)
    writeLS(LS_HISTORY, history)
    set({ history })
  },

  toggleFavorite: (surahId, ayahId) => {
    const ref = { surahId, ayahId }
    const exists = get().favorites.some((f) => sameRef(f, ref))
    const favorites = exists
      ? get().favorites.filter((f) => !sameRef(f, ref))
      : [...get().favorites, ref]
    writeLS(LS_FAVORITES, favorites)
    set({ favorites })
  },

  isFavorite: (surahId, ayahId) => get().favorites.some((f) => sameRef(f, { surahId, ayahId })),
}))
