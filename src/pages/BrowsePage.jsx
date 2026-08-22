import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, Mic, BookOpen, GraduationCap, Users, Compass, X } from 'lucide-react'
import { getEpisodesByTopic, getScholars, search as searchApi } from '../api/client'
import TitleCard from '../components/Card/TitleCard'
import ListCard from '../components/Card/ListCard'
import TopicChip from '../components/Card/TopicChip'
import ScholarCard from '../components/Card/ScholarCard'
import ScholarListRow from '../components/Card/ScholarListRow'
import { motion, AnimatePresence } from 'framer-motion'

const ICONS = [Mic, BookOpen, GraduationCap, Users]

function SectionHeading({ children }) {
    return (
        <div className="flex items-center gap-2.5">
            <span className="h-4 w-1 rounded-full" style={{ background: 'var(--accent)' }} />
            <h2 className="font-display text-xl font-semibold text-gray-900">{children}</h2>
        </div>
    )
}

// Series results have nowhere to go yet (no series detail page), so they
// stay a plain, non-interactive row — scholars get the real ScholarListRow.
function SeriesRow({ item }) {
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

// A category match found by search — the chip (linking to the full
// TopicDetailPage) plus its episodes shown right here, since the person
// already typed the exact thing they were looking for.
function TopicResult({ topic, index }) {
    const navigate = useNavigate()
    const episodesQuery = useQuery({
        queryKey: ['topicEpisodes', topic.name],
        queryFn: () => getEpisodesByTopic(topic.name),
    })
    const episodes = episodesQuery.data ?? []

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <TopicChip
                name={topic.name}
                icon={ICONS[index % ICONS.length]}
                onClick={() => navigate(`/topics/${topic.id}`)}
            />

            <div className="mt-3 flex flex-col gap-2">
                {episodesQuery.isLoading && <p className="text-sm text-gray-500">Loading…</p>}
                {!episodesQuery.isLoading && episodes.length === 0 && (
                    <p className="text-sm text-gray-500">No lectures in this category yet.</p>
                )}
                {!episodesQuery.isLoading && episodes.slice(0, 5).map((ep, i) => (
                    <ListCard
                        key={ep.id}
                        index={i}
                        title={ep.title}
                        scholarName={ep.scholar?.name}
                        thumbnail={ep.thumbnail}
                        image={ep.title?.[0]}
                        episode={ep}
                        queue={episodes}
                    />
                ))}
                {episodes.length > 5 && (
                    <button
                        onClick={() => navigate(`/topics/${topic.id}`)}
                        className="mt-1 self-start text-sm font-medium" style={{ color: 'var(--accent)' }}>
                        See all {episodes.length} →
                    </button>
                )}
            </div>
        </div>
    )
}

function BrowsePage() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState(null)
    const [searching, setSearching] = useState(false)

    const isSearchActive = results !== null

    // Same query key as HomePage — switching Home <-> Discover reuses the
    // exact same cached scholars instead of refetching.
    const scholarsQuery = useQuery({ queryKey: ['scholars'], queryFn: getScholars })
    const scholars = scholarsQuery.data ?? []

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

    const episodeResults = results?.filter((r) => r.type === 'episode') ?? []
    const topicResults = results?.filter((r) => r.type === 'topic') ?? []
    const otherResults = results?.filter((r) => r.type !== 'episode' && r.type !== 'topic') ?? []

    return (
        <div className="px-5 pt-6 lg:mx-auto lg:max-w-5xl lg:px-10 lg:pt-10">

            <h1 className="font-display text-3xl font-semibold tracking-tight text-gray-900">
                Discover
            </h1>

            <p className="mt-2 text-gray-500">
                Search lectures, scholars, and categories.
            </p>

            <div className="my-4 flex items-center gap-3 rounded-full border border-gray-200 bg-white px-4 py-3 shadow-sm transition-shadow focus-within:shadow-md">
                <Search size={18} className="shrink-0 text-gray-400" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full bg-transparent outline-none ring-0 focus:outline-none focus:ring-0"
                    placeholder="Search lectures, scholars, categories…" />
                {query && (
                    <button onClick={() => setQuery('')} aria-label="Clear search" className="shrink-0 text-gray-400 hover:text-gray-600">
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* While a search is active, that's the only thing worth looking
                at — showing the full scholar browse below it too is just
                noise competing for attention with what the person actually
                asked for. */}
            {isSearchActive && (
                <div className="mt-2 animate-rise-in">
                    <h2 className="font-display text-lg font-semibold text-gray-900">
                        Results {!searching && `(${results.length})`}
                    </h2>

                    {searching && <p className="mt-2 text-sm text-gray-500">Searching…</p>}

                    {!searching && results.length === 0 && (
                        <div className="mt-3 flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4">
                            <Compass size={18} style={{ color: 'var(--muted)' }} />
                            <p className="text-sm text-gray-500">No results for "{query}". Try a category name, or a scholar's name.</p>
                        </div>
                    )}

                    {!searching && topicResults.length > 0 && (
                        <div className="mt-4 flex flex-col gap-3">
                            {topicResults.map((t, i) => (
                                <TopicResult key={t.id} topic={t} index={i} />
                            ))}
                        </div>
                    )}

                    {!searching && episodeResults.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-3">
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
                            {otherResults.map((r, i) => (
                                r.type === 'scholar'
                                    ? <ScholarListRow key={`${r.type}-${r.id}`} scholar={r} index={i} />
                                    : <SeriesRow key={`${r.type}-${r.id}`} item={r} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            <AnimatePresence>
                {!isSearchActive && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}>

                        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-dashed border-gray-300 bg-white/60 p-4">
                            <Compass size={18} className="shrink-0" style={{ color: 'var(--accent)' }} />
                            <p className="text-sm text-gray-500">Search for a category — like "Tafseer" or "Salah" — to browse lectures by topic.</p>
                        </div>

                        <div className="mt-8 pb-6">
                            <SectionHeading>Browse by scholar</SectionHeading>

                            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                                {scholarsQuery.isLoading && Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="flex h-50 flex-col rounded-2xl border border-gray-200 bg-white p-2">
                                        <div className="skeleton flex-1 rounded-xl" />
                                        <div className="skeleton mt-2 h-3.5 w-3/4 rounded-full" />
                                        <div className="skeleton mt-1.5 h-3 w-1/2 rounded-full" />
                                    </div>
                                ))}

                                {!scholarsQuery.isLoading && scholars.length === 0 && (
                                    <div className="col-span-full flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4">
                                        <Users size={18} style={{ color: 'var(--muted)' }} />
                                        <p className="text-sm text-gray-500">No scholars yet.</p>
                                    </div>
                                )}

                                {!scholarsQuery.isLoading && scholars.map((s, i) => (
                                    <ScholarCard key={s.id} scholar={s} index={i} />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    )
}

export default BrowsePage
