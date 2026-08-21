import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, ListOrdered, GripVertical } from 'lucide-react'
import TopBar from '../components/TopBar'
import DataTable from '../components/DataTable'
import StatusPill from '../components/StatusPill'
import FormModal from '../components/FormModal'
import SearchableSelect from '../components/SearchableSelect'
import ImageUpload from '../components/ImageUpload'
import { seriesApi, scholarsApi, episodesApi } from '../api/client'

const STATUSES = ['DRAFT', 'PUBLISHED', 'UNPUBLISHED', 'ARCHIVED']
const emptyForm = { id: null, title: '', scholarId: '', description: '', status: 'DRAFT' }

function Series() {
  const [series, setSeries] = useState([])
  const [scholars, setScholars] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [reorderSeries, setReorderSeries] = useState(null)
  const [reorderEpisodes, setReorderEpisodes] = useState([])
  const [dragIndex, setDragIndex] = useState(null)

  const load = () => {
    setLoading(true)
    Promise.all([seriesApi.list(1, 100), scholarsApi.list()])
      .then(([se, sc]) => { setSeries(se.data ?? []); setScholars(sc ?? []) })
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const openCreate = () => { setForm(emptyForm); setError(''); setModalOpen(true) }
  const openEdit = (s) => { setForm({ id: s.id, title: s.title, scholarId: s.scholarId, description: s.description ?? '', status: s.status }); setError(''); setModalOpen(true) }

  const submit = async () => {
    setError('')
    // Firestore's addDoc/updateDoc reject `undefined` field values outright
    // (the whole write throws) — use null for "not set" instead.
    const payload = { title: form.title, scholarId: form.scholarId, description: form.description || null, status: form.status }
    try {
      if (form.id) await seriesApi.update(form.id, payload)
      else await seriesApi.create(payload)
      setModalOpen(false)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed.')
    }
  }

  const remove = async (s) => {
    if (!confirm(`Delete "${s.title}"?`)) return
    await seriesApi.remove(s.id)
    load()
  }

  // Drag-reorder the episodes within one series — sets each episode's
  // `position` so the public app's card grid follows series order instead
  // of recency for episodes that belong together.
  const openReorder = async (s) => {
    setReorderSeries(s)
    const all = await episodesApi.list(1, 200)
    const inSeries = (all.data ?? [])
      .filter((ep) => ep.seriesId === s.id)
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    setReorderEpisodes(inSeries)
  }

  const persistReorder = async (next) => {
    setReorderEpisodes(next)
    await Promise.all(next.map((ep, i) => episodesApi.update(ep.id, { position: i })))
  }

  const onReorderDrop = (index) => {
    if (dragIndex === null || dragIndex === index) return
    const next = [...reorderEpisodes]
    const [moved] = next.splice(dragIndex, 1)
    next.splice(index, 0, moved)
    setDragIndex(null)
    persistReorder(next)
  }

  return (
    <>
      <TopBar crumb="Content" title="Series" />
      <main className="px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
        <div className="mb-4 flex justify-end">
          <button onClick={openCreate} className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white" style={{ background: 'var(--accent)' }}>
            <Plus size={15} /> New series
          </button>
        </div>

        {loading ? (
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Loading…</p>
        ) : (
          <DataTable
            rows={series}
            emptyLabel="No series yet."
            columns={[
              { key: 'title', label: 'Title', sortable: true },
              { key: 'scholar', label: 'Scholar', render: (r) => r.scholar?.name },
              { key: 'status', label: 'Status', render: (r) => <StatusPill status={r.status} /> },
              {
                key: 'actions',
                label: '',
                render: (r) => (
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openReorder(r)} title="Reorder episodes" className="rounded p-1.5" style={{ color: 'var(--muted)' }}><ListOrdered size={15} /></button>
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
        title={form.id ? 'Edit series' : 'New series'}
        onClose={() => setModalOpen(false)}
        onSubmit={submit}
        submitLabel={form.id ? 'Save changes' : 'Create series'}
        submitHint={error}
      >
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Title</label>
          <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full rounded-xl px-3 py-2 text-sm outline-none" style={{ border: '1px solid var(--border)' }} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Scholar</label>
          <SearchableSelect options={scholars} value={form.scholarId || null} onChange={(id) => setForm((f) => ({ ...f, scholarId: id }))} placeholder="Choose scholar…" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Description</label>
          <textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full rounded-xl px-3 py-2 text-sm outline-none" style={{ border: '1px solid var(--border)' }} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Thumbnail</label>
          <ImageUpload value={null} onChange={() => {}} />
          <p className="mt-1 text-[11px]" style={{ color: 'var(--muted)' }}>Preview only — not wired to Storage yet.</p>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Status</label>
          <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="select-field w-full rounded-xl px-3 py-2 text-sm outline-none" style={{ border: '1px solid var(--border)' }}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </FormModal>

      <FormModal
        open={!!reorderSeries}
        title={`Reorder — ${reorderSeries?.title ?? ''}`}
        onClose={() => setReorderSeries(null)}
        onSubmit={() => setReorderSeries(null)}
        submitLabel="Done"
      >
        {reorderEpisodes.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--muted)' }}>No episodes assigned to this series yet.</p>
        ) : (
          <div className="rounded-2xl" style={{ border: '1px solid var(--border)' }}>
            {reorderEpisodes.map((ep, i) => (
              <div
                key={ep.id}
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onReorderDrop(i)}
                className="flex items-center gap-2 px-3 py-2"
                style={i < reorderEpisodes.length - 1 ? { borderBottom: '1px solid var(--border)' } : undefined}
              >
                <GripVertical size={14} className="cursor-grab" style={{ color: 'var(--muted)' }} />
                <span className="font-data text-xs" style={{ color: 'var(--muted)' }}>{i + 1}</span>
                <p className="min-w-0 flex-1 truncate text-sm" style={{ color: 'var(--ink)' }}>{ep.title}</p>
              </div>
            ))}
          </div>
        )}
        <p className="text-[11px]" style={{ color: 'var(--muted)' }}>
          Drag to reorder — saves automatically as you drop.
        </p>
      </FormModal>
    </>
  )
}

export default Series
