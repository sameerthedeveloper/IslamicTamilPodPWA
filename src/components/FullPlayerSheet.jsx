import { useState } from 'react'
import {
  ChevronDown, Play, Pause, FastForwardIcon, RewindIcon,
  RotateCcw, RotateCw, Gauge, Moon, Volume1, Volume2, VolumeX,
} from 'lucide-react'
import { usePlayerStore } from '../store/playerStore'
import BookmarkButton from './BookmarkButton'

const RATES = [1, 1.25, 1.5, 1.75, 2, 0.75]
const SLEEP_OPTIONS = [15, 30, 45, 60]

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

  if (!isPlayerOpen || !currentEpisode) return null

  const pct = duration ? (currentTime / duration) * 100 : 0
  const idx = queue.findIndex((e) => e.id === currentEpisode.id)
  const hasPrev = idx > 0
  const hasNext = idx >= 0 && idx < queue.length - 1

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col bg-gray-100 animate-[fullplayer-in_0.35s_cubic-bezier(0.22,1,0.36,1)] sm:left-1/2 sm:right-auto sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:border-x sm:border-gray-200"
      style={{
        animationFillMode: 'backwards',
      }}
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
          Now Playing
        </p>

        <div className="h-10 w-10" />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-8 pb-[calc(2.5rem+env(safe-area-inset-bottom))] overflow-y-auto">

        <div
          className="flex aspect-square w-full max-w-sm shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-gray-200 shadow-xl"
          style={{ background: 'linear-gradient(155deg, var(--accent), #0B5C55)' }}>
          {currentEpisode.thumbnail ? (
            <img src={currentEpisode.thumbnail} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="font-display text-7xl font-semibold text-white/90">
              {currentEpisode.title?.[0] ?? 'I'}
            </span>
          )}
        </div>

        <div className="mt-10 flex w-full max-w-sm items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-gray-900 truncate">
              {currentEpisode.title ?? 'Title'}
            </h1>
            {currentEpisode.scholar?.name && (
              <p className="mt-1 text-sm text-gray-500 truncate">
                {currentEpisode.scholar.name}
              </p>
            )}
          </div>
          <BookmarkButton episode={currentEpisode} size={17} className="h-10 w-10 shrink-0" />
        </div>

        <div className="mt-8 w-full max-w-sm">
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={currentTime}
            onChange={(e) => seek(Number(e.target.value))}
            className="w-full h-1 cursor-pointer"
            style={{
              accentColor: 'var(--accent)',
              background: `linear-gradient(to right, var(--accent) ${pct}%, #e5e7eb ${pct}%)`,
            }}
            aria-label="Seek"
          />
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

          <button onClick={() => skipBy(-15)} className="text-gray-600 transition hover:text-gray-900" aria-label="Back 15 seconds">
            <RotateCcw size={22} strokeWidth={2.5} />
          </button>

          <button
            onClick={togglePlay}
            className="flex size-16 items-center justify-center rounded-full text-white shadow-lg transition hover:opacity-90"
            style={{ background: 'var(--accent)' }}
            aria-label="Play or pause">
            {isPlaying ? <Pause size={28} strokeWidth={2.5} /> : <Play size={28} strokeWidth={2.5} />}
          </button>

          <button onClick={() => skipBy(15)} className="text-gray-600 transition hover:text-gray-900" aria-label="Forward 15 seconds">
            <RotateCw size={22} strokeWidth={2.5} />
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
              {sleepTimerMinutes ? `${sleepTimerMinutes}m` : 'Sleep'}
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
    </div>
  )
}

export default FullPlayerSheet
