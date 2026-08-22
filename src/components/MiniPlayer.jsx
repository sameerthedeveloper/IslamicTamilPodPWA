import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, FastForwardIcon, RewindIcon } from 'lucide-react'
import { usePlayerStore } from '../store/playerStore'
import { useActivePlayerStore } from '../store/activePlayerStore'
import EqualizerBars from './EqualizerBars'
import { useImageFallback } from '../hooks/useImageFallback'
import { useImmersiveRoute } from '../hooks/useImmersiveRoute'

// Keyed by episode id from the parent (see usage below) so the fallback
// resets per episode instead of sticking after the first broken image.
function MiniArtwork({ thumbnail, title, isPlaying }) {
    const { failed, onError } = useImageFallback()
    const showImage = thumbnail && !failed
    return (
        <div
            className={`font-display flex size-15 shrink-0 items-center justify-center rounded-2xl text-lg font-semibold text-white overflow-hidden transition-shadow duration-300 ${isPlaying ? 'animate-glow-pulse' : ''}`}
            style={{
                background: 'linear-gradient(155deg, var(--accent), #0B5C55)',
                border: showImage ? '2px solid var(--gold)' : '1px solid rgba(184,147,74,0.4)',
            }}>
            {showImage ? (
                <img src={thumbnail} alt="" decoding="async" onError={onError} className="h-full w-full object-cover" />
            ) : (
                title?.[0] ?? 'I'
            )}
        </div>
    )
}

function MiniPlayer() {
    const currentEpisode = usePlayerStore((s) => s.currentEpisode)
    const isPlaying = usePlayerStore((s) => s.isPlaying)
    const togglePlay = usePlayerStore((s) => s.togglePlay)
    const next = usePlayerStore((s) => s.next)
    const prev = usePlayerStore((s) => s.prev)
    const openPlayer = usePlayerStore((s) => s.openPlayer)
    const currentTime = usePlayerStore((s) => s.currentTime)
    const duration = usePlayerStore((s) => s.duration)
    const active = useActivePlayerStore((s) => s.active)
    const isImmersive = useImmersiveRoute()

    // Only one of {episode, Quran} mini players docks at a time — whichever
    // the user most recently engaged with.
    const visible = currentEpisode && active !== 'quran'

    const pct = duration ? Math.min(100, (currentTime / duration) * 100) : 0

    return (
        <AnimatePresence>
            {visible && (
        <motion.div id="mini-player"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={`fixed inset-x-6 z-40 overflow-hidden rounded-full border border-gray-200 bg-white shadow-lg sm:left-1/2 sm:right-auto sm:w-full sm:max-w-116 sm:-translate-x-1/2 lg:mx-10 lg:mb-3 lg:rounded-full lg:bottom-0 lg:left-64 lg:right-0 lg:w-auto lg:max-w-none lg:translate-x-0 lg:border lg:border-gray-300 lg:shadow ${isImmersive ? 'bottom-3' : 'bottom-22'}`}>

            <div className="h-0.5 w-full bg-gray-100">
                <div
                    className="h-full transition-[width] duration-200 ease-linear"
                    style={{ width: `${pct}%`, background: 'var(--accent)' }}
                />
            </div>

            <div className="flex items-center justify-between px-4 py-2">


            <div
                onClick={openPlayer}
                className="flex min-w-0 items-center gap-3 cursor-pointer">


                <MiniArtwork key={currentEpisode.id} thumbnail={currentEpisode.thumbnail} title={currentEpisode.title} isPlaying={isPlaying} />



                <div className="min-w-0">

                    <div className="flex items-center gap-1.5">
                        <p className="truncate text-md font-semibold text-gray-900">
                            {currentEpisode.title ?? 'Untitled'}
                        </p>
                        {isPlaying && (
                            <span className="shrink-0" style={{ color: 'var(--accent)' }}>
                                <EqualizerBars />
                            </span>
                        )}
                    </div>

                    {currentEpisode.scholar?.name && (
                        <p className="truncate text-xs text-gray-500">
                            {currentEpisode.scholar.name}
                        </p>
                    )}

                </div>

            </div>



            <div className="flex shrink-0 items-center gap-4 mr-5">

                <button onClick={(e) => { e.stopPropagation(); prev() }} className="text-gray-600 transition hover:text-gray-900" aria-label="Previous">

                    <RewindIcon size={18} strokeWidth={3}/>
                </button>


                <button
                    onClick={(e) => { e.stopPropagation(); togglePlay() }}
                    className="flex size-10 items-center justify-center rounded-full text-white transition-transform duration-150 hover:opacity-90 active:scale-90"
                    style={{ background: 'var(--accent)' }}
                    aria-label="Play or pause">
                    {isPlaying ? <Pause size={18} strokeWidth={3}/> : <Play size={18} strokeWidth={3}/>}
                </button>


                <button onClick={(e) => { e.stopPropagation(); next() }} className="text-gray-600 transition hover:text-gray-900" aria-label="Next">
                    <FastForwardIcon size={18} strokeWidth={3} />
                </button>

            </div>

            </div>
        </motion.div>
            )}
        </AnimatePresence>
    )
}

export default MiniPlayer
