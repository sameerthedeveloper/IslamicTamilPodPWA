import { Play, Pause, SkipBack, SkipForward } from 'lucide-react'
import { useQuranStore } from '../store/quranStore'
import { useActivePlayerStore } from '../store/activePlayerStore'
import EqualizerBars from './EqualizerBars'

function QuranMiniPlayer() {
    const currentSurah = useQuranStore((s) => s.currentSurah)
    const surahData = useQuranStore((s) => s.surahData)
    const currentAyah = useQuranStore((s) => s.currentAyah)
    const isPlaying = useQuranStore((s) => s.isPlaying)
    const togglePlay = useQuranStore((s) => s.togglePlay)
    const nextAyah = useQuranStore((s) => s.nextAyah)
    const prevAyah = useQuranStore((s) => s.prevAyah)
    const openPlayer = useQuranStore((s) => s.openPlayer)
    const active = useActivePlayerStore((s) => s.active)

    // Only one of {episode, Quran} mini players docks at a time — whichever
    // the user most recently engaged with.
    if (!currentSurah || active === 'episode') return null

    const total = surahData?.ayahs.length ?? currentSurah.ayatCount ?? 0
    const pct = total ? (currentAyah / total) * 100 : 0

    return (
        <div id="quran-mini-player"
            className="fixed inset-x-6 bottom-22 z-40 overflow-hidden rounded-full border border-gray-200 bg-white shadow-lg sm:left-1/2 sm:right-auto sm:w-full sm:max-w-[calc(32rem-3rem)] sm:-translate-x-1/2 lg:mx-10 lg:bottom-0 lg:mb-3  lg:left-64 lg:right-0 lg:w-auto lg:max-w-none lg:translate-x-0 lg:rounded-full lg:border lg:border-gray-300 lg:shadow">

            <div className="h-0.5 w-full bg-gray-100">
                <div
                    className="h-full transition-[width] duration-300 ease-linear"
                    style={{ width: `${pct}%`, background: 'var(--accent)' }}
                />
            </div>

            <div className="flex items-center justify-between px-4 py-2">

                <div
                    onClick={openPlayer}
                    className="flex min-w-0 items-center gap-3 cursor-pointer">

                    <div
                        className="font-display flex size-15 shrink-0 items-center justify-center rounded-3xl border border-gray-400 text-lg font-semibold text-white overflow-hidden"
                        style={{ background: 'linear-gradient(155deg, var(--accent), #0B5C55)' }}>
                        {currentSurah.nameAr ?? currentSurah.id}
                    </div>

                    <div className="min-w-0">

                        <div className="flex items-center gap-1.5">
                            <p className="truncate text-md font-semibold text-gray-900">
                                {currentSurah.nameEn}
                            </p>
                            {isPlaying && (
                                <span className="shrink-0" style={{ color: 'var(--accent)' }}>
                                    <EqualizerBars />
                                </span>
                            )}
                        </div>

                        <p className="truncate text-xs text-gray-500">
                            Ayah {currentAyah}{total ? ` of ${total}` : ''}
                        </p>

                    </div>

                </div>

                <div className="flex shrink-0 items-center gap-4 mr-5">

                    <button onClick={(e) => { e.stopPropagation(); prevAyah() }} className="text-gray-600 transition hover:text-gray-900" aria-label="Previous ayah">
                        <SkipBack size={18} strokeWidth={3} />
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); togglePlay() }}
                        className="flex size-10 items-center justify-center rounded-full text-white transition-transform duration-150 hover:opacity-90 active:scale-90"
                        style={{ background: 'var(--accent)' }}
                        aria-label="Play or pause">
                        {isPlaying ? <Pause size={18} strokeWidth={3} /> : <Play size={18} strokeWidth={3} />}
                    </button>

                    <button onClick={(e) => { e.stopPropagation(); nextAyah() }} className="text-gray-600 transition hover:text-gray-900" aria-label="Next ayah">
                        <SkipForward size={18} strokeWidth={3} />
                    </button>

                </div>

            </div>
        </div>
    )
}

export default QuranMiniPlayer
