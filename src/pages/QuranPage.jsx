import { useEffect, useState } from 'react'
import QuranCard from '../components/QuranCards/QuranCard'
import { getQuranRecitations } from '../api/client'
import { usePlayerStore } from '../store/playerStore'

function QuranPage() {
  const [recitations, setRecitations] = useState([])
  const [loading, setLoading] = useState(true)
  const play = usePlayerStore((s) => s.play)

  useEffect(() => {
    getQuranRecitations()
      .then(setRecitations)
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="px-5 pb-52 pt-28">

                <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
                    Quran
                </h1>

                <p className="mt-2 text-gray-500">
                    Listen to Quran recitations.
                </p>

                {loading && (
                    <p className="mt-8 text-sm text-gray-500">Loading...</p>
                )}

                {!loading && recitations.length === 0 && (
                    <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 text-center">
                        <p className="text-sm text-gray-500">No recitations available yet.</p>
                    </div>
                )}

                {!loading && recitations.map((r) => (
                    <div key={r.id} onClick={() => play(r)} className="cursor-pointer">
                        <QuranCard title={r.title} subtitle={r.scholar?.name} />
                    </div>
                ))}

            </main>
  )
}

export default QuranPage
