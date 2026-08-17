import React, { useEffect, useState } from 'react'
import { GripVertical, Plus, Trash2, Inbox } from 'lucide-react'
import TopBar from '../components/TopBar'
import FormModal from '../components/FormModal'
import SearchableSelect from '../components/SearchableSelect'
import { featuredApi, episodesApi } from '../api/client'

function Featured() {
  const [items, setItems] = useState([])
  const [episodes, setEpisodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [episodeId, setEpisodeId] = useState(null)
  const [dragIndex, setDragIndex] = useState(null)

  const load = () => {
    setLoading(true)
    Promise.all([featuredApi.list(), episodesApi.list(1, 100)])
      .then(([fe, ep]) => { setItems(fe ?? []); setEpisodes(ep.data ?? []) })
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const add = async () => {
    if (!episodeId) return
    await featuredApi.create({ episodeId })
    setModalOpen(false)
    setEpisodeId(null)
    load()
  }

  const remove = async (item) => {
    await featuredApi.remove(item.id)
    load()
  }

  const persistOrder = async (next) => {
    setItems(next)
    await Promise.all(next.map((item, i) => featuredApi.update(item.id, { position: i })))
  }

  const onDrop = (index) => {
    if (dragIndex === null || dragIndex === index) return
    const next = [...items]
    const [moved] = next.splice(dragIndex, 1)
    next.splice(index, 0, moved)
    setDragIndex(null)
    persistOrder(next)
  }

  return (
    <>
      <TopBar crumb="Content" title="Featured" />
      <main className="max-w-2xl px-8 py-6">
        <div className="mb-4 flex justify-end">
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold text-white" style={{ background: 'var(--accent)' }}>
            <Plus size={15} /> Add episode
          </button>
        </div>

        {loading ? (
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Loading…</p>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg py-16" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <Inbox size={22} style={{ color: 'var(--muted)' }} />
            <p className="text-sm" style={{ color: 'var(--muted)' }}>Nothing featured yet.</p>
          </div>
        ) : (
          <div className="rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            {items.map((item, i) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(i)}
                className="flex items-center gap-3 px-4 py-3"
                style={i < items.length - 1 ? { borderBottom: '1px solid var(--border)' } : undefined}
              >
                <GripVertical size={15} className="cursor-grab" style={{ color: 'var(--muted)' }} />
                <span className="font-data text-xs" style={{ color: 'var(--muted)' }}>{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium" style={{ color: 'var(--ink)' }}>{item.episode?.title ?? `Episode #${item.episodeId}`}</p>
                  <p className="truncate text-xs" style={{ color: 'var(--muted)' }}>{item.episode?.scholar?.name}</p>
                </div>
                <button onClick={() => remove(item)} className="rounded p-1.5" style={{ color: 'var(--danger)' }}><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        )}
      </main>

      <FormModal
        open={modalOpen}
        title="Add featured episode"
        onClose={() => setModalOpen(false)}
        onSubmit={add}
        submitLabel="Add"
        submitDisabled={!episodeId}
      >
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Episode</label>
          <SearchableSelect options={episodes} value={episodeId} onChange={setEpisodeId} getLabel={(e) => e.title} placeholder="Choose episode…" />
        </div>
      </FormModal>
    </>
  )
}

export default Featured
