import React from 'react'
import { Play,FastForwardIcon,RewindIcon } from 'lucide-react'

function MiniPlayer() {
    return (
        <div id="mini-player"
            className="fixed inset-x-10 bottom-24 z-40 flex items-center justify-between rounded-full border border-gray-200 bg-white px-4 py-2 shadow-lg">


            <div className="flex min-w-0 items-center gap-3">


                <div
                    className="flex size-15 shrink-0 items-center justify-center rounded-3xl border border-gray-400 bg-gray-500">
                    I
                </div>



                <div className="min-w-0">

                    <p className="truncate text-md font-semibold text-gray-900">
                        Title
                    </p>

                    <p className="truncate text-xs text-gray-500">
                        Scholar
                    </p>

                </div>

            </div>



            <div className="flex shrink-0 items-center gap-4 mr-5">

                <button className="text-gray-600 transition hover:text-gray-900" aria-label="Previous">

                    <RewindIcon size={18} strokeWidth={3}/>
                </button>


                <button
                    className="flex size-10 items-center justify-center rounded-full bg-gray-900 text-white transition hover:bg-gray-700"
                    aria-label="Play or pause">
                    <Play size={18} strokeWidth={3}/>
                </button>


                <button className="text-gray-600 transition hover:text-gray-900" aria-label="Next">
                    <FastForwardIcon size={18} strokeWidth={3} />
                </button>

            </div>

        </div>
    )
}

export default MiniPlayer