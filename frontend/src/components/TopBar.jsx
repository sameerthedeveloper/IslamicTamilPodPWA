import React from 'react'

function TopBar() {
  return (
        <header
            className="fixed inset-x-0 top-0 z-50 flex h-20 items-center justify-between border-b border-gray-200 bg-gray-100/95 px-5 shadow-sm backdrop-blur">


            <div>

                <p className="font-serif text-xl font-semibold text-gray-900">
                    Tamil Islamic Podcast
                </p>

                <p className="text-xs text-gray-500">
                    Learn • Listen • Reflect
                </p>

            </div>

            <button
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-100">
                U
            </button>

        </header>
  )
}

export default TopBar