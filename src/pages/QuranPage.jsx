import { useEffect, useState } from 'react'
import { BookMarked } from 'lucide-react'
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
    <main className="px-5 pb-52 pt-[calc(7rem+env(safe-area-inset-top))]">

                <h1 className="font-display text-3xl font-semibold tracking-tight text-gray-900">
                    Quran
                </h1>

                <p className="mt-2 text-gray-500">
                    Listen to Quran recitations.
                </p>

                {loading && (
                    <div className="mt-4 space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-4 rounded-3xl border border-gray-200 bg-white p-4">
                                <div className="skeleton h-14 w-14 shrink-0 rounded-full" />
                                <div className="flex-1">
                                    <div className="skeleton h-4 w-2/3 rounded-full" />
                                    <div className="skeleton mt-2 h-3 w-1/3 rounded-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && recitations.length === 0 && (
                    <div className="mt-8 flex flex-col items-center rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
                        <div
                            className="flex h-14 w-14 items-center justify-center rounded-full"
                            style={{ background: 'var(--accent-soft)' }}
                        >
                            <BookMarked size={24} style={{ color: 'var(--accent)' }} />
                        </div>
                        <p className="mt-4 text-sm text-gray-500">No recitations available yet.</p>
                    </div>
                )}

                {!loading && recitations.map((r, i) => (
                    <div key={r.id} onClick={() => play(r)} className="cursor-pointer">
                        <QuranCard title={r.title} subtitle={r.scholar?.name} index={i} />
                    </div>
                ))}

            </main>
  )
}

export default QuranPage
