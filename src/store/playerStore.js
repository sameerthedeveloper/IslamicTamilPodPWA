import { create } from 'zustand'

export const usePlayerStore = create((set, get) => ({
  currentEpisode: null,
  isPlaying: false,
  queue: [],
  currentTime: 0,
  duration: 0,
  volume: 1,
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
    get().activeEngine()?.seek(time)
    set({ currentTime: time })
  },

  play: (episode) => {
    if (episode) {
      set({ currentEpisode: episode, isPlaying: true, currentTime: 0, duration: 0 })
    } else {
      set({ isPlaying: true })
    }
  },

  pause: () => set({ isPlaying: false }),

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  next: () => {
    const { queue, currentEpisode } = get()
    if (!queue.length || !currentEpisode) return
    const idx = queue.findIndex((e) => e.id === currentEpisode.id)
    const nextEp = queue[idx + 1]
    if (nextEp) set({ currentEpisode: nextEp, isPlaying: true, currentTime: 0, duration: 0 })
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
}))
