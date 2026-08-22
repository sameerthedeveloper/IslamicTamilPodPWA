import { useEffect, useState } from 'react'
import { Search, Mic, BookOpen, GraduationCap, Users, Compass, X } from 'lucide-react'
import { getTopics, getEpisodesByTopic, search as searchApi } from '../api/client'
import TitleCard from '../components/Card/TitleCard'
import ListCard from '../components/Card/ListCard'
import { useIncrementalReveal } from '../hooks/useIncrementalReveal'
import { motion, AnimatePresence } from 'framer-motion'

const ICONS = [Mic, BookOpen, GraduationCap, Users]

function ScholarSeriesRow({ item }) {
    return (
        <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-display text-sm font-semibold"
                style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
            >
                {(item.title || item.name)?.[0] ?? '?'}
            </div>
            <div className="min-w-0">
                <p className="truncate font-medium text-gray-900">{item.title || item.name}</p>
                <p className="text-xs capitalize" style={{ color: 'var(--muted)' }}>{item.type}</p>
            </div>
        </div>
    )
}

function BrowsePage() {
    const [topics, setTopics] = useState([])
    const [query, setQuery] = useState('')
    const [results, setResults] = useState(null)
    const [searching, setSearching] = useState(false)
    const [activeTopic, setActiveTopic] = useState(null)
    const [topicEpisodes, setTopicEpisodes] = useState([])
    const [topicLoading, setTopicLoading] = useState(false)

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
        setSearching(true)
        const timeout = setTimeout(() => {
            searchApi(query)
                .then((data) => {
                    if (!cancelled) setResults(data)
                })
                .catch(() => {
                    if (!cancelled) setResults([])
                })
                .finally(() => {
                    if (!cancelled) setSearching(false)
                })
        }, 300)
        return () => { cancelled = true; clearTimeout(timeout) }
    }, [query])

    const selectTopic = (name) => {
        if (activeTopic === name) {
            setActiveTopic(null)
            setTopicEpisodes([])
            return
        }
        setActiveTopic(name)
        setTopicLoading(true)
        getEpisodesByTopic(name)
            .then(setTopicEpisodes)
            .catch(() => setTopicEpisodes([]))
            .finally(() => setTopicLoading(false))
    }

    const episodeResults = results?.filter((r) => r.type === 'episode') ?? []
    const otherResults = results?.filter((r) => r.type !== 'episode') ?? []

    const { visibleCount, sentinelRef } = useIncrementalReveal(topicEpisodes.length, 20)
    const visibleTopicEpisodes = topicEpisodes.slice(0, visibleCount)

    return (
        <div className="px-5 pt-6 lg:mx-auto lg:max-w-5xl lg:px-10 lg:pt-10">

            <h1 className="font-display text-3xl font-semibold tracking-tight text-gray-900">
                Discover
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
                {query && (
                    <button onClick={() => setQuery('')} aria-label="Clear search" className="shrink-0 text-gray-400 hover:text-gray-600">
                        <X size={16} />
                    </button>
                )}
            </div>

            {results !== null && (
                <div className="mt-2 animate-rise-in">
                    <h2 className="font-display text-lg font-semibold text-gray-900">
                        Results {!searching && `(${results.length})`}
                    </h2>

                    {searching && <p className="mt-2 text-sm text-gray-500">Searching…</p>}

                    {!searching && results.length === 0 && (
                        <p className="mt-2 text-sm text-gray-500">No results for "{query}".</p>
                    )}

                    {!searching && episodeResults.length > 0 && (
                        <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                            {episodeResults.map((ep, i) => (
                                <TitleCard
                                    key={ep.id}
                                    index={i}
                                    title={ep.title}
                                    scholarName={ep.scholar?.name}
                                    thumbnail={ep.thumbnail}
                                    image={ep.title?.[0]}
                                    episode={ep}
                                    queue={episodeResults}
                                />
                            ))}
                        </div>
                    )}

                    {!searching && otherResults.length > 0 && (
                        <div className="mt-3 flex flex-col gap-2">
                            {otherResults.map((r) => (
                                <ScholarSeriesRow key={`${r.type}-${r.id}`} item={r} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="mt-8">

                <div className="flex items-center gap-2.5">
                    <span className="h-4 w-1 rounded-full" style={{ background: 'var(--accent)' }} />
                    <h2 className="font-display text-xl font-semibold text-gray-900">
                        Browse by category
                    </h2>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">

                    {topics.length === 0 && (
                        <div className="col-span-2 flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4">
                            <Compass size={18} style={{ color: 'var(--muted)' }} />
                            <p className="text-sm text-gray-500">No categories yet.</p>
                        </div>
                    )}

                    {topics.map((topic, i) => {
                        const Icon = ICONS[i % ICONS.length]
                        const active = activeTopic === topic.name
                        return (
                            <motion.button
                                key={topic.id ?? topic.name}
                                onClick={() => selectTopic(topic.name)}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ y: -3 }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ duration: 0.35, delay: Math.min(i, 8) * 0.05, ease: [0.16, 1, 0.3, 1] }}
                                className="rounded-2xl border p-4 text-left shadow-sm transition-shadow duration-200 hover:shadow-md"
                                style={{
                                    borderColor: active ? 'var(--accent)' : '#e5e7eb',
                                    background: active ? 'var(--accent-soft)' : 'white',
                                }}>

                                <div
                                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                                    style={{ background: active ? 'white' : 'var(--accent-soft)' }}
                                >
                                    <Icon size={18} style={{ color: 'var(--accent)' }} />
                                </div>

                                <p className="mt-3 font-medium text-gray-900">
                                    {topic.name}
                                </p>

                            </motion.button>
                        )
                    })}

                </div>

            </div>

            <AnimatePresence>
                {activeTopic && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="mt-8 overflow-hidden">
                        <div className="flex items-center gap-2.5">
                            <span className="h-4 w-1 rounded-full" style={{ background: 'var(--accent)' }} />
                            <h2 className="font-display text-xl font-semibold text-gray-900">{activeTopic}</h2>
                        </div>

                        <div className="mt-4 flex flex-col gap-2.5 pb-6">
                            {topicLoading && <p className="text-sm text-gray-500">Loading…</p>}
                            {!topicLoading && topicEpisodes.length === 0 && (
                                <p className="text-sm text-gray-500">No episodes in this category yet.</p>
                            )}
                            {!topicLoading && visibleTopicEpisodes.map((ep, i) => (
                                <ListCard
                                    key={ep.id}
                                    index={i}
                                    title={ep.title}
                                    scholarName={ep.scholar?.name}
                                    thumbnail={ep.thumbnail}
                                    image={ep.title?.[0]}
                                    episode={ep}
                                    queue={topicEpisodes}
                                />
                            ))}
                            {!topicLoading && <div ref={sentinelRef} className="h-1 w-1" aria-hidden="true" />}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    )
}

export default BrowsePage
