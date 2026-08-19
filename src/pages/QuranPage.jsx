import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, Play, Pause, SkipBack, SkipForward, Bookmark, Star, Gauge, WifiOff } from 'lucide-react'
import { getSurahList, getSurahWithTranslation, RECITERS } from '../api/quranCloud'
import { useQuranStore } from '../store/quranStore'

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
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: 'var(--gold-soft)', color: 'var(--gold)' }}>
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

function SurahReader({ surahId, jumpToAyah, onBack }) {
  const [surah, setSurah] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [showSpeed, setShowSpeed] = useState(false)
  const [showReciter, setShowReciter] = useState(false)
  const audioRef = useRef(null)
  const ayahRefs = useRef({})

  const currentAyah = useQuranStore((s) => s.currentAyah)
  const isPlaying = useQuranStore((s) => s.isPlaying)
  const playbackSpeed = useQuranStore((s) => s.playbackSpeed)
  const reciter = useQuranStore((s) => s.reciter)
  const setAyah = useQuranStore((s) => s.setAyah)
  const setPlaying = useQuranStore((s) => s.setPlaying)
  const setSpeed = useQuranStore((s) => s.setSpeed)
  const setReciter = useQuranStore((s) => s.setReciter)
  const setBookmark = useQuranStore((s) => s.setBookmark)
  const toggleFavorite = useQuranStore((s) => s.toggleFavorite)
  const isFavorite = useQuranStore((s) => s.isFavorite)

  useEffect(() => {
    let cancelled = false
    // Deferred a tick so this isn't a synchronous setState-in-effect (the
    // initial useState defaults already cover the very first run).
    queueMicrotask(() => {
      if (!cancelled) {
        setLoading(true)
        setError(false)
      }
    })
    getSurahWithTranslation(surahId, reciter)
      .then((data) => {
        if (cancelled) return
        setSurah(data)
        setAyah(jumpToAyah || 1)
      })
      .catch(() => !cancelled && setError(true))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surahId, reciter])

  useEffect(() => {
    ayahRefs.current[currentAyah]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [currentAyah])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.playbackRate = playbackSpeed
    if (isPlaying) audio.play().catch(() => setPlaying(false))
    else audio.pause()
  }, [isPlaying, currentAyah, playbackSpeed, setPlaying])

  if (loading) {
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

  if (error || !surah) {
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

  const ayah = surah.ayahs.find((a) => a.number === currentAyah) ?? surah.ayahs[0]
  const idx = surah.ayahs.findIndex((a) => a.number === ayah.number)
  const hasPrev = idx > 0
  const hasNext = idx < surah.ayahs.length - 1
  const pct = ((idx + 1) / surah.ayahs.length) * 100

  const goTo = (n) => {
    setAyah(n)
    setBookmark(surahId, n)
  }

  const handleEnded = () => {
    if (hasNext) goTo(surah.ayahs[idx + 1].number)
    else setPlaying(false)
  }

  return (
    <div className="px-5 pt-6 lg:mx-auto lg:max-w-3xl lg:px-10 lg:pt-10">

      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-500 transition hover:text-gray-900">
          <ChevronLeft size={16} /> Surahs
        </button>
        <button
          onClick={() => setBookmark(surahId, currentAyah)}
          aria-label="Bookmark this ayah"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:text-[var(--accent)]"
        >
          <Bookmark size={15} />
        </button>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-gray-900">{surah.nameEn}</h1>
          <p className="text-xs text-gray-500">{surah.revelation} &middot; {surah.ayahs.length} ayahs</p>
        </div>
        <p className="font-display text-3xl text-gray-800">{surah.nameAr}</p>
      </div>

      {/* progress */}
      <div className="mt-4">
        <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100">
          <div className="h-full rounded-full transition-[width] duration-300" style={{ width: `${pct}%`, background: 'var(--accent)' }} />
        </div>
        <p className="font-data mt-1.5 text-[11px]" style={{ color: 'var(--muted)' }}>
          Ayah {idx + 1} of {surah.ayahs.length}
        </p>
      </div>

      {/* current ayah card, larger + featured */}
      <div className="animate-rise-in mt-6 rounded-3xl border border-gray-200 p-6 shadow-sm" style={{ background: 'linear-gradient(160deg, var(--accent-soft), var(--surface))' }}>
        <div className="flex items-start justify-between gap-3">
          <span
            className="font-data flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
            style={{ background: 'var(--accent)' }}
          >
            {ayah.number}
          </span>
          <button
            onClick={() => toggleFavorite(surahId, ayah.number)}
            aria-label="Toggle favorite"
            className="shrink-0 transition"
            style={{ color: isFavorite(surahId, ayah.number) ? 'var(--gold)' : 'var(--muted)' }}
          >
            <Star size={18} fill={isFavorite(surahId, ayah.number) ? 'currentColor' : 'none'} />
          </button>
        </div>
        <p dir="rtl" className="font-display mt-4 text-right text-2xl leading-loose text-gray-900">
          {ayah.text}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-gray-600">{ayah.translation}</p>
      </div>

      <audio ref={audioRef} src={ayah.audioUrl} onEnded={handleEnded} preload="none" />

      {/* transport controls */}
      <div className="mt-6 flex items-center justify-center gap-6">
        <button onClick={() => hasPrev && goTo(surah.ayahs[idx - 1].number)} disabled={!hasPrev} className="text-gray-600 transition hover:text-gray-900 disabled:opacity-30" aria-label="Previous ayah">
          <SkipBack size={20} strokeWidth={2.5} />
        </button>
        <button
          onClick={() => setPlaying(!isPlaying)}
          className="flex size-14 items-center justify-center rounded-full text-white shadow-lg transition-transform duration-150 hover:opacity-90 active:scale-90"
          style={{ background: 'var(--accent)' }}
          aria-label="Play or pause"
        >
          {isPlaying ? <Pause size={24} strokeWidth={2.5} /> : <Play size={24} strokeWidth={2.5} />}
        </button>
        <button onClick={() => hasNext && goTo(surah.ayahs[idx + 1].number)} disabled={!hasNext} className="text-gray-600 transition hover:text-gray-900 disabled:opacity-30" aria-label="Next ayah">
          <SkipForward size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* speed + reciter */}
      <div className="mt-6 flex items-center justify-center gap-2">
        <div className="relative">
          <button
            onClick={() => { setShowSpeed((v) => !v); setShowReciter(false) }}
            className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 shadow-sm transition hover:bg-gray-50"
          >
            <Gauge size={13} /> {playbackSpeed}×
          </button>
          {showSpeed && (
            <div className="animate-rise-in absolute bottom-full left-1/2 mb-2 w-28 -translate-x-1/2 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-lg">
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
            <div className="animate-rise-in absolute bottom-full left-1/2 mb-2 w-44 -translate-x-1/2 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-lg">
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
  )
}

function QuranPage() {
  const [surahs, setSurahs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const currentSurah = useQuranStore((s) => s.currentSurah)
  const setSurah = useQuranStore((s) => s.setSurah)
  const bookmark = useQuranStore((s) => s.bookmark)
  const [jumpToAyah, setJumpToAyah] = useState(1)

  useEffect(() => {
    getSurahList()
      .then(setSurahs)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const handleSelect = (surahId, ayahId) => {
    const meta = surahs.find((s) => s.id === surahId) ?? { id: surahId }
    setSurah(meta)
    setJumpToAyah(ayahId || 1)
  }

  if (currentSurah) {
    return (
      <SurahReader
        key={currentSurah.id}
        surahId={currentSurah.id}
        jumpToAyah={jumpToAyah}
        onBack={() => setSurah(null)}
      />
    )
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
