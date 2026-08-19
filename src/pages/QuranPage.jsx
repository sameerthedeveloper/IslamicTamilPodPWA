import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, Play, Pause, SkipBack, SkipForward, Bookmark, Star, Gauge, WifiOff } from 'lucide-react'
import { getSurahList, RECITERS } from '../api/quranCloud'
import { useQuranStore } from '../store/quranStore'
import EqualizerBars from '../components/EqualizerBars'

const SPEEDS = [1, 1.25, 1.5, 0.75]

function SurahListSkeleton() {
  return (
    <div className="mt-4 space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4">
          <div className="skeleton h-10 w-10 shrink-0 rounded-full" />
          <div className="flex-1">
            <div className="skeleton h-4 w-1/2 rounded-full" />
            <div className="skeleton mt-2 h-3 w-1/4 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

function SurahList({ surahs, loading, error, onSelect, bookmark }) {
  return (
    <div className="px-5 pt-6 lg:mx-auto lg:max-w-3xl lg:px-10 lg:pt-10">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-gray-900">Quran</h1>
      <p className="mt-2 text-gray-500">114 surahs, Arabic text with translation.</p>

      {bookmark && (
        <button
          onClick={() => onSelect(bookmark.surahId, bookmark.ayahId)}
          className="animate-rise-in mt-6 flex w-full items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
            <Bookmark size={16} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-gray-900">Continue reading</span>
            <span className="block text-xs text-gray-500">Surah {bookmark.surahId} &middot; Ayah {bookmark.ayahId}</span>
          </span>
        </button>
      )}

      {error && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4">
          <WifiOff size={18} style={{ color: 'var(--muted)' }} />
          <p className="text-sm text-gray-500">Couldn't reach the Quran API. Showing cached data if available.</p>
        </div>
      )}

      {loading && <SurahListSkeleton />}

      {!loading && (
        <div className="mt-4 space-y-2">
          {surahs.map((s, i) => (
            <button
              key={s.id}
              onClick={() => onSelect(s.id, 1)}
              style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}
              className="animate-rise-in flex w-full items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]"
            >
              <span
                className="font-data flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(155deg, var(--accent), #0B5C55)' }}
              >
                {s.id}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-gray-900">{s.nameEn}</span>
                <span className="block text-xs text-gray-500">{s.ayatCount} ayahs &middot; {s.revelation}</span>
              </span>
              <span className="font-display shrink-0 text-lg text-gray-700">{s.nameAr}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// In-page reader — reads/controls playback via quranStore, same state the
// app-wide QuranMiniPlayer/QuranFullPlayerSheet use, so playback started
// here keeps going (and stays controllable) after navigating away.
function SurahReader({ onBack }) {
  const [showSpeed, setShowSpeed] = useState(false)
  const [showReciter, setShowReciter] = useState(false)
  const ayahRefs = useRef({})

  const currentSurah = useQuranStore((s) => s.currentSurah)
  const surahData = useQuranStore((s) => s.surahData)
  const surahLoading = useQuranStore((s) => s.surahLoading)
  const surahError = useQuranStore((s) => s.surahError)
  const currentAyah = useQuranStore((s) => s.currentAyah)
  const isPlaying = useQuranStore((s) => s.isPlaying)
  const playbackSpeed = useQuranStore((s) => s.playbackSpeed)
  const reciter = useQuranStore((s) => s.reciter)
  const togglePlay = useQuranStore((s) => s.togglePlay)
  const nextAyah = useQuranStore((s) => s.nextAyah)
  const prevAyah = useQuranStore((s) => s.prevAyah)
  const playAyah = useQuranStore((s) => s.playAyah)
  const setSpeed = useQuranStore((s) => s.setSpeed)
  const setReciter = useQuranStore((s) => s.setReciter)
  const setBookmark = useQuranStore((s) => s.setBookmark)
  const toggleFavorite = useQuranStore((s) => s.toggleFavorite)
  const isFavorite = useQuranStore((s) => s.isFavorite)

  // Keeps the currently-reciting verse scrolled into view as playback
  // auto-advances, so you can read along without touching the screen.
  useEffect(() => {
    ayahRefs.current[currentAyah]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [currentAyah])

  if (surahLoading) {
    return (
      <div className="px-5 pt-6 lg:mx-auto lg:max-w-3xl lg:px-10 lg:pt-10">
        <div className="skeleton h-6 w-40 rounded-full" />
        <div className="mt-6 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  if (surahError || !surahData) {
    return (
      <div className="px-5 pt-6 lg:mx-auto lg:max-w-3xl lg:px-10 lg:pt-10">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-500">
          <ChevronLeft size={16} /> Back
        </button>
        <div className="mt-6 flex flex-col items-center rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
          <WifiOff size={24} style={{ color: 'var(--muted)' }} />
          <p className="mt-3 text-sm text-gray-500">Couldn't load this surah. Check your connection and try again.</p>
        </div>
      </div>
    )
  }

  const idx = surahData.ayahs.findIndex((a) => a.number === currentAyah)
  const hasPrev = idx > 0
  const hasNext = idx < surahData.ayahs.length - 1
  const pct = ((idx + 1) / surahData.ayahs.length) * 100

  return (
    <div className="lg:mx-auto lg:max-w-3xl">

      {/* Sticky control header — stays put while the verse list below it
          scrolls, so play/skip/bookmark are always reachable on a phone
          without scrolling back up. */}
      <div className="sticky top-0 z-10 -mt-px bg-[var(--base)]/95 px-5 pb-4 pt-6 backdrop-blur lg:px-10 lg:pt-10">

        <div className="flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-500 transition hover:text-gray-900">
            <ChevronLeft size={16} /> Surahs
          </button>
          <button
            onClick={() => setBookmark(currentSurah.id, currentAyah)}
            aria-label="Bookmark this ayah"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:text-[var(--accent)]"
          >
            <Bookmark size={15} />
          </button>
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-gray-900">{surahData.nameEn}</h1>
            <p className="text-xs text-gray-500">{surahData.revelation} &middot; {surahData.ayahs.length} ayahs</p>
          </div>
          <p className="font-display text-3xl text-gray-800">{surahData.nameAr}</p>
        </div>

        <div className="mt-3">
          <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full transition-[width] duration-300" style={{ width: `${pct}%`, background: 'var(--accent)' }} />
          </div>
          <p className="font-data mt-1.5 text-[11px]" style={{ color: 'var(--muted)' }}>
            Ayah {idx + 1} of {surahData.ayahs.length}
          </p>
        </div>

        <div className="mt-3 flex items-center justify-center gap-6">
          <button onClick={prevAyah} disabled={!hasPrev} className="text-gray-600 transition hover:text-gray-900 disabled:opacity-30" aria-label="Previous ayah">
            <SkipBack size={20} strokeWidth={2.5} />
          </button>
          <button
            onClick={togglePlay}
            className="flex size-14 items-center justify-center rounded-full text-white shadow-lg transition-transform duration-150 hover:opacity-90 active:scale-90"
            style={{ background: 'var(--accent)' }}
            aria-label="Play or pause"
          >
            {isPlaying ? <Pause size={24} strokeWidth={2.5} /> : <Play size={24} strokeWidth={2.5} />}
          </button>
          <button onClick={nextAyah} disabled={!hasNext} className="text-gray-600 transition hover:text-gray-900 disabled:opacity-30" aria-label="Next ayah">
            <SkipForward size={20} strokeWidth={2.5} />
          </button>
        </div>

        {isPlaying && (
          <div className="mt-1.5 flex justify-center" style={{ color: 'var(--accent)' }}>
            <EqualizerBars />
          </div>
        )}

        <div className="mt-3 flex items-center justify-center gap-2">
          <div className="relative">
            <button
              onClick={() => { setShowSpeed((v) => !v); setShowReciter(false) }}
              className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 shadow-sm transition hover:bg-gray-50"
            >
              <Gauge size={13} /> {playbackSpeed}×
            </button>
            {showSpeed && (
              <div className="animate-rise-in absolute top-full left-1/2 mt-2 w-28 -translate-x-1/2 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-lg">
                {SPEEDS.map((sp) => (
                  <button
                    key={sp}
                    onClick={() => { setSpeed(sp); setShowSpeed(false) }}
                    className="block w-full rounded-lg px-3 py-1.5 text-left text-xs text-gray-700 transition hover:bg-gray-50"
                    style={sp === playbackSpeed ? { color: 'var(--accent)', fontWeight: 600 } : undefined}
                  >
                    {sp}×
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => { setShowReciter((v) => !v); setShowSpeed(false) }}
              className="rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 shadow-sm transition hover:bg-gray-50"
            >
              {RECITERS.find((r) => r.id === reciter)?.label ?? reciter}
            </button>
            {showReciter && (
              <div className="animate-rise-in absolute top-full left-1/2 mt-2 w-44 -translate-x-1/2 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-lg">
                {RECITERS.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => { setReciter(r.id); setShowReciter(false) }}
                    className="block w-full rounded-lg px-3 py-1.5 text-left text-xs text-gray-700 transition hover:bg-gray-50"
                    style={r.id === reciter ? { color: 'var(--accent)', fontWeight: 600 } : undefined}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Full verse list — the reciting ayah is highlighted and kept
          auto-scrolled into view; tap any verse to jump + play it. */}
      <div className="mt-2 space-y-3 px-5 pb-6 lg:px-10">
        {surahData.ayahs.map((a) => {
          const isActive = a.number === currentAyah
          return (
            <div
              key={a.number}
              ref={(el) => { ayahRefs.current[a.number] = el }}
              role="button"
              tabIndex={0}
              onClick={() => playAyah(a.number)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') playAyah(a.number) }}
              className="block w-full cursor-pointer rounded-3xl border p-5 text-left shadow-sm transition-all duration-300"
              style={{
                borderColor: isActive ? 'var(--accent)' : 'var(--border)',
                background: isActive
                  ? 'linear-gradient(160deg, var(--accent-soft), var(--surface))'
                  : 'var(--surface)',
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className="font-data flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white transition-colors duration-300"
                  style={{ background: isActive ? 'var(--accent)' : 'var(--muted)' }}
                >
                  {a.number}
                </span>
                {isActive && isPlaying && (
                  <span style={{ color: 'var(--accent)' }}><EqualizerBars /></span>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(currentSurah.id, a.number) }}
                  aria-label="Toggle favorite"
                  className="shrink-0 transition"
                  style={{ color: isFavorite(currentSurah.id, a.number) ? 'var(--accent)' : 'var(--muted)' }}
                >
                  <Star size={16} fill={isFavorite(currentSurah.id, a.number) ? 'currentColor' : 'none'} />
                </button>
              </div>
              <p dir="rtl" className={`font-display mt-3 text-right leading-loose text-gray-900 ${isActive ? 'text-2xl' : 'text-xl'}`}>
                {a.text}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">{a.translation}</p>
            </div>
          )
        })}
      </div>

    </div>
  )
}

function QuranPage() {
  const [surahs, setSurahs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const currentSurah = useQuranStore((s) => s.currentSurah)
  const openSurah = useQuranStore((s) => s.openSurah)
  const closeSurah = useQuranStore((s) => s.closeSurah)
  const bookmark = useQuranStore((s) => s.bookmark)

  useEffect(() => {
    getSurahList()
      .then(setSurahs)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const handleSelect = (surahId, ayahId) => {
    const meta = surahs.find((s) => s.id === surahId) ?? { id: surahId }
    openSurah(meta, ayahId || 1)
  }

  if (currentSurah) {
    return <SurahReader onBack={closeSurah} />
  }

  return (
    <SurahList
      surahs={surahs}
      loading={loading}
      error={error}
      onSelect={handleSelect}
      bookmark={bookmark}
    />
  )
}

export default QuranPage
