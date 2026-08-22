import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, CloudOff, Compass } from 'lucide-react'
import { getTopicById, getEpisodesByTopic } from '../api/client'
import ListCard from '../components/Card/ListCard'
import { useIncrementalReveal } from '../hooks/useIncrementalReveal'

// Same shape as ScholarsPage's detail view — a back button, an identity
// header, then the full episode list — so browsing by topic feels like
// the same app as browsing by scholar, not a bolted-on second pattern.
function TopicDetailPage() {
    const { topicId } = useParams()
    const navigate = useNavigate()

    const topicQuery = useQuery({
        queryKey: ['topic', topicId],
        queryFn: () => getTopicById(topicId),
    })
    const topic = topicQuery.data

    const episodesQuery = useQuery({
        queryKey: ['topicEpisodes', topic?.name],
        queryFn: () => getEpisodesByTopic(topic.name),
        enabled: !!topic?.name,
    })
    const episodes = episodesQuery.data ?? []
    const loading = topicQuery.isLoading || (!!topic && episodesQuery.isLoading)
    const error = topicQuery.isError || episodesQuery.isError

    const { visibleCount, sentinelRef } = useIncrementalReveal(episodes.length, 20)
    const visibleEpisodes = episodes.slice(0, visibleCount)

    return (
        <div className="px-5 pt-6 lg:mx-auto lg:max-w-5xl lg:px-10 lg:pt-10">
            <button
                onClick={() => navigate('/browse')}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900">
                <ArrowLeft size={16} /> Discover
            </button>

            {loading && <p className="mt-6 text-sm text-gray-500">Loading…</p>}

            {!loading && (error || !topic) && (
                <div className="mt-6 flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4">
                    <CloudOff size={18} style={{ color: 'var(--muted)' }} />
                    <p className="text-sm text-gray-500">Couldn't load this category.</p>
                </div>
            )}

            {!loading && !error && topic && (
                <>
                    <div className="mt-4 flex items-center gap-4">
                        <div
                            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full"
                            style={{ background: 'var(--accent-soft)' }}>
                            <Compass size={26} style={{ color: 'var(--accent)' }} />
                        </div>
                        <div className="min-w-0">
                            <h1 className="font-display text-2xl font-semibold tracking-tight text-gray-900">
                                {topic.name}
                            </h1>
                            <p className="text-sm text-gray-500">{episodes.length} lecture{episodes.length === 1 ? '' : 's'}</p>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-2.5 pb-6">
                        {episodes.length === 0 && (
                            <p className="text-sm text-gray-500">No lectures in this category yet.</p>
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

export default TopicDetailPage
