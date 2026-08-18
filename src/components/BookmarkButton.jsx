import { useEffect } from 'react'
import { Bookmark } from 'lucide-react'
import { useBookmarkStore } from '../store/bookmarkStore'

function BookmarkButton({ episode, size = 16, className = '' }) {
  const loaded = useBookmarkStore((s) => s.loaded)
  const load = useBookmarkStore((s) => s.load)
  const toggle = useBookmarkStore((s) => s.toggle)
  const bookmarked = useBookmarkStore((s) => s.isBookmarked(episode?.id))

  useEffect(() => {
    if (!loaded) load()
  }, [loaded])

  if (!episode?.id) return null

  return (
    <button
      onClick={(e) => { e.stopPropagation(); toggle(episode) }}
      aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
      aria-pressed={bookmarked}
      className={`flex items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition active:scale-90 ${className}`}
    >
      <Bookmark
        size={size}
        strokeWidth={2.5}
        style={{ color: 'var(--accent)' }}
        fill={bookmarked ? 'var(--accent)' : 'none'}
      />
    </button>
  )
}

export default BookmarkButton
