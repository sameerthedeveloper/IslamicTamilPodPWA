import React, { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { getTopics, search as searchApi } from '../api/client'

const ICONS = ['fa-microphone', 'fa-book-quran', 'fa-graduation-cap', 'fa-users']

function BrowsePage() {
    const [topics, setTopics] = useState([])
    const [query, setQuery] = useState('')
    const [results, setResults] = useState(null)

    useEffect(() => {
        getTopics()
            .then((data) => setTopics(Array.isArray(data) ? data : (data?.data ?? [])))
            .catch(() => setTopics([]))
    }, [])

    useEffect(() => {
        if (!query.trim()) {
            setResults(null)
            return
        }
        let cancelled = false
        const timeout = setTimeout(() => {
            searchApi(query)
                .then((data) => {
                    if (!cancelled) setResults(data)
                })
                .catch(() => {
                    if (!cancelled) setResults([])
                })
        }, 300)
        return () => { cancelled = true; clearTimeout(timeout) }
    }, [query])

    return (
        <main className="px-5 pb-52 pt-28">

            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
                Browse
            </h1>

            <p className="mt-2 text-gray-500">
                Explore Islamic content by category.
            </p>

            <div className="inset-x-2 border rounded-full p-3 my-4 bg-white border-gray-200 shadow flex justify-between items-center px-4">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full outline-none ring-0 focus:outline-none focus:ring-0"
                    placeholder="Search..." />
                <i className="fa-solid fa-magnifying-glass"></i>
                <Search/>

            </div>

            {results !== null && (
                <div className="mt-2">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Results
                    </h2>
                    {Array.isArray(results) && results.length === 0 && (
                        <p className="mt-2 text-sm text-gray-500">No results found.</p>
                    )}
                    <div className="mt-4 flex flex-col gap-2">
                        {Array.isArray(results) && results.map((r) => (
                            <div key={r.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                                <p className="font-medium text-gray-900">{r.title || r.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-8">

                <h2 className="text-lg font-semibold text-gray-900">
                    Browser By
                </h2>

                <div className="mt-4 grid grid-cols-2 gap-4">

                    {topics.length === 0 && (
                        <div className="col-span-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm text-center">
                            <p className="text-sm text-gray-500">No categories yet.</p>
                        </div>
                    )}

                    {topics.map((topic, i) => (
                        <div key={topic.id ?? topic.name} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

                            <i className={`fa-solid ${ICONS[i % ICONS.length]} text-xl`}></i>

                            <p className="mt-3 font-medium">
                                {topic.name}
                            </p>

                        </div>
                    ))}

                </div>

            </div>


        </main>
    )
}

export default BrowsePage
