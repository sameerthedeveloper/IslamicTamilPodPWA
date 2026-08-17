import React, { useEffect, useState } from 'react'
import { Plus, Inbox } from 'lucide-react'
import TopBar from '../components/TopBar'
import { topicsApi } from '../api/client'

function Topics() {
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    topicsApi.list().then(setTopics).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const add = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setError('')
    try {
      await topicsApi.create({ name: name.trim() })
      setName('')
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add topic.')
    }
  }

  return (
    <>
      <TopBar crumb="Content" title="Topics" />
      <main className="px-8 py-6 max-w-xl">
        <form onSubmit={add} className="mb-6 flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New topic name…"
            className="flex-1 rounded-md px-3 py-2 text-sm outline-none"
            style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
          />
          <button type="submit" className="flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold text-white" style={{ background: 'var(--accent)' }}>
            <Plus size={15} /> Add
          </button>
        </form>
        {error && <p className="mb-4 text-sm" style={{ color: 'var(--danger)' }}>{error}</p>}

        {loading ? (
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Loading…</p>
        ) : topics.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg py-16" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <Inbox size={22} style={{ color: 'var(--muted)' }} />
            <p className="text-sm" style={{ color: 'var(--muted)' }}>No topics yet.</p>
          </div>
        ) : (
          <div className="rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            {topics.map((t, i) => (
              <div
                key={t.id}
                className="flex items-center justify-between px-4 py-3"
                style={i < topics.length - 1 ? { borderBottom: '1px solid var(--border)' } : undefined}
              >
                <span className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{t.name}</span>
                <span className="font-data text-xs" style={{ color: 'var(--muted)' }}>{t.episodes?.length ?? 0} episodes</span>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}

export default Topics
