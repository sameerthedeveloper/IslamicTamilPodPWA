import React from 'react'

function LibraryPage() {
  return (
    <main className="px-5 pb-52 pt-28">

                <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
                    Library
                </h1>

                <p className="mt-2 text-gray-500">
                    Your saved Islamic content.
                </p>



                <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 text-center">

                    <i className="fa-solid fa-book text-3xl text-gray-400"></i>

                    <p className="mt-4 font-medium text-gray-900">
                        Your Library is Empty
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                        Save lectures and podcasts to find them here.
                    </p>

                </div>

            </main>
  )
}

export default LibraryPage