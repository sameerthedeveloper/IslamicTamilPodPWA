import { create } from 'zustand'
import { getBookmarks, addBookmark, removeBookmark } from '../api/client'
import { queryClient } from '../queryClient'

export const useBookmarkStore = create((set, get) => ({
  ids: new Set(),
  loaded: false,

  load: async () => {
    const bookmarks = await getBookmarks().catch(() => [])
    set({ ids: new Set(bookmarks.map((b) => String(b.episodeId ?? b.id))), loaded: true })
  },

  isBookmarked: (episodeId) => get().ids.has(String(episodeId)),

  toggle: async (episode) => {
    const id = String(episode.id)
    const bookmarked = get().ids.has(id)
    // Optimistic — flip locally first, then reconcile with Firestore.
    set((state) => {
      const next = new Set(state.ids)
      bookmarked ? next.delete(id) : next.add(id)
      return { ids: next }
    })
    try {
      if (bookmarked) await removeBookmark(id)
      else await addBookmark(episode)
      // LibraryPage's ['bookmarks', uid] query cache doesn't know a
      // bookmark changed here (this store, not that page, owns the write)
      // — invalidate it so Library shows the change next time it's
      // visited instead of the stale pre-toggle list.
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
    } catch {
      set((state) => {
        const next = new Set(state.ids)
        bookmarked ? next.add(id) : next.delete(id)
        return { ids: next }
      })
    }
  },
}))
