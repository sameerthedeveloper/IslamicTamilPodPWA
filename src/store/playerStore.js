import { create } from 'zustand'
import { useActivePlayerStore } from './activePlayerStore'

export const usePlayerStore = create((set, get) => ({
  currentEpisode: null,
  isPlaying: false,
  queue: [],
  currentTime: 0,
  duration: 0,
  volume: 1,
  playbackRate: 1,
  sleepTimerMinutes: null,
  isPlayerOpen: false,
  engines: { audio: null, youtube: null },

  setQueue: (queue) => set({ queue }),

  openPlayer: () => set((state) => (state.currentEpisode ? { isPlayerOpen: true } : state)),
  closePlayer: () => set({ isPlayerOpen: false }),

  registerEngine: (type, engine) => set((state) => ({ engines: { ...state.engines, [type]: engine } })),

  activeEngine: () => {
    const { currentEpisode, engines } = get()
    return currentEpisode?.youtubeId ? engines.youtube : engines.audio
  },

  seek: (time) => {
    const clamped = Math.max(0, Math.min(time, get().duration || time))
    get().activeEngine()?.seek(clamped)
    set({ currentTime: clamped })
  },

  skipBy: (deltaSeconds) => {
    get().seek(get().currentTime + deltaSeconds)
  },

  play: (episode, list) => {
    useActivePlayerStore.setState({ active: 'episode' })
    if (episode) {
      set({
        currentEpisode: episode,
        isPlaying: true,
        currentTime: episode.currentTime || 0,
        duration: 0,
        ...(list && { queue: list }),
      })
    } else {
      set({ isPlaying: true })
    }
  },

  pause: () => set({ isPlaying: false }),

  // For the underlying <audio>/YouTube element telling us its state
  // changed on its own (OS paused it on lock, then let it resume, etc.)
  // — distinct from pause()/togglePlay(), which are the user pressing a
  // button. Keeps the store truthful instead of lying about what's
  // actually audible.
  setPlaying: (playing) => set({ isPlaying: playing }),

  togglePlay: () => set((state) => {
    if (!state.isPlaying) useActivePlayerStore.setState({ active: 'episode' })
    return { isPlaying: !state.isPlaying }
  }),

  next: () => {
    const { queue, currentEpisode } = get()
    if (!queue.length || !currentEpisode) return
    const idx = queue.findIndex((e) => e.id === currentEpisode.id)
    const nextEp = queue[idx + 1]
    if (nextEp) set({ currentEpisode: nextEp, isPlaying: true, currentTime: 0, duration: 0 })
  },

  // Called when the active track finishes — advance the queue, or if this
  // was the last (or only) track, stop and close the player entirely.
  onEnded: () => {
    const { queue, currentEpisode } = get()
    const idx = queue.findIndex((e) => e.id === currentEpisode?.id)
    const nextEp = queue[idx + 1]
    if (nextEp) {
      set({ currentEpisode: nextEp, isPlaying: true, currentTime: 0, duration: 0 })
    } else {
      set({ currentEpisode: null, isPlaying: false, isPlayerOpen: false, currentTime: 0, duration: 0 })
    }
  },

  prev: () => {
    const { queue, currentEpisode } = get()
    if (!queue.length || !currentEpisode) return
    const idx = queue.findIndex((e) => e.id === currentEpisode.id)
    const prevEp = queue[idx - 1]
    if (prevEp) set({ currentEpisode: prevEp, isPlaying: true, currentTime: 0, duration: 0 })
  },

  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume }),
  setPlaybackRate: (playbackRate) => set({ playbackRate }),

  // Stops playback once the timer elapses. Passing null cancels an active
  // timer. Stores the chosen duration (not a live countdown) so the UI
  // never needs to read the clock during render.
  setSleepTimer: (minutes) => {
    const state = get()
    clearTimeout(state._sleepTimeoutId)
    if (!minutes) {
      set({ sleepTimerMinutes: null, _sleepTimeoutId: null })
      return
    }
    const id = setTimeout(() => {
      set({ isPlaying: false, sleepTimerMinutes: null, _sleepTimeoutId: null })
    }, minutes * 60000)
    set({ sleepTimerMinutes: minutes, _sleepTimeoutId: id })
  },
}))
