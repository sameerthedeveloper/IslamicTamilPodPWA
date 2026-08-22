import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookX, Trash2, Play, Search, X, History } from 'lucide-react'
import { getBookmarks, getHistory, removeBookmark, clearHistory } from '../api/client'
import { usePlayerStore } from '../store/playerStore'
import { useUserStore } from '../store/userStore'
import BookmarkButton from '../components/BookmarkButton'

function formatDuration(sec) {
  if (!sec) return null
  const m = Math.round(sec / 60)
  if (m < 60) return `${m} min`
  return `${Math.floor(m / 60)}h ${m % 60}m`
}

// Firestore Timestamp (has .toDate()) or already a plain Date/number —
// history rows come from serverTimestamp(), other callers might not.
function formatRelative(playedAt) {
  const date = playedAt?.toDate?.() ?? (playedAt ? new Date(playedAt) : null)
  if (!date) return null
  const seconds = Math.max(0, (Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short' }).format(date)
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
  const navigate = useNavigate()
  const play = usePlayerStore((s) => s.play)
  const pct = showProgress && item.duration ? Math.min(100, ((item.currentTime ?? 0) / item.duration) * 100) : 0
  const episode = toEpisode(item, showProgress)
  const playedAgo = showProgress ? formatRelative(item.playedAt) : null

  return (
    <div
      onClick={() => navigate(`/episode/${episode.id}`)}
      className="flex cursor-pointer items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <button
        onClick={(e) => { e.stopPropagation(); play(episode, queue?.map((i) => toEpisode(i, showProgress))) }}
        aria-label="Play"
        className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl text-white"
        style={{ background: 'linear-gradient(155deg, var(--accent), #0B5C55)' }}
      >
        {item.thumbnail ? (
          <img src={item.thumbnail} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
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
            {playedAgo && <span className="shrink-0 text-[11px]" style={{ color: 'var(--muted)' }}>· {playedAgo}</span>}
          </div>
        ) : (
          formatDuration(item.duration) && (
            <p className="mt-0.5 text-[11px]" style={{ color: 'var(--muted)' }}>{formatDuration(item.duration)}</p>
          )
        )}
      </div>

      <div onClick={(e) => e.stopPropagation()} className="flex shrink-0 items-center gap-1">
        {showProgress && <BookmarkButton episode={episode} size={15} className="h-9 w-9" />}
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
    </div>
  )
}

function matches(item, needle) {
  if (!needle) return true
  const haystack = `${item.title ?? ''} ${item.scholarName ?? ''}`.toLowerCase()
  return haystack.includes(needle)
}

function LibraryPage() {
  const [bookmarks, setBookmarks] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [clearing, setClearing] = useState(false)
  const authStatus = useUserStore((s) => s.status)

  useEffect(() => {
    if (authStatus !== 'ready') return
    setLoading(true)
    Promise.all([
      getBookmarks().catch((err) => {
        console.error('[library] failed to load bookmarks:', err.code || err.message, err)
        return []
      }),
      getHistory().catch((err) => {
        console.error('[library] failed to load history:', err.code || err.message, err)
        return []
      }),
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

  const handleClearHistory = async () => {
    if (!confirm('Clear your entire listening history? This can\'t be undone.')) return
    setClearing(true)
    const prev = history
    setHistory([])
    try {
      await clearHistory()
    } catch {
      setHistory(prev)
    } finally {
      setClearing(false)
    }
  }

  const needle = query.trim().toLowerCase()
  const filteredBookmarks = useMemo(() => bookmarks.filter((b) => matches(b, needle)), [bookmarks, needle])
  const filteredHistory = useMemo(() => history.filter((h) => matches(h, needle)), [history, needle])

  const isEmpty = !loading && bookmarks.length === 0 && history.length === 0
  const noResults = !loading && !isEmpty && needle && filteredBookmarks.length === 0 && filteredHistory.length === 0

  return (
    <div className="px-5 pt-6 lg:mx-auto lg:max-w-5xl lg:px-10 lg:pt-10">

      <h1 className="font-display text-3xl font-semibold tracking-tight text-gray-900">
        Library
      </h1>

      <p className="mt-2 text-gray-500">
        Your saved Islamic content.
      </p>

      {!loading && !isEmpty && (
        <div className="mt-4 flex items-center gap-3 rounded-full border border-gray-200 bg-white px-4 py-3 shadow-sm transition-shadow focus-within:shadow-md">
          <Search size={18} className="shrink-0 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent outline-none ring-0 focus:outline-none focus:ring-0"
            placeholder="Search your library…" />
          {query && (
            <button onClick={() => setQuery('')} aria-label="Clear search" className="shrink-0 text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          )}
        </div>
      )}

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

      {noResults && (
        <p className="mt-8 text-center text-sm text-gray-500">No results for "{query}".</p>
      )}

      {!loading && filteredBookmarks.length > 0 && (
        <div className="mt-8 animate-rise-in">
          <h2 className="font-display text-lg font-semibold text-gray-900">
            Bookmarks <span className="font-sans text-sm font-normal text-gray-400">({filteredBookmarks.length})</span>
          </h2>
          <div className="mt-4 flex flex-col gap-2">
            {filteredBookmarks.map((b) => (
              <LibraryRow key={b.id} item={b} onRemove={handleRemove} queue={filteredBookmarks} />
            ))}
          </div>
        </div>
      )}

      {!loading && filteredHistory.length > 0 && (
        <div className="mt-8 animate-rise-in">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-gray-900">
              Recently Played
            </h2>
            <button
              onClick={handleClearHistory}
              disabled={clearing}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-500 transition hover:text-[var(--danger)] disabled:opacity-50"
            >
              <History size={13} /> Clear
            </button>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            {filteredHistory.map((h) => (
              <LibraryRow key={h.id} item={h} showProgress queue={filteredHistory} />
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

export default LibraryPage
