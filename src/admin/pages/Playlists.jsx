import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, GripVertical, X } from 'lucide-react'
import TopBar from '../components/TopBar'
import DataTable from '../components/DataTable'
import StatusPill from '../components/StatusPill'
import FormModal from '../components/FormModal'
import SearchableSelect from '../components/SearchableSelect'
import { playlistsApi, episodesApi } from '../api/client'

const STATUSES = ['DRAFT', 'PUBLISHED', 'UNPUBLISHED']
const emptyForm = { id: null, title: '', description: '', status: 'DRAFT', episodeIds: [] }

function Playlists() {
  const [playlists, setPlaylists] = useState([])
  const [episodes, setEpisodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [addEpisodeId, setAddEpisodeId] = useState(null)
  const [dragIndex, setDragIndex] = useState(null)
  const [error, setError] = useState('')

  const episodeById = (id) => episodes.find((e) => e.id === id)

  const load = () => {
    setLoading(true)
    Promise.all([playlistsApi.list(), episodesApi.list(1, 100)])
      .then(([pl, ep]) => { setPlaylists(pl ?? []); setEpisodes(ep.data ?? []) })
      .finally(() => setLoading(false))
  }
  // Deferred a tick so this isn't a synchronous setState-in-effect.
  useEffect(() => { queueMicrotask(load) }, [])

  const openCreate = () => { setForm(emptyForm); setAddEpisodeId(null); setError(''); setModalOpen(true) }
  const openEdit = (p) => {
    setForm({ id: p.id, title: p.title, description: p.description ?? '', status: p.status, episodeIds: p.episodeIds ?? [] })
    setAddEpisodeId(null)
    setError('')
    setModalOpen(true)
  }

  const addEpisode = () => {
    if (!addEpisodeId || form.episodeIds.includes(addEpisodeId)) return
    setForm((f) => ({ ...f, episodeIds: [...f.episodeIds, addEpisodeId] }))
    setAddEpisodeId(null)
  }

  const removeEpisode = (id) => {
    setForm((f) => ({ ...f, episodeIds: f.episodeIds.filter((eid) => eid !== id) }))
  }

  const onDrop = (index) => {
    if (dragIndex === null || dragIndex === index) return
    setForm((f) => {
      const next = [...f.episodeIds]
      const [moved] = next.splice(dragIndex, 1)
      next.splice(index, 0, moved)
      return { ...f, episodeIds: next }
    })
    setDragIndex(null)
  }

  const submit = async () => {
    if (!form.title.trim()) return
    setError('')
    // Firestore's addDoc/updateDoc reject `undefined` field values outright
    // (the whole write throws) — use null for "not set" instead.
    const payload = {
      title: form.title.trim(),
      description: form.description || null,
      status: form.status,
      episodeIds: form.episodeIds,
    }
    try {
      if (form.id) await playlistsApi.update(form.id, payload)
      else await playlistsApi.create(payload)
      setModalOpen(false)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed.')
    }
  }

  const remove = async (p) => {
    if (!confirm(`Delete "${p.title}"?`)) return
    await playlistsApi.remove(p.id)
    load()
  }

  const unusedEpisodes = episodes.filter((e) => !form.episodeIds.includes(e.id))

  return (
    <>
      <TopBar crumb="Content" title="Playlists" />
      <main className="px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
        <div className="mb-4 flex justify-end">
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white"
            style={{ background: 'var(--accent)' }}
          >
            <Plus size={15} /> New playlist
          </button>
        </div>

        {loading ? (
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Loading…</p>
        ) : (
          <DataTable
            rows={playlists}
            emptyLabel="No playlists yet."
            columns={[
              { key: 'title', label: 'Title', sortable: true },
              { key: 'episodeIds', label: 'Episodes', render: (r) => r.episodeIds?.length ?? 0 },
              { key: 'status', label: 'Status', render: (r) => <StatusPill status={r.status} /> },
              {
                key: 'actions',
                label: '',
                render: (r) => (
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(r)} className="rounded p-1.5" style={{ color: 'var(--muted)' }}><Pencil size={15} /></button>
                    <button onClick={() => remove(r)} className="rounded p-1.5" style={{ color: 'var(--danger)' }}><Trash2 size={15} /></button>
                  </div>
                ),
              },
            ]}
          />
        )}
      </main>

      <FormModal
        open={modalOpen}
        title={form.id ? 'Edit playlist' : 'New playlist'}
        onClose={() => setModalOpen(false)}
        onSubmit={submit}
        submitLabel={form.id ? 'Save changes' : 'Create playlist'}
        submitHint={error}
      >
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Title</label>
          <input
            required
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full rounded-xl px-3 py-2 text-sm outline-none"
            style={{ border: '1px solid var(--border)' }}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Description (optional)</label>
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full rounded-xl px-3 py-2 text-sm outline-none"
            style={{ border: '1px solid var(--border)' }}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            className="select-field w-full rounded-xl px-3 py-2 text-sm outline-none"
            style={{ border: '1px solid var(--border)' }}
          >
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Episodes</label>
          <div className="flex gap-2">
            <div className="flex-1">
              <SearchableSelect
                options={unusedEpisodes}
                value={addEpisodeId}
                onChange={setAddEpisodeId}
                getLabel={(e) => e.title}
                placeholder="Choose episode to add…"
              />
            </div>
            <button
              type="button"
              onClick={addEpisode}
              disabled={!addEpisodeId}
              className="rounded-xl px-3 py-2 text-sm font-semibold text-white disabled:opacity-40"
              style={{ background: 'var(--accent)' }}
            >
              Add
            </button>
          </div>

          {form.episodeIds.length > 0 && (
            <p className="mt-2 text-[11px]" style={{ color: 'var(--muted)' }}>Drag to set play order.</p>
          )}

          <div className="mt-2 rounded-2xl" style={{ border: form.episodeIds.length ? '1px solid var(--border)' : 'none' }}>
            {form.episodeIds.map((id, i) => {
              const ep = episodeById(id)
              return (
                <div
                  key={id}
                  draggable
                  onDragStart={() => setDragIndex(i)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => onDrop(i)}
                  className="flex items-center gap-2 px-3 py-2"
                  style={i < form.episodeIds.length - 1 ? { borderBottom: '1px solid var(--border)' } : undefined}
                >
                  <GripVertical size={14} className="cursor-grab" style={{ color: 'var(--muted)' }} />
                  <span className="font-data text-xs" style={{ color: 'var(--muted)' }}>{i + 1}</span>
                  <p className="min-w-0 flex-1 truncate text-sm" style={{ color: 'var(--ink)' }}>
                    {ep?.title ?? `Episode #${id}`}
                  </p>
                  <button type="button" onClick={() => removeEpisode(id)} style={{ color: 'var(--danger)' }}>
                    <X size={14} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </FormModal>
    </>
  )
}

export default Playlists
