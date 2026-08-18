import { useEffect, useState } from 'react'
import { BookX, Trash2, Play } from 'lucide-react'
import { getBookmarks, getHistory, removeBookmark } from '../api/client'
import { usePlayerStore } from '../store/playerStore'
import { useUserStore } from '../store/userStore'

function formatDuration(sec) {
  if (!sec) return null
  const m = Math.round(sec / 60)
  if (m < 60) return `${m} min`
  return `${Math.floor(m / 60)}h ${m % 60}m`
}

function toEpisode(item, showProgress) {
  return {
    id: item.episodeId ?? item.id,
    title: item.title,
    thumbnail: item.thumbnail,
    scholar: { name: item.scholarName },
    youtubeId: item.youtubeId,
    audioUrl: item.audioUrl,
    currentTime: showProgress ? item.currentTime : 0,
    duration: item.duration,
  }
}

function LibraryRow({ item, onRemove, showProgress, queue }) {
  const play = usePlayerStore((s) => s.play)
  const pct = showProgress && item.duration ? Math.min(100, ((item.currentTime ?? 0) / item.duration) * 100) : 0
  const episode = toEpisode(item, showProgress)

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <button
        onClick={() => play(episode, queue?.map((i) => toEpisode(i, showProgress)))}
        aria-label="Play"
        className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl text-white"
        style={{ background: 'linear-gradient(155deg, var(--accent), #0B5C55)' }}
      >
        {item.thumbnail ? (
          <img src={item.thumbnail} alt="" className="h-full w-full object-cover" />
        ) : (
          <Play size={18} fill="white" />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-gray-900">{item.title ?? 'Untitled'}</p>
        {item.scholarName && <p className="truncate text-xs text-gray-500">{item.scholarName}</p>}
        {showProgress && item.duration ? (
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--accent)' }} />
            </div>
            <span className="shrink-0 text-[11px]" style={{ color: 'var(--muted)' }}>{Math.round(pct)}%</span>
          </div>
        ) : (
          formatDuration(item.duration) && (
            <p className="mt-0.5 text-[11px]" style={{ color: 'var(--muted)' }}>{formatDuration(item.duration)}</p>
          )
        )}
      </div>

      {onRemove && (
        <button
          onClick={() => onRemove(item)}
          aria-label="Remove bookmark"
          className="shrink-0 rounded-full p-2 text-gray-400 transition hover:bg-red-50 hover:text-[var(--danger)]"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  )
}

function LibraryPage() {
  const [bookmarks, setBookmarks] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const authStatus = useUserStore((s) => s.status)

  useEffect(() => {
    if (authStatus !== 'ready') return
    setLoading(true)
    Promise.all([
      getBookmarks().catch(() => []),
      getHistory().catch(() => []),
    ])
      .then(([bm, hist]) => {
        setBookmarks(bm)
        setHistory(hist)
      })
      .finally(() => setLoading(false))
  }, [authStatus])

  const handleRemove = async (item) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== item.id))
    await removeBookmark(item.episodeId ?? item.id).catch(() => {})
  }

  const isEmpty = !loading && bookmarks.length === 0 && history.length === 0

  return (
    <div className="px-5 pt-6">

      <h1 className="font-display text-3xl font-semibold tracking-tight text-gray-900">
        Library
      </h1>

      <p className="mt-2 text-gray-500">
        Your saved Islamic content.
      </p>

      {loading && (
        <div className="mt-8 flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-[76px] rounded-2xl" />
          ))}
        </div>
      )}

      {isEmpty && (
        <div className="mt-8 flex flex-col items-center rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center animate-rise-in">

          <div
            className="flex h-14 w-14 items-center justify-center rounded-full"
            style={{ background: 'var(--accent-soft)' }}
          >
            <BookX size={24} style={{ color: 'var(--accent)' }} />
          </div>

          <p className="font-display mt-4 text-lg font-semibold text-gray-900">
            Your Library is Empty
          </p>

          <p className="mt-1 max-w-[240px] text-sm text-gray-500">
            Save lectures and podcasts to find them here.
          </p>

        </div>
      )}

      {!loading && bookmarks.length > 0 && (
        <div className="mt-8 animate-rise-in">
          <h2 className="font-display text-lg font-semibold text-gray-900">
            Bookmarks <span className="font-sans text-sm font-normal text-gray-400">({bookmarks.length})</span>
          </h2>
          <div className="mt-4 flex flex-col gap-2">
            {bookmarks.map((b) => (
              <LibraryRow key={b.id} item={b} onRemove={handleRemove} queue={bookmarks} />
            ))}
          </div>
        </div>
      )}

      {!loading && history.length > 0 && (
        <div className="mt-8 animate-rise-in">
          <h2 className="font-display text-lg font-semibold text-gray-900">
            Recently Played
          </h2>
          <div className="mt-4 flex flex-col gap-2">
            {history.map((h) => (
              <LibraryRow key={h.id} item={h} showProgress queue={history} />
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

export default LibraryPage
