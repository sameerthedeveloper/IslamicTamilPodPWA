import { useEffect, useState } from 'react'
import { Search, Mic, BookOpen, GraduationCap, Users, Compass } from 'lucide-react'
import { getTopics, search as searchApi } from '../api/client'

const ICONS = [Mic, BookOpen, GraduationCap, Users]

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

            <h1 className="font-display text-3xl font-semibold tracking-tight text-gray-900">
                Browse
            </h1>

            <p className="mt-2 text-gray-500">
                Explore Islamic content by category.
            </p>

            <div className="my-4 flex items-center gap-3 rounded-full border border-gray-200 bg-white px-4 py-3 shadow-sm transition-shadow focus-within:shadow-md">
                <Search size={18} className="shrink-0 text-gray-400" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full bg-transparent outline-none ring-0 focus:outline-none focus:ring-0"
                    placeholder="Search lectures, scholars, topics…" />
            </div>

            {results !== null && (
                <div className="mt-2 animate-rise-in">
                    <h2 className="font-display text-lg font-semibold text-gray-900">
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

                <div className="flex items-center gap-2.5">
                    <span className="h-4 w-1 rounded-full" style={{ background: 'var(--accent)' }} />
                    <h2 className="font-display text-xl font-semibold text-gray-900">
                        Browse by category
                    </h2>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">

                    {topics.length === 0 && (
                        <div className="col-span-2 flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4">
                            <Compass size={18} style={{ color: 'var(--muted)' }} />
                            <p className="text-sm text-gray-500">No categories yet.</p>
                        </div>
                    )}

                    {topics.map((topic, i) => {
                        const Icon = ICONS[i % ICONS.length]
                        return (
                            <div
                                key={topic.id ?? topic.name}
                                style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
                                className="animate-rise-in rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]">

                                <div
                                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                                    style={{ background: 'var(--accent-soft)' }}
                                >
                                    <Icon size={18} style={{ color: 'var(--accent)' }} />
                                </div>

                                <p className="mt-3 font-medium text-gray-900">
                                    {topic.name}
                                </p>

                            </div>
                        )
                    })}

                </div>

            </div>


        </main>
    )
}

export default BrowsePage
