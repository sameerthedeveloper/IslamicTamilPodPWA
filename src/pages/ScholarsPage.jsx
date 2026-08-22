import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, CloudOff, Sparkles } from 'lucide-react'
import { getScholars, getScholarById, getEpisodes, getEpisodesByScholarId } from '../api/client'
import ListCard from '../components/Card/ListCard'
import ScholarCard from '../components/Card/ScholarCard'
import { useImageFallback } from '../hooks/useImageFallback'
import { useIncrementalReveal } from '../hooks/useIncrementalReveal'

function ScholarPortrait({ scholar }) {
    const { failed, onError } = useImageFallback()
    const showImage = scholar.image && !failed
    return (
        <div
            className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full"
            style={{ background: 'var(--accent-soft)' }}>
            {showImage ? (
                <img src={scholar.image} alt={scholar.name} loading="lazy" decoding="async" onError={onError} className="h-full w-full object-cover" />
            ) : (
                <span className="font-display text-xl font-semibold" style={{ color: 'var(--accent)' }}>
                    {scholar.name?.[0] ?? '?'}
                </span>
            )}
        </div>
    )
}

function ScholarDetail({ scholarId }) {
    const navigate = useNavigate()

    const scholarQuery = useQuery({
        queryKey: ['scholar', scholarId],
        queryFn: () => getScholarById(scholarId),
    })
    const episodesQuery = useQuery({
        queryKey: ['episodesByScholar', scholarId],
        queryFn: () => getEpisodesByScholarId(scholarId),
    })

    const scholar = scholarQuery.data
    const episodes = episodesQuery.data ?? []
    const loading = scholarQuery.isLoading || episodesQuery.isLoading
    const error = scholarQuery.isError || episodesQuery.isError

    const { visibleCount, sentinelRef } = useIncrementalReveal(episodes.length, 20)
    const visibleEpisodes = episodes.slice(0, visibleCount)

    return (
        <div className="px-5 pt-6 lg:mx-auto lg:max-w-5xl lg:px-10 lg:pt-10">
            <button
                onClick={() => navigate('/scholars')}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900">
                <ArrowLeft size={16} /> Scholars
            </button>

            {loading && <p className="mt-6 text-sm text-gray-500">Loading…</p>}

            {!loading && error && (
                <div className="mt-6 flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4">
                    <CloudOff size={18} style={{ color: 'var(--muted)' }} />
                    <p className="text-sm text-gray-500">Couldn't load this scholar.</p>
                </div>
            )}

            {!loading && !error && scholar && (
                <>
                    <div className="mt-4 flex items-center gap-4">
                        <ScholarPortrait scholar={scholar} />
                        <div className="min-w-0">
                            <h1 className="font-display text-2xl font-semibold tracking-tight text-gray-900">
                                {scholar.name}
                            </h1>
                            <p className="text-sm text-gray-500">{episodes.length} lecture{episodes.length === 1 ? '' : 's'}</p>
                        </div>
                    </div>

                    {scholar.biography && (
                        <p className="mt-4 text-sm text-gray-600">{scholar.biography}</p>
                    )}

                    <div className="mt-6 flex flex-col gap-2.5 pb-6">
                        {episodes.length === 0 && (
                            <p className="text-sm text-gray-500">No lectures from this scholar yet.</p>
                        )}
                        {visibleEpisodes.map((ep, i) => (
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
                        <div ref={sentinelRef} className="h-1 w-1" aria-hidden="true" />
                    </div>
                </>
            )}
        </div>
    )
}

function ScholarsPage() {
    const { scholarId } = useParams()

    // Same ['scholars']/['episodes'] cache keys as Home/Browse — arriving
    // here from either already has this data loaded, no refetch.
    const scholarsQuery = useQuery({ queryKey: ['scholars'], queryFn: getScholars, enabled: !scholarId })
    const episodesQuery = useQuery({ queryKey: ['episodes'], queryFn: () => getEpisodes(), enabled: !scholarId })

    const scholars = scholarsQuery.data ?? []
    const loading = scholarsQuery.isLoading || episodesQuery.isLoading
    const error = scholarsQuery.isError || episodesQuery.isError

    const episodeCounts = {}
    for (const ep of episodesQuery.data?.data ?? []) {
        if (!ep.scholarId) continue
        episodeCounts[ep.scholarId] = (episodeCounts[ep.scholarId] ?? 0) + 1
    }

    if (scholarId) return <ScholarDetail scholarId={scholarId} />

    return (
        <div className="px-5 pt-6 lg:mx-auto lg:max-w-5xl lg:px-10 lg:pt-10">

            <h1 className="font-display text-3xl font-semibold tracking-tight text-gray-900">
                Scholars
            </h1>

            <p className="mt-2 text-gray-500">
                Browse lectures by scholar.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 pb-6 sm:grid-cols-3 lg:grid-cols-4">
                {loading && Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex h-50 flex-col rounded-2xl border border-gray-200 bg-white p-2">
                        <div className="skeleton flex-1 rounded-xl" />
                        <div className="skeleton mt-2 h-3.5 w-3/4 rounded-full" />
                        <div className="skeleton mt-1.5 h-3 w-1/2 rounded-full" />
                    </div>
                ))}

                {!loading && error && (
                    <div className="col-span-full flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4">
                        <CloudOff size={18} style={{ color: 'var(--muted)' }} />
                        <p className="text-sm text-gray-500">Couldn't load scholars.</p>
                    </div>
                )}

                {!loading && !error && scholars.length === 0 && (
                    <div className="col-span-full flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4">
                        <Sparkles size={18} style={{ color: 'var(--muted)' }} />
                        <p className="text-sm text-gray-500">No scholars yet.</p>
                    </div>
                )}

                {!loading && !error && scholars.map((s, i) => (
                    <ScholarCard key={s.id} scholar={s} index={i} episodeCount={episodeCounts[s.id] ?? 0} />
                ))}
            </div>

        </div>
    )
}

export default ScholarsPage
