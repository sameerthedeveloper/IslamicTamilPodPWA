import React, { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import TopBar from '../components/TopBar'
import DataTable from '../components/DataTable'
import StatusPill from '../components/StatusPill'
import FormModal from '../components/FormModal'
import SearchableSelect from '../components/SearchableSelect'
import ImageUpload from '../components/ImageUpload'
import { seriesApi, scholarsApi } from '../api/client'

const STATUSES = ['DRAFT', 'PUBLISHED', 'UNPUBLISHED', 'ARCHIVED']
const emptyForm = { id: null, title: '', scholarId: '', description: '', status: 'DRAFT' }

function Series() {
  const [series, setSeries] = useState([])
  const [scholars, setScholars] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

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
    const payload = { title: form.title, scholarId: Number(form.scholarId), description: form.description || undefined, status: form.status }
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

  return (
    <>
      <TopBar crumb="Content" title="Series" />
      <main className="px-8 py-6">
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
          <SearchableSelect options={scholars} value={form.scholarId ? Number(form.scholarId) : null} onChange={(id) => setForm((f) => ({ ...f, scholarId: id }))} placeholder="Choose scholar…" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Description</label>
          <textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full rounded-xl px-3 py-2 text-sm outline-none" style={{ border: '1px solid var(--border)' }} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Thumbnail</label>
          <ImageUpload value={null} onChange={() => {}} />
          <p className="mt-1 text-[11px]" style={{ color: 'var(--muted)' }}>Preview only — not wired to backend yet.</p>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Status</label>
          <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="w-full rounded-xl px-3 py-2 text-sm outline-none" style={{ border: '1px solid var(--border)' }}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </FormModal>
    </>
  )
}

export default Series
