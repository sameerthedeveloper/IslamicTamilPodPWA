import React, { useEffect, useState } from 'react'
import { BookX } from 'lucide-react'
import { getBookmarks, getHistory } from '../api/client'

function LibraryPage() {
  const [bookmarks, setBookmarks] = useState([])
  const [history, setHistory] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) return

    getBookmarks().then(setBookmarks).catch(() => setBookmarks([]))
    getHistory().then(setHistory).catch(() => setHistory([]))
  }, [])

  const isEmpty = bookmarks.length === 0 && history.length === 0

  return (
    <main className="px-5 pb-52 pt-28">

                <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
                    Library
                </h1>

                <p className="mt-2 text-gray-500">
                    Your saved Islamic content.
                </p>

                {isEmpty && (
                    <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 text-center">

                        <BookX size={32} className="mx-auto text-gray-400" />

                        <p className="mt-4 font-medium text-gray-900">
                            Your Library is Empty
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                            Save lectures and podcasts to find them here.
                        </p>

                    </div>
                )}

                {!isEmpty && bookmarks.length > 0 && (
                    <div className="mt-8">
                        <h2 className="text-lg font-semibold text-gray-900">Bookmarks</h2>
                        <div className="mt-4 flex flex-col gap-2">
                            {bookmarks.map((b) => (
                                <div key={b.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                                    <p className="font-medium text-gray-900">{b.episode?.title ?? b.title}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!isEmpty && history.length > 0 && (
                    <div className="mt-8">
                        <h2 className="text-lg font-semibold text-gray-900">History</h2>
                        <div className="mt-4 flex flex-col gap-2">
                            {history.map((h) => (
                                <div key={h.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                                    <p className="font-medium text-gray-900">{h.episode?.title ?? h.title}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </main>
  )
}

export default LibraryPage
