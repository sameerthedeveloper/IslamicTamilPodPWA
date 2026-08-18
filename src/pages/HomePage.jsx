import { useEffect, useState } from 'react'
import { CloudOff, Sparkles } from 'lucide-react'
import CardLayout from '../components/Card/CardLayout'
import TitleCard from '../components/Card/TitleCard'
import { getEpisodes } from '../api/client'

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

function HomePage() {
    const [episodes, setEpisodes] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        let cancelled = false
        getEpisodes()
            .then((data) => {
                if (!cancelled) setEpisodes(data?.data ?? [])
            })
            .catch(() => {
                if (!cancelled) setError(true)
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })
        return () => { cancelled = true }
    }, [])

    return (
        <main className="px-5 pb-52 pt-[calc(7rem+env(safe-area-inset-top))]">

            <h1 className="font-display text-3xl font-semibold tracking-tight text-gray-900">
                Assalamu Alaikum
            </h1>

            <p className="mt-2 text-gray-500">
                Listen to Tamil Islamic lectures and Quran recitations.
            </p>

            <CardLayout title="Continue Listening">
                {loading && Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
                {!loading && error && (
                    <EmptyRow icon={CloudOff} message="Couldn't load episodes." />
                )}
                {!loading && !error && episodes.length === 0 && (
                    <EmptyRow icon={Sparkles} message="Nothing here yet." />
                )}
                {!loading && !error && episodes.map((ep, i) => (
                    <TitleCard
                        key={ep.id}
                        index={i}
                        title={ep.title}
                        scholarName={ep.scholar?.name}
                        thumbnail={ep.thumbnail}
                        image={ep.title?.[0]}
                        episode={ep}
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
                {!loading && !error && [...episodes].reverse().map((ep, i) => (
                    <TitleCard
                        key={ep.id}
                        index={i}
                        title={ep.title}
                        scholarName={ep.scholar?.name}
                        thumbnail={ep.thumbnail}
                        image={ep.title?.[0]}
                        episode={ep}
                    />
                ))}
            </CardLayout>

        </main>
    )
}

export default HomePage
