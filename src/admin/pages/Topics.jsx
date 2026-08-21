import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Inbox } from 'lucide-react'
import TopBar from '../components/TopBar'
import FormModal from '../components/FormModal'
import { topicsApi } from '../api/client'

const emptyForm = { id: null, name: '', description: '' }

function Topics() {
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    topicsApi.list().then(setTopics).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const openCreate = () => { setForm(emptyForm); setError(''); setModalOpen(true) }
  const openEdit = (t) => { setForm({ id: t.id, name: t.name, description: t.description ?? '' }); setError(''); setModalOpen(true) }

  const submit = async () => {
    if (!form.name.trim()) return
    setError('')
    // Firestore's addDoc/updateDoc reject `undefined` field values outright
    // (the whole write throws) — use null for "not set" instead.
    const payload = { name: form.name.trim(), description: form.description || null }
    try {
      if (form.id) await topicsApi.update(form.id, payload)
      else await topicsApi.create(payload)
      setModalOpen(false)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed.')
    }
  }

  const remove = async (t) => {
    if (!confirm(`Delete "${t.name}"?`)) return
    await topicsApi.remove(t.id)
    load()
  }

  return (
    <>
      <TopBar crumb="Content" title="Categories" />
      <main className="px-4 py-5 sm:px-6 lg:px-8 lg:py-6 max-w-xl">
        <div className="mb-4 flex justify-end">
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white"
            style={{ background: 'var(--accent)' }}
          >
            <Plus size={15} /> New category
          </button>
        </div>

        {loading ? (
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Loading…</p>
        ) : topics.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl py-16" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <Inbox size={22} style={{ color: 'var(--muted)' }} />
            <p className="text-sm" style={{ color: 'var(--muted)' }}>No categories yet.</p>
          </div>
        ) : (
          <div className="rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            {topics.map((t, i) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
                style={i < topics.length - 1 ? { borderBottom: '1px solid var(--border)' } : undefined}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium" style={{ color: 'var(--ink)' }}>{t.name}</p>
                  {t.description && (
                    <p className="truncate text-xs" style={{ color: 'var(--muted)' }}>{t.description}</p>
                  )}
                </div>
                <span className="font-data shrink-0 text-xs" style={{ color: 'var(--muted)' }}>{t.episodes?.length ?? 0} episodes</span>
                <div className="flex shrink-0 gap-1">
                  <button onClick={() => openEdit(t)} className="rounded p-1.5" style={{ color: 'var(--muted)' }}><Pencil size={14} /></button>
                  <button onClick={() => remove(t)} className="rounded p-1.5" style={{ color: 'var(--danger)' }}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <FormModal
        open={modalOpen}
        title={form.id ? 'Edit category' : 'New category'}
        onClose={() => setModalOpen(false)}
        onSubmit={submit}
        submitLabel={form.id ? 'Save changes' : 'Create category'}
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
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Description (optional)</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full rounded-xl px-3 py-2 text-sm outline-none"
            style={{ border: '1px solid var(--border)' }}
          />
        </div>
      </FormModal>
    </>
  )
}

export default Topics
