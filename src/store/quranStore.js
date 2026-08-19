import { create } from 'zustand'
import { getSurahWithTranslation, FALLBACK_RECITER } from '../api/quranCloud'
import { usePlayerStore } from './playerStore'
import { useActivePlayerStore } from './activePlayerStore'

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

// Single source of truth for Quran playback — shared by the in-page
// reader, the app-wide mini player, and the full player sheet, the same
// way playerStore backs episode playback across MiniPlayer/FullPlayerSheet.
export const useQuranStore = create((set, get) => ({
  currentSurah: null, // { id, nameEn, nameAr, ayatCount, revelation }
  surahData: null, // { ayahs: [...] } once loaded
  surahLoading: false,
  surahError: false,
  currentAyah: 1,
  isPlaying: false,
  isPlayerOpen: false,
  playbackSpeed: 1.0,
  reciter: FALLBACK_RECITER,

  bookmark: readLS(LS_BOOKMARK, null),
  favorites: readLS(LS_FAVORITES, []),
  history: readLS(LS_HISTORY, []),

  // Opens (or switches to) a surah and starts loading its ayahs. Pauses
  // any episode playback so the two audio sources never overlap.
  openSurah: (surahMeta, jumpAyah) => {
    usePlayerStore.getState().pause()
    usePlayerStore.getState().closePlayer()
    useActivePlayerStore.setState({ active: 'quran' })
    const requestId = Symbol('surah-load')
    set({
      currentSurah: surahMeta,
      currentAyah: jumpAyah || 1,
      isPlaying: false,
      surahData: null,
      surahLoading: true,
      surahError: false,
      _requestId: requestId,
    })
    getSurahWithTranslation(surahMeta.id, get().reciter)
      .then((data) => {
        if (get()._requestId !== requestId) return
        set({ surahData: data, surahLoading: false })
      })
      .catch(() => {
        if (get()._requestId !== requestId) return
        set({ surahLoading: false, surahError: true })
      })
  },

  closeSurah: () => set({ currentSurah: null, surahData: null, isPlaying: false, isPlayerOpen: false }),

  openPlayer: () => {
    // Only one full-screen player sheet can be open at a time.
    usePlayerStore.getState().closePlayer()
    set((state) => (state.currentSurah ? { isPlayerOpen: true } : state))
  },
  closePlayer: () => set({ isPlayerOpen: false }),

  setAyah: (ayahId) => {
    set({ currentAyah: ayahId })
    const { currentSurah } = get()
    if (currentSurah) get().setBookmark(currentSurah.id, ayahId)
  },

  // Tapping a verse in the list jumps to it and starts reciting it.
  playAyah: (ayahId) => {
    get().setAyah(ayahId)
    get().play()
  },

  play: () => {
    usePlayerStore.getState().pause()
    usePlayerStore.getState().closePlayer()
    useActivePlayerStore.setState({ active: 'quran' })
    set({ isPlaying: true })
  },
  pause: () => set({ isPlaying: false }),
  togglePlay: () => (get().isPlaying ? get().pause() : get().play()),

  nextAyah: () => {
    const { surahData, currentAyah } = get()
    if (!surahData) return
    const idx = surahData.ayahs.findIndex((a) => a.number === currentAyah)
    const next = surahData.ayahs[idx + 1]
    if (next) get().setAyah(next.number)
  },
  prevAyah: () => {
    const { surahData, currentAyah } = get()
    if (!surahData) return
    const idx = surahData.ayahs.findIndex((a) => a.number === currentAyah)
    const prev = surahData.ayahs[idx - 1]
    if (prev) get().setAyah(prev.number)
  },

  // Advances to the next ayah, or stops at the end of the surah.
  onAyahEnded: () => {
    const { surahData, currentAyah } = get()
    if (!surahData) return
    const idx = surahData.ayahs.findIndex((a) => a.number === currentAyah)
    const next = surahData.ayahs[idx + 1]
    if (next) get().setAyah(next.number)
    else set({ isPlaying: false })
  },

  setSpeed: (playbackSpeed) => set({ playbackSpeed }),
  setReciter: (reciter) => {
    set({ reciter })
    const { currentSurah, currentAyah } = get()
    if (currentSurah) get().openSurah(currentSurah, currentAyah)
  },

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

// Episode playback (playerStore) pausing Quran playback in return, so
// starting an episode from anywhere in the app stops Quran audio too —
// and closes its full-screen sheet, so the two full players can never be
// open (and rendered fullscreen, stacked) at the same time.
usePlayerStore.subscribe((state, prev) => {
  if (state.isPlaying && !prev.isPlaying) {
    useQuranStore.getState().pause()
    useQuranStore.getState().closePlayer()
  }
  // Opening the episode full-player sheet (even without a fresh play())
  // should collapse the Quran one so they're never both fullscreen.
  if (state.isPlayerOpen && !prev.isPlayerOpen) {
    useQuranStore.getState().closePlayer()
  }
})
