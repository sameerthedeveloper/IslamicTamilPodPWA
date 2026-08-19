import { useState } from 'react'
import {
  ChevronDown, Play, Pause, SkipBack, SkipForward, Gauge, Star, WifiOff,
} from 'lucide-react'
import { useQuranStore } from '../store/quranStore'
import { RECITERS } from '../api/quranCloud'
import EqualizerBars from './EqualizerBars'

const SPEEDS = [1, 1.25, 1.5, 0.75]

function QuranFullPlayerSheet() {
  const isPlayerOpen = useQuranStore((s) => s.isPlayerOpen)
  const closePlayer = useQuranStore((s) => s.closePlayer)
  const currentSurah = useQuranStore((s) => s.currentSurah)
  const surahData = useQuranStore((s) => s.surahData)
  const surahLoading = useQuranStore((s) => s.surahLoading)
  const surahError = useQuranStore((s) => s.surahError)
  const currentAyah = useQuranStore((s) => s.currentAyah)
  const isPlaying = useQuranStore((s) => s.isPlaying)
  const togglePlay = useQuranStore((s) => s.togglePlay)
  const nextAyah = useQuranStore((s) => s.nextAyah)
  const prevAyah = useQuranStore((s) => s.prevAyah)
  const playbackSpeed = useQuranStore((s) => s.playbackSpeed)
  const setSpeed = useQuranStore((s) => s.setSpeed)
  const reciter = useQuranStore((s) => s.reciter)
  const setReciter = useQuranStore((s) => s.setReciter)
  const toggleFavorite = useQuranStore((s) => s.toggleFavorite)
  const isFavorite = useQuranStore((s) => s.isFavorite)

  const [showSpeed, setShowSpeed] = useState(false)
  const [showReciter, setShowReciter] = useState(false)

  if (!isPlayerOpen || !currentSurah) return null

  const ayah = surahData?.ayahs.find((a) => a.number === currentAyah)
  const idx = surahData?.ayahs.findIndex((a) => a.number === currentAyah) ?? -1
  const total = surahData?.ayahs.length ?? currentSurah.ayatCount ?? 0
  const hasPrev = idx > 0
  const hasNext = idx >= 0 && idx < total - 1
  const pct = total ? ((idx + 1) / total) * 100 : 0

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col bg-gray-100 animate-[fullplayer-in_0.35s_cubic-bezier(0.22,1,0.36,1)] sm:left-1/2 sm:right-auto sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:border-x sm:border-gray-200"
      style={{ animationFillMode: 'backwards' }}
    >
      <style>{`
        @keyframes fullplayer-in {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>

      <header className="pt-safe flex min-h-20 shrink-0 items-center justify-between px-5">
        <button
          onClick={closePlayer}
          aria-label="Close player"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 shadow-sm transition hover:bg-gray-100">
          <ChevronDown size={20} strokeWidth={3} />
        </button>

        <p className="text-xs font-medium uppercase tracking-widest text-gray-500">
          Now Reciting
        </p>

        <div className="h-10 w-10" />
      </header>

      <main className="flex flex-1 flex-col px-6 pb-[calc(2.5rem+env(safe-area-inset-bottom))] overflow-y-auto">

        <div className="mt-2 flex items-baseline justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-gray-900">
              {currentSurah.nameEn}
            </h1>
            <p className="mt-1 text-xs text-gray-500">
              {currentSurah.revelation ?? ''} {total ? `· ${total} ayahs` : ''}
            </p>
          </div>
          <p className="font-display text-3xl text-gray-800">{currentSurah.nameAr}</p>
        </div>

        <div className="mt-4 shrink-0">
          <div className="h-1 w-full overflow-hidden rounded-full bg-gray-200">
            <div className="h-full rounded-full transition-[width] duration-300" style={{ width: `${pct}%`, background: 'var(--gold)' }} />
          </div>
          <p className="font-data mt-1.5 text-[11px]" style={{ color: 'var(--muted)' }}>
            {total ? `Ayah ${idx + 1} of ${total}` : ''}
          </p>
        </div>

        <div className="flex flex-1 items-center justify-center py-8">
          {surahLoading && (
            <div className="w-full space-y-3">
              <div className="skeleton mx-auto h-8 w-3/4 rounded-full" />
              <div className="skeleton mx-auto h-8 w-full rounded-full" />
              <div className="skeleton mx-auto h-4 w-2/3 rounded-full" />
            </div>
          )}

          {!surahLoading && surahError && (
            <div className="flex flex-col items-center text-center">
              <WifiOff size={24} style={{ color: 'var(--muted)' }} />
              <p className="mt-3 text-sm text-gray-500">Couldn't load this surah's audio.</p>
            </div>
          )}

          {!surahLoading && ayah && (
            <div
              className="animate-rise-in w-full rounded-3xl border border-gray-200 p-6 shadow-sm"
              style={{ background: 'linear-gradient(160deg, var(--gold-soft), var(--surface))' }}
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className="font-data flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                  style={{ background: 'var(--gold)' }}
                >
                  {ayah.number}
                </span>
                <button
                  onClick={() => toggleFavorite(currentSurah.id, ayah.number)}
                  aria-label="Toggle favorite"
                  className="shrink-0 transition"
                  style={{ color: isFavorite(currentSurah.id, ayah.number) ? 'var(--gold)' : 'var(--muted)' }}
                >
                  <Star size={18} fill={isFavorite(currentSurah.id, ayah.number) ? 'currentColor' : 'none'} />
                </button>
              </div>
              <p dir="rtl" className="font-display mt-4 text-right text-3xl leading-loose text-gray-900">
                {ayah.text}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-gray-600">{ayah.translation}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-6">

          <button
            onClick={prevAyah}
            disabled={!hasPrev}
            className="text-gray-600 transition hover:text-gray-900 disabled:opacity-30"
            aria-label="Previous ayah">
            <SkipBack size={22} strokeWidth={2.5} />
          </button>

          <button
            onClick={togglePlay}
            className="relative flex size-16 items-center justify-center rounded-full text-white shadow-lg transition-transform duration-150 hover:opacity-90 active:scale-90"
            style={{ background: 'var(--gold)' }}
            aria-label="Play or pause">
            {isPlaying ? <Pause size={28} strokeWidth={2.5} /> : <Play size={28} strokeWidth={2.5} />}
          </button>

          <button
            onClick={nextAyah}
            disabled={!hasNext}
            className="text-gray-600 transition hover:text-gray-900 disabled:opacity-30"
            aria-label="Next ayah">
            <SkipForward size={22} strokeWidth={2.5} />
          </button>

        </div>

        {isPlaying && (
          <div className="mt-3 flex justify-center" style={{ color: 'var(--gold)' }}>
            <EqualizerBars />
          </div>
        )}

        <div className="mt-6 flex items-center justify-center gap-2">

          <div className="relative">
            <button
              onClick={() => { setShowSpeed((v) => !v); setShowReciter(false) }}
              className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 shadow-sm transition hover:bg-gray-50"
              aria-label="Playback speed">
              <Gauge size={15} />
              {playbackSpeed}×
            </button>
            {showSpeed && (
              <div className="animate-rise-in absolute bottom-full left-1/2 mb-2 w-28 -translate-x-1/2 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-lg">
                {SPEEDS.map((sp) => (
                  <button
                    key={sp}
                    onClick={() => { setSpeed(sp); setShowSpeed(false) }}
                    className="block w-full rounded-lg px-3 py-1.5 text-left text-xs text-gray-700 transition hover:bg-gray-50"
                    style={sp === playbackSpeed ? { color: 'var(--gold)', fontWeight: 600 } : undefined}
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
                    style={r.id === reciter ? { color: 'var(--gold)', fontWeight: 600 } : undefined}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  )
}

export default QuranFullPlayerSheet
