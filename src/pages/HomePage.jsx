import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CloudOff, Sparkles, Mic, BookOpen, GraduationCap, Users } from 'lucide-react'
import CardLayout from '../components/Card/CardLayout'
import TitleCard from '../components/Card/TitleCard'
import FeaturedCard from '../components/Card/FeaturedCard'
import TopicChip from '../components/Card/TopicChip'
import ScholarSpotlightCard from '../components/Card/ScholarSpotlightCard'
import { getEpisodes, getHistory, getTopics, getScholars } from '../api/client'
import { useUserStore } from '../store/userStore'
import { useIncrementalReveal } from '../hooks/useIncrementalReveal'

const TOPIC_ICONS = [Mic, BookOpen, GraduationCap, Users]

function CardSkeleton() {
    return (
        <div className="flex h-60 w-40 shrink-0 flex-col rounded-2xl border border-gray-200 bg-white p-2">
            <div className="skeleton flex-1 rounded-xl" />
            <div className="skeleton mt-2 h-3.5 w-3/4 rounded-full" />
            <div className="skeleton mt-1.5 h-3 w-1/2 rounded-full" />
        </div>
    )
}

function EmptyRow({ icon: Icon, message }) {
    return (
        <div className="flex w-full items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4">
            <Icon size={18} className="shrink-0" style={{ color: 'var(--muted)' }} />
            <p className="text-sm text-gray-500">{message}</p>
        </div>
    )
}

function historyToEpisode(h) {
    return {
        id: h.episodeId,
        title: h.title,
        thumbnail: h.thumbnail,
        scholar: { name: h.scholarName },
        youtubeId: h.youtubeId,
        audioUrl: h.audioUrl,
        currentTime: h.currentTime,
        duration: h.duration,
    }
}

function HomePage() {
    const navigate = useNavigate()
    const authStatus = useUserStore((s) => s.status)
    const uid = useUserStore((s) => s.user?.uid)

    // Cached by TanStack Query — switching tabs unmounts this page (React
    // Router only renders the active route), so without a cache outliving
    // the component this whole screen refetched from Firestore on every
    // single visit. Now a remounted Home reads the cached result instantly.
    const episodesQuery = useQuery({ queryKey: ['episodes'], queryFn: () => getEpisodes() })
    const topicsQuery = useQuery({
        queryKey: ['topics'],
        queryFn: async () => {
            const data = await getTopics()
            return Array.isArray(data) ? data : (data?.data ?? [])
        },
    })
    const scholarsQuery = useQuery({ queryKey: ['scholars'], queryFn: getScholars })
    const historyQuery = useQuery({
        queryKey: ['history', uid],
        queryFn: getHistory,
        enabled: authStatus === 'ready',
    })

    const episodes = episodesQuery.data?.data ?? []
    const topics = topicsQuery.data ?? []
    const scholars = scholarsQuery.data ?? []
    const continueListening = (historyQuery.data ?? []).map(historyToEpisode)

    const loading = episodesQuery.isLoading
    const error = episodesQuery.isError
    const historyLoading = historyQuery.isLoading
    const historyError = historyQuery.isError

    const discoverEpisodes = [...episodes].reverse()
    const { visibleCount, sentinelRef } = useIncrementalReveal(discoverEpisodes.length, 16)
    const visibleDiscover = discoverEpisodes.slice(0, visibleCount)

    // Spotlight the most-lectured scholar — a genuine "most active" signal
    // computed from what's already fetched, not a random or hardcoded pick.
    const scholarEpisodeCounts = {}
    for (const ep of episodes) {
        if (ep.scholarId) scholarEpisodeCounts[ep.scholarId] = (scholarEpisodeCounts[ep.scholarId] ?? 0) + 1
    }
    const spotlightScholar = scholars.length
        ? [...scholars].sort((a, b) => (scholarEpisodeCounts[b.id] ?? 0) - (scholarEpisodeCounts[a.id] ?? 0))[0]
        : null

    return (
        <div className="px-5 pt-6 lg:mx-auto lg:max-w-5xl lg:px-10 lg:pt-1">

            <h1 className="font-display text-3xl font-semibold tracking-tight text-gray-900">
                Assalamu Alaikum
            </h1>

            <p className="mt-2 text-gray-500">
                Listen to Tamil Islamic lectures and Quran recitations.
            </p>

            {topics.length > 0 && (
                <div
                    className="mt-4 flex gap-2 overflow-x-auto overflow-y-hidden pb-1 scrollbar-hide"
                    style={{ touchAction: 'pan-x', overscrollBehaviorX: 'contain' }}>
                    {topics.map((topic, i) => (
                        <TopicChip
                            key={topic.id ?? topic.name}
                            name={topic.name}
                            icon={TOPIC_ICONS[i % TOPIC_ICONS.length]}
                            index={i}
                            onClick={() => navigate(`/topics/${topic.id}`)}
                        />
                    ))}
                </div>
            )}

            <CardLayout title="Featured">
                {loading && Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
                {!loading && error && (
                    <EmptyRow icon={CloudOff} message="Couldn't load episodes." />
                )}
                {!loading && !error && episodes.length === 0 && (
                    <EmptyRow icon={Sparkles} message="Nothing here yet." />
                )}
                {!loading && !error && [...episodes].reverse().slice(0, 6).map((ep, i, arr) => (
                    <FeaturedCard
                        key={ep.id}
                        index={i}
                        title={ep.title}
                        scholarName={ep.scholar?.name}
                        thumbnail={ep.thumbnail}
                        image={ep.title?.[0]}
                        episode={ep}
                        queue={arr}
                    />
                ))}
            </CardLayout>

            {spotlightScholar && (
                <div className="mt-8">
                    <ScholarSpotlightCard
                        scholar={spotlightScholar}
                        episodeCount={scholarEpisodeCounts[spotlightScholar.id] ?? 0}
                    />
                </div>
            )}

            <CardLayout title="Continue Listening">
                {historyLoading && Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
                {!historyLoading && historyError && (
                    <EmptyRow icon={CloudOff} message="Couldn't load your history." />
                )}
                {!historyLoading && !historyError && continueListening.length === 0 && (
                    <EmptyRow icon={Sparkles} message="Nothing here yet." />
                )}
                {!historyLoading && !historyError && continueListening.map((ep, i) => (
                    <TitleCard
                        key={ep.id}
                        index={i}
                        title={ep.title}
                        scholarName={ep.scholar?.name}
                        thumbnail={ep.thumbnail}
                        image={ep.title?.[0]}
                        episode={ep}
                        queue={continueListening}
                    />
                ))}
            </CardLayout>

            <CardLayout title="Discover">
                {loading && Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
                {!loading && error && (
                    <EmptyRow icon={CloudOff} message="Couldn't load episodes." />
                )}
                {!loading && !error && episodes.length === 0 && (
                    <EmptyRow icon={Sparkles} message="Nothing here yet." />
                )}
                {!loading && !error && visibleDiscover.map((ep, i) => (
                    <TitleCard
                        key={ep.id}
                        index={i}
                        title={ep.title}
                        scholarName={ep.scholar?.name}
                        thumbnail={ep.thumbnail}
                        image={ep.title?.[0]}
                        episode={ep}
                        queue={discoverEpisodes}
                    />
                ))}
                {!loading && !error && <div ref={sentinelRef} className="h-1 w-1 shrink-0" aria-hidden="true" />}
            </CardLayout>

        </div>
    )
}

export default HomePage
