import { Play, Pause, FastForwardIcon, RewindIcon } from 'lucide-react'
import { usePlayerStore } from '../store/playerStore'

function MiniPlayer() {
    const currentEpisode = usePlayerStore((s) => s.currentEpisode)
    const isPlaying = usePlayerStore((s) => s.isPlaying)
    const togglePlay = usePlayerStore((s) => s.togglePlay)
    const next = usePlayerStore((s) => s.next)
    const prev = usePlayerStore((s) => s.prev)
    const openPlayer = usePlayerStore((s) => s.openPlayer)

    if (!currentEpisode) return null

    return (
        <div id="mini-player"
            className="fixed inset-x-6 bottom-22 z-40 flex items-center justify-between rounded-full border border-gray-200 bg-white px-4 py-2 shadow-lg">


            <div
                onClick={openPlayer}
                className="flex min-w-0 items-center gap-3 cursor-pointer">


                <div
                    className="font-display flex size-15 shrink-0 items-center justify-center rounded-3xl border border-gray-400 text-lg font-semibold text-white overflow-hidden"
                    style={{ background: 'linear-gradient(155deg, var(--accent), #0B5C55)' }}>
                    {currentEpisode.thumbnail ? (
                        <img src={currentEpisode.thumbnail} alt="" className="h-full w-full object-cover" />
                    ) : (
                        currentEpisode.title?.[0] ?? 'I'
                    )}
                </div>



                <div className="min-w-0">

                    <p className="truncate text-md font-semibold text-gray-900">
                        {currentEpisode.title ?? 'Title'}
                    </p>

                    <p className="truncate text-xs text-gray-500">
                        {currentEpisode.scholar?.name ?? 'Scholar'}
                    </p>

                </div>

            </div>



            <div className="flex shrink-0 items-center gap-4 mr-5">

                <button onClick={(e) => { e.stopPropagation(); prev() }} className="text-gray-600 transition hover:text-gray-900" aria-label="Previous">

                    <RewindIcon size={18} strokeWidth={3}/>
                </button>


                <button
                    onClick={(e) => { e.stopPropagation(); togglePlay() }}
                    className="flex size-10 items-center justify-center rounded-full text-white transition hover:opacity-90"
                    style={{ background: 'var(--accent)' }}
                    aria-label="Play or pause">
                    {isPlaying ? <Pause size={18} strokeWidth={3}/> : <Play size={18} strokeWidth={3}/>}
                </button>


                <button onClick={(e) => { e.stopPropagation(); next() }} className="text-gray-600 transition hover:text-gray-900" aria-label="Next">
                    <FastForwardIcon size={18} strokeWidth={3} />
                </button>

            </div>

        </div>
    )
}

export default MiniPlayer
