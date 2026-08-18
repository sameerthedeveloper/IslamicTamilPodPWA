import { useEffect, useState } from 'react'
import CardLayout from '../components/Card/CardLayout'
import TitleCard from '../components/Card/TitleCard'
import { getEpisodes } from '../api/client'

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
        <main className="px-5 pb-52 pt-28">

            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
                Assalamu Alaikum
            </h1>

            <p className="mt-2 text-gray-500">
                Listen to Tamil Islamic lectures and Quran recitations.
            </p>

            <CardLayout title="Continue Listening">
                {loading && (
                    <p className="text-sm text-gray-500">Loading...</p>
                )}
                {!loading && error && (
                    <div className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center">
                        <p className="text-sm text-gray-500">Couldn't load episodes.</p>
                    </div>
                )}
                {!loading && !error && episodes.length === 0 && (
                    <div className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center">
                        <p className="text-sm text-gray-500">Nothing here yet.</p>
                    </div>
                )}
                {!loading && !error && episodes.map((ep) => (
                    <TitleCard
                        key={ep.id}
                        id={ep.id}
                        title={ep.title}
                        scholarName={ep.scholar?.name}
                        thumbnail={ep.thumbnail}
                        image={ep.title?.[0]}
                        episode={ep}
                    />
                ))}
            </CardLayout>

            <CardLayout title="Discover">
                {loading && (
                    <p className="text-sm text-gray-500">Loading...</p>
                )}
                {!loading && error && (
                    <div className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center">
                        <p className="text-sm text-gray-500">Couldn't load episodes.</p>
                    </div>
                )}
                {!loading && !error && episodes.length === 0 && (
                    <div className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-center">
                        <p className="text-sm text-gray-500">Nothing here yet.</p>
                    </div>
                )}
                {!loading && !error && [...episodes].reverse().map((ep) => (
                    <TitleCard
                        key={ep.id}
                        id={ep.id}
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
