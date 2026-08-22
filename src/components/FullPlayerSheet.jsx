import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown, Play, Pause, FastForwardIcon, RewindIcon,
  RotateCcw, RotateCw, Gauge, Moon, Volume1, Volume2, VolumeX, Star,
} from 'lucide-react'
import { usePlayerStore } from '../store/playerStore'
import BookmarkButton from './BookmarkButton'
import EqualizerBars from './EqualizerBars'
import { useImageFallback } from '../hooks/useImageFallback'

// Keyed by episode id where it's used below, so a broken image on one
// episode doesn't stick around as the fallback for the next one.
function Artwork({ thumbnail, title }) {
  const { failed, onError } = useImageFallback()
  if (thumbnail && !failed) {
    return <img src={thumbnail} alt="" onError={onError} className="absolute inset-0 h-full w-full object-cover" />
  }
  return (
    <span className="font-display relative text-7xl font-semibold text-white/90">
      {title?.[0] ?? 'I'}
    </span>
  )
}

const RATES = [1, 1.25, 1.5, 1.75, 2, 0.75]
const SLEEP_OPTIONS = [15, 30, 45, 60]
const SKIP_SECONDS = 10

function formatTime(sec) {
  if (!sec || Number.isNaN(sec)) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function VolumeIcon({ volume }) {
  if (volume === 0) return <VolumeX size={17} />
  if (volume < 0.5) return <Volume1 size={17} />
  return <Volume2 size={17} />
}

// Skip-by-10 buttons need the seconds numeral baked into the icon, the way
// most audio apps render it — lucide's rotate icons don't include one.
function SkipIcon({ direction }) {
  const Icon = direction === 'back' ? RotateCcw : RotateCw
  return (
    <span className="relative inline-flex items-center justify-center">
      <Icon size={26} strokeWidth={2} />
      <span className="font-data absolute text-[9px] font-bold leading-none" style={{ marginTop: '1px' }}>
        {SKIP_SECONDS}
      </span>
    </span>
  )
}

function FullPlayerSheet() {
  const isPlayerOpen = usePlayerStore((s) => s.isPlayerOpen)
  const closePlayer = usePlayerStore((s) => s.closePlayer)
  const currentEpisode = usePlayerStore((s) => s.currentEpisode)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const togglePlay = usePlayerStore((s) => s.togglePlay)
  const next = usePlayerStore((s) => s.next)
  const prev = usePlayerStore((s) => s.prev)
  const currentTime = usePlayerStore((s) => s.currentTime)
  const duration = usePlayerStore((s) => s.duration)
  const seek = usePlayerStore((s) => s.seek)
  const skipBy = usePlayerStore((s) => s.skipBy)
  const queue = usePlayerStore((s) => s.queue)
  const volume = usePlayerStore((s) => s.volume)
  const setVolume = usePlayerStore((s) => s.setVolume)
  const playbackRate = usePlayerStore((s) => s.playbackRate)
  const setPlaybackRate = usePlayerStore((s) => s.setPlaybackRate)
  const sleepTimerMinutes = usePlayerStore((s) => s.sleepTimerMinutes)
  const setSleepTimer = usePlayerStore((s) => s.setSleepTimer)

  const [showVolume, setShowVolume] = useState(false)
  const [showSleep, setShowSleep] = useState(false)

  const visible = isPlayerOpen && !!currentEpisode

  const pct = duration ? (currentTime / duration) * 100 : 0
  const idx = currentEpisode ? queue.findIndex((e) => e.id === currentEpisode.id) : -1
  const hasPrev = idx > 0
  const hasNext = idx >= 0 && idx < queue.length - 1

  return (
    <AnimatePresence>
      {visible && (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-60 flex flex-col bg-gray-100 sm:left-1/2 sm:right-auto sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:border-x sm:border-gray-200"
    >
      <style>{`
        @keyframes now-playing-wave {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1); }
        }
      `}</style>

      <header className="pt-safe flex min-h-20 shrink-0 flex-col items-center justify-center px-5">
        <button
          onClick={closePlayer}
          aria-label="Close player"
          className="absolute left-5 flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 shadow-sm transition hover:bg-gray-100"
          style={{ top: 'max(0.75rem, env(safe-area-inset-top))' }}>
          <ChevronDown size={20} strokeWidth={3} />
        </button>

        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
          Now Playing
        </p>

        {/* Little rhythmic waveform accent, only animates while playing —
            a quiet nod to the reciting/listening mood of the app. */}
        <div className="mt-1.5 flex h-3 items-center gap-0.75" aria-hidden="true">
          {[0.5, 0.8, 1, 0.6, 0.9, 0.4, 0.7].map((h, i) => (
            <span
              key={i}
              className="w-[2.5px] rounded-full"
              style={{
                height: `${h * 100}%`,
                background: 'var(--accent)',
                animation: isPlaying
                  ? `now-playing-wave ${0.7 + (i % 3) * 0.15}s ease-in-out ${i * 0.06}s infinite`
                  : 'none',
                opacity: isPlaying ? 1 : 0.35,
                transform: isPlaying ? undefined : 'scaleY(0.3)',
              }}
            />
          ))}
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-8 pb-[calc(2.5rem+env(safe-area-inset-bottom))] overflow-y-auto">

        <div
          className={`relative flex aspect-square w-full max-w-sm shrink-0 items-center justify-center overflow-hidden rounded-3xl transition-[box-shadow] duration-500 ${isPlaying ? 'animate-medallion-glow' : 'shadow-[0_20px_50px_-12px_rgba(11,92,85,0.45)]'}`}
          style={{ background: 'linear-gradient(160deg, #0F2E29 0%, #081B18 55%, #050F0D 100%)', border: '3px solid var(--gold)' }}>

          <div className="pattern-star pointer-events-none absolute inset-0 opacity-[0.08]" />

          {/* Full portrait, shown as-is — no crop, no dark wash. A gold
              frame around the whole card (like a manuscript folio border)
              does the "this is artwork" work instead of an overlay that
              would obscure the photo itself. */}
          <Artwork key={currentEpisode.id} thumbnail={currentEpisode.thumbnail} title={currentEpisode.title} />

          {/* Crescent + star, a small pinned accent rather than a wash
              over the whole photo. */}
          <div
            className="absolute right-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1.5"
            style={{ background: 'rgba(5,15,13,0.55)', backdropFilter: 'blur(4px)', color: 'var(--gold)' }}>
            <Moon size={14} fill="currentColor" strokeWidth={0} />
            <Star size={6} fill="currentColor" strokeWidth={0} className="-ml-0.5 mt-1" />
          </div>
        </div>

        <div className="mt-10 flex w-full max-w-sm items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-semibold tracking-tight text-gray-900 truncate">
                {currentEpisode.title ?? 'Title'}
              </h1>
              {isPlaying && (
                <span className="shrink-0" style={{ color: 'var(--accent)' }}>
                  <EqualizerBars />
                </span>
              )}
            </div>
            {currentEpisode.scholar?.name && (
              <p className="mt-1 truncate text-sm font-medium" style={{ color: 'var(--accent)' }}>
                {currentEpisode.scholar.name}
              </p>
            )}
          </div>
          <BookmarkButton episode={currentEpisode} size={17} className="h-10 w-10 shrink-0" />
        </div>

        <div className="mt-8 w-full max-w-sm">
          <div className="relative flex items-center">
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={currentTime}
              onChange={(e) => seek(Number(e.target.value))}
              className="fp-seek w-full cursor-pointer"
              style={{ '--pct': `${pct}%` }}
              aria-label="Seek"
            />
          </div>
          <style>{`
            .fp-seek {
              -webkit-appearance: none;
              appearance: none;
              height: 4px;
              border-radius: 999px;
              background: linear-gradient(to right, var(--accent) var(--pct), #e5e7eb var(--pct));
              outline: none;
            }
            .fp-seek::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 16px;
              height: 16px;
              border-radius: 999px;
              background: #ffffff;
              border: 3px solid var(--accent);
              box-shadow: 0 0 0 4px rgba(15, 118, 110, 0.18), 0 0 12px 2px rgba(15, 118, 110, 0.55);
              cursor: pointer;
            }
            .fp-seek::-moz-range-thumb {
              width: 16px;
              height: 16px;
              border-radius: 999px;
              background: #ffffff;
              border: 3px solid var(--accent);
              box-shadow: 0 0 0 4px rgba(15, 118, 110, 0.18), 0 0 12px 2px rgba(15, 118, 110, 0.55);
              cursor: pointer;
            }
          `}</style>
          <div className="mt-2 flex justify-between text-xs text-gray-500">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-6">

          <button
            onClick={prev}
            disabled={!hasPrev}
            className="text-gray-600 transition hover:text-gray-900 disabled:opacity-30"
            aria-label="Previous track">
            <RewindIcon size={22} strokeWidth={2.5} />
          </button>

          <button onClick={() => skipBy(-SKIP_SECONDS)} className="text-gray-600 transition hover:text-gray-900" aria-label={`Back ${SKIP_SECONDS} seconds`}>
            <SkipIcon direction="back" />
          </button>

          <button
            onClick={togglePlay}
            className="relative flex size-16 items-center justify-center rounded-full text-white transition-transform duration-150 hover:opacity-90 active:scale-90"
            style={{
              background: 'linear-gradient(155deg, var(--accent), #0B5C55)',
              boxShadow: '0 8px 24px -4px rgba(15, 118, 110, 0.55), 0 0 0 6px rgba(15, 118, 110, 0.12)',
            }}
            aria-label="Play or pause">
            {isPlaying ? <Pause size={28} strokeWidth={2.5} /> : <Play size={28} strokeWidth={2.5} />}
          </button>

          <button onClick={() => skipBy(SKIP_SECONDS)} className="text-gray-600 transition hover:text-gray-900" aria-label={`Forward ${SKIP_SECONDS} seconds`}>
            <SkipIcon direction="forward" />
          </button>

          <button
            onClick={next}
            disabled={!hasNext}
            className="text-gray-600 transition hover:text-gray-900 disabled:opacity-30"
            aria-label="Next track">
            <FastForwardIcon size={22} strokeWidth={2.5} />
          </button>

        </div>

        <div className="mt-8 flex w-full max-w-sm items-center justify-center gap-2">

          <div className="relative">
            <button
              onClick={() => { setShowVolume((v) => !v); setShowSleep(false) }}
              className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 shadow-sm transition hover:bg-gray-50"
              aria-label="Volume">
              <VolumeIcon volume={volume} />
              Volume
            </button>
            {showVolume && (
              <div className="absolute bottom-full left-1/2 mb-2 w-32 -translate-x-1/2 rounded-2xl border border-gray-200 bg-white p-3 shadow-lg animate-rise-in">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-full"
                  style={{ accentColor: 'var(--accent)' }}
                  aria-label="Volume level"
                />
              </div>
            )}
          </div>

          <button
            onClick={() => setPlaybackRate(RATES[(RATES.indexOf(playbackRate) + 1) % RATES.length])}
            className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 shadow-sm transition hover:bg-gray-50"
            aria-label="Playback speed">
            <Gauge size={15} />
            {playbackRate}×
          </button>

          <div className="relative">
            <button
              onClick={() => { setShowSleep((v) => !v); setShowVolume(false) }}
              className="flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-medium shadow-sm transition"
              style={{
                borderColor: sleepTimerMinutes ? 'var(--accent)' : '#e5e7eb',
                background: sleepTimerMinutes ? 'var(--accent-soft)' : 'white',
                color: sleepTimerMinutes ? 'var(--accent)' : '#4b5563',
              }}
              aria-label="Sleep timer">
              <Moon size={15} />
              {sleepTimerMinutes ? `${sleepTimerMinutes}m` : 'Sleep Timer'}
            </button>
            {showSleep && (
              <div className="absolute bottom-full right-0 mb-2 w-36 rounded-2xl border border-gray-200 bg-white p-2 shadow-lg animate-rise-in">
                {SLEEP_OPTIONS.map((m) => (
                  <button
                    key={m}
                    onClick={() => { setSleepTimer(m); setShowSleep(false) }}
                    className="block w-full rounded-xl px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-50">
                    {m} minutes
                  </button>
                ))}
                {sleepTimerMinutes && (
                  <button
                    onClick={() => { setSleepTimer(null); setShowSleep(false) }}
                    className="block w-full rounded-xl px-3 py-2 text-left text-sm transition hover:bg-red-50"
                    style={{ color: 'var(--danger)' }}>
                    Turn off
                  </button>
                )}
              </div>
            )}
          </div>

        </div>

      </main>
    </motion.div>
      )}
    </AnimatePresence>
  )
}

export default FullPlayerSheet
