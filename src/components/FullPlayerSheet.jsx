import { ChevronDown, Play, Pause, FastForwardIcon, RewindIcon } from 'lucide-react'
import { usePlayerStore } from '../store/playerStore'

function formatTime(sec) {
  if (!sec || Number.isNaN(sec)) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
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

  if (!isPlayerOpen || !currentEpisode) return null

  const pct = duration ? (currentTime / duration) * 100 : 0

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col bg-gray-100 animate-[fullplayer-in_0.35s_cubic-bezier(0.22,1,0.36,1)]"
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

      <main className="flex flex-1 flex-col items-center justify-center px-8 pb-[calc(2.5rem+env(safe-area-inset-bottom))]">

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

        <div className="mt-10 w-full max-w-sm">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-gray-900 truncate">
            {currentEpisode.title ?? 'Title'}
          </h1>
          <p className="mt-1 text-sm text-gray-500 truncate">
            {currentEpisode.scholar?.name ?? 'Scholar'}
          </p>
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

        <div className="mt-10 flex items-center gap-8">

          <button onClick={prev} className="text-gray-600 transition hover:text-gray-900" aria-label="Previous">
            <RewindIcon size={26} strokeWidth={2.5} />
          </button>

          <button
            onClick={togglePlay}
            className="flex size-16 items-center justify-center rounded-full text-white shadow-lg transition hover:opacity-90"
            style={{ background: 'var(--accent)' }}
            aria-label="Play or pause">
            {isPlaying ? <Pause size={28} strokeWidth={2.5} /> : <Play size={28} strokeWidth={2.5} />}
          </button>

          <button onClick={next} className="text-gray-600 transition hover:text-gray-900" aria-label="Next">
            <FastForwardIcon size={26} strokeWidth={2.5} />
          </button>

        </div>

      </main>
    </div>
  )
}

export default FullPlayerSheet
