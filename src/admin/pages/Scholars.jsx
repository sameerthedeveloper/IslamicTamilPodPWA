import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Inbox } from 'lucide-react'
import TopBar from '../components/TopBar'
import FormModal from '../components/FormModal'
import StatusPill from '../components/StatusPill'
import ImageUpload from '../components/ImageUpload'
import { scholarsApi } from '../api/client'

const emptyForm = { id: null, name: '', biography: '', status: 'ACTIVE' }

function Scholars() {
  const [scholars, setScholars] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    scholarsApi.list().then(setScholars).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const openCreate = () => { setForm(emptyForm); setError(''); setModalOpen(true) }
  const openEdit = (s) => { setForm({ id: s.id, name: s.name, biography: s.biography ?? '', status: s.status ?? 'ACTIVE' }); setError(''); setModalOpen(true) }

  const submit = async () => {
    setError('')
    try {
      if (form.id) {
        await scholarsApi.update(form.id, { name: form.name, biography: form.biography, status: form.status })
      } else {
        await scholarsApi.create({ name: form.name, biography: form.biography, status: 'ACTIVE' })
      }
      setModalOpen(false)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed.')
    }
  }

  const remove = async (s) => {
    if (!confirm(`Delete "${s.name}"? This removes their episodes too.`)) return
    await scholarsApi.remove(s.id)
    load()
  }

  return (
    <>
      <TopBar crumb="Content" title="Scholars" />
      <main className="px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
        <div className="mb-4 flex justify-end">
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white"
            style={{ background: 'var(--accent)' }}
          >
            <Plus size={15} /> New scholar
          </button>
        </div>

        {loading ? (
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Loading…</p>
        ) : scholars.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center gap-2 rounded-2xl py-16"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <Inbox size={22} style={{ color: 'var(--muted)' }} />
            <p className="text-sm" style={{ color: 'var(--muted)' }}>No scholars yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {scholars.map((s) => (
              <div key={s.id} className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="flex h-24 items-center justify-center rounded-xl" style={{ background: 'var(--base)' }}>
                  {s.image ? (
                    <img src={s.image} alt="" className="h-full w-full rounded-xl object-cover" />
                  ) : (
                    <span className="font-data text-2xl" style={{ color: 'var(--muted)' }}>{s.name?.[0]}</span>
                  )}
                </div>
                <p className="mt-3 truncate text-sm font-semibold" style={{ color: 'var(--ink)' }}>{s.name}</p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>{s.episodes?.length ?? 0} episodes</p>
                <div className="mt-2 flex items-center justify-between">
                  <StatusPill status={s.status} />
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(s)} className="rounded p-1" style={{ color: 'var(--muted)' }}><Pencil size={14} /></button>
                    <button onClick={() => remove(s)} className="rounded p-1" style={{ color: 'var(--danger)' }}><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <FormModal
        open={modalOpen}
        title={form.id ? 'Edit scholar' : 'New scholar'}
        onClose={() => setModalOpen(false)}
        onSubmit={submit}
        submitLabel={form.id ? 'Save changes' : 'Create scholar'}
        submitHint={error}
      >
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Name</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full rounded-xl px-3 py-2 text-sm outline-none"
            style={{ border: '1px solid var(--border)' }}
          />
          <p className="mt-1 text-[11px]" style={{ color: 'var(--muted)' }}>Slug is auto-generated from the name.</p>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Biography</label>
          <textarea
            rows={4}
            value={form.biography}
            onChange={(e) => setForm((f) => ({ ...f, biography: e.target.value }))}
            className="w-full rounded-xl px-3 py-2 text-sm outline-none"
            style={{ border: '1px solid var(--border)' }}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Image</label>
          <ImageUpload value={null} onChange={() => {}} />
          <p className="mt-1 text-[11px]" style={{ color: 'var(--muted)' }}>Preview only — image upload isn't wired to Storage yet.</p>
        </div>

        {form.id && (
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              className="select-field w-full rounded-xl px-3 py-2 text-sm outline-none"
              style={{ border: '1px solid var(--border)' }}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>
        )}
      </FormModal>
    </>
  )
}

export default Scholars
