import React, { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import TopBar from '../components/TopBar'
import DataTable from '../components/DataTable'
import StatusPill from '../components/StatusPill'
import FormModal from '../components/FormModal'
import SearchableSelect from '../components/SearchableSelect'
import { rightsApi, scholarsApi } from '../api/client'

const STATUSES = ['PENDING', 'AUTHORIZED', 'EXPIRING', 'EXPIRED', 'REVOKED']
const emptyForm = { id: null, owner: '', scholarId: '', status: 'PENDING', licenseExpiry: '' }

function daysUntil(dateStr) {
  if (!dateStr) return null
  return Math.ceil((new Date(dateStr) - Date.now()) / 86400000)
}

function Rights() {
  const [rights, setRights] = useState([])
  const [scholars, setScholars] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    Promise.all([rightsApi.list(), scholarsApi.list()])
      .then(([rg, sc]) => { setRights(rg ?? []); setScholars(sc ?? []) })
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const openCreate = () => { setForm(emptyForm); setError(''); setModalOpen(true) }
  const openEdit = (r) => {
    setForm({
      id: r.id,
      owner: r.owner,
      scholarId: r.scholarId,
      status: r.status,
      licenseExpiry: r.licenseExpiry ? r.licenseExpiry.slice(0, 10) : '',
    })
    setError('')
    setModalOpen(true)
  }

  const submit = async () => {
    setError('')
    const payload = {
      owner: form.owner,
      scholarId: Number(form.scholarId),
      status: form.status,
      licenseExpiry: form.licenseExpiry || null,
    }
    try {
      if (form.id) await rightsApi.update(form.id, payload)
      else await rightsApi.create(payload)
      setModalOpen(false)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed.')
    }
  }

  const remove = async (r) => {
    if (!confirm(`Delete rights record for "${r.owner}"?`)) return
    await rightsApi.remove(r.id)
    load()
  }

  return (
    <>
      <TopBar crumb="Compliance" title="Rights" />
      <main className="px-8 py-6">
        <div className="mb-4 flex justify-end">
          <button onClick={openCreate} className="flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold text-white" style={{ background: 'var(--accent)' }}>
            <Plus size={15} /> New rights record
          </button>
        </div>

        {loading ? (
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Loading…</p>
        ) : (
          <DataTable
            rows={rights}
            emptyLabel="No rights records yet."
            columns={[
              { key: 'owner', label: 'Owner', sortable: true },
              { key: 'scholar', label: 'Scholar', render: (r) => r.scholar?.name },
              {
                key: 'status',
                label: 'Status',
                render: (r) => {
                  const days = daysUntil(r.licenseExpiry)
                  const status = r.status === 'AUTHORIZED' && days != null && days <= 30 && days >= 0 ? 'EXPIRING' : r.status
                  return <StatusPill status={status} />
                },
              },
              {
                key: 'licenseExpiry',
                label: 'License expiry',
                render: (r) => (
                  <span className="font-data text-xs" style={{ color: 'var(--muted)' }}>
                    {r.licenseExpiry ? new Date(r.licenseExpiry).toLocaleDateString() : '—'}
                  </span>
                ),
              },
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
        title={form.id ? 'Edit rights record' : 'New rights record'}
        onClose={() => setModalOpen(false)}
        onSubmit={submit}
        submitLabel={form.id ? 'Save changes' : 'Create record'}
        submitHint={error}
      >
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Owner</label>
          <input required value={form.owner} onChange={(e) => setForm((f) => ({ ...f, owner: e.target.value }))} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={{ border: '1px solid var(--border)' }} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Scholar</label>
          <SearchableSelect options={scholars} value={form.scholarId ? Number(form.scholarId) : null} onChange={(id) => setForm((f) => ({ ...f, scholarId: id }))} placeholder="Choose scholar…" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>License expiry</label>
          <input type="date" value={form.licenseExpiry} onChange={(e) => setForm((f) => ({ ...f, licenseExpiry: e.target.value }))} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={{ border: '1px solid var(--border)' }} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Status</label>
          <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="w-full rounded-md px-3 py-2 text-sm outline-none" style={{ border: '1px solid var(--border)' }}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </FormModal>
    </>
  )
}

export default Rights
