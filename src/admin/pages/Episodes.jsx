import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, UploadCloud, Ban, X } from 'lucide-react'
import TopBar from '../components/TopBar'
import DataTable from '../components/DataTable'
import StatusPill from '../components/StatusPill'
import FormModal from '../components/FormModal'
import SearchableSelect from '../components/SearchableSelect'
import ImageUpload from '../components/ImageUpload'
import { episodesApi, scholarsApi, seriesApi, topicsApi, rightsApi } from '../api/client'
import { extractYoutubeId, fetchYoutubeMetadata } from '../../utils/youtube'

const STATUSES = ['DRAFT', 'PROCESSING', 'READY', 'PUBLISHED', 'UNPUBLISHED']

const emptyForm = {
  id: null,
  title: '',
  scholarId: '',
  seriesId: '',
  topics: [],
  description: '',
  youtubeUrl: '',
  status: 'DRAFT',
  position: 0,
}

function Episodes() {
  const [episodes, setEpisodes] = useState([])
  const [scholars, setScholars] = useState([])
  const [series, setSeries] = useState([])
  const [topics, setTopics] = useState([])
  const [rights, setRights] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [ytPreview, setYtPreview] = useState(null)
  const [ytLoading, setYtLoading] = useState(false)
  const [selectedIds, setSelectedIds] = useState(() => new Set())
  const [bulkScholarId, setBulkScholarId] = useState('')
  const [bulkSeriesId, setBulkSeriesId] = useState('')
  const [bulkApplying, setBulkApplying] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([episodesApi.list(1, 100), scholarsApi.list(), seriesApi.list(1, 100), topicsApi.list(), rightsApi.list()])
      .then(([ep, sc, se, tp, rg]) => {
        setEpisodes(ep.data ?? [])
        setScholars(sc ?? [])
        setSeries(se.data ?? [])
        setTopics(tp ?? [])
        setRights(rg ?? [])
      })
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const rightsFor = (scholarId) => rights.find((r) => r.scholarId === scholarId)
  const isBlocked = (scholarId) => {
    const r = rightsFor(scholarId)
    return r && (r.status === 'EXPIRED' || r.status === 'REVOKED') ? r : null
  }

  const openCreate = () => {
    setForm(emptyForm)
    setYtPreview(null)
    setError('')
    setModalOpen(true)
  }

  const openEdit = (ep) => {
    setForm({
      id: ep.id,
      title: ep.title,
      scholarId: ep.scholarId,
      seriesId: ep.seriesId ?? '',
      topics: ep.topics?.map((t) => t.topic.name) ?? [],
      description: ep.description ?? '',
      youtubeUrl: ep.youtubeId ?? '',
      status: ep.status,
      position: ep.position ?? 0,
    })
    setYtPreview(ep.youtubeId ? { thumbnail: ep.thumbnail } : null)
    setError('')
    setModalOpen(true)
  }

  const handleYoutubeUrlChange = async (value) => {
    setForm((f) => ({ ...f, youtubeUrl: value }))
    setYtPreview(null)
    const youtubeId = extractYoutubeId(value)
    if (!youtubeId) return
    setYtLoading(true)
    try {
      const meta = await fetchYoutubeMetadata(youtubeId)
      setYtPreview({ youtubeId, ...meta })
      setForm((f) => ({ ...f, title: f.title || meta.title }))
    } catch {
      setError("Couldn't fetch video info — check the link.")
    } finally {
      setYtLoading(false)
    }
  }

  const submit = async () => {
    setError('')
    const blocked = isBlocked(form.scholarId)
    if (form.status === 'PUBLISHED' && blocked) {
      setError(`Cannot publish: rights for this scholar are ${blocked.status}.`)
      return
    }

    const youtubeId = extractYoutubeId(form.youtubeUrl)
    const scholar = scholars.find((s) => s.id === form.scholarId)
    const seriesEntry = series.find((s) => s.id === form.seriesId)
    const payload = {
      title: form.title,
      scholarId: form.scholarId,
      // Denormalized so the public app (Home/Discover/Library/player) can
      // render scholar/series info without an extra fetch per episode.
      scholar: scholar ? { name: scholar.name } : null,
      // Firestore's addDoc/updateDoc reject `undefined` field values
      // outright (the whole write throws) — use null for "not set" instead.
      seriesId: form.seriesId || null,
      series: seriesEntry ? { title: seriesEntry.title } : null,
      topics: form.topics,
      description: form.description || null,
      status: form.status,
      // Manual ordering within a series — the public app sorts episodes
      // that share a series by this (ascending) instead of recency.
      position: Number(form.position) || 0,
      sourceType: youtubeId ? 'YOUTUBE' : 'UPLOAD',
      youtubeId: youtubeId ?? null,
      ...(ytPreview?.thumbnail && { thumbnail: ytPreview.thumbnail }),
    }

    try {
      if (form.id) {
        await episodesApi.update(form.id, payload)
      } else {
        await episodesApi.create(payload)
      }
      setModalOpen(false)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed.')
    }
  }

  const togglePublish = async (ep) => {
    const nextStatus = ep.status === 'PUBLISHED' ? 'UNPUBLISHED' : 'PUBLISHED'
    const blocked = isBlocked(ep.scholarId)
    if (nextStatus === 'PUBLISHED' && blocked) return
    await episodesApi.update(ep.id, { status: nextStatus })
    load()
  }

  const remove = async (ep) => {
    if (!confirm(`Delete "${ep.title}"?`)) return
    await episodesApi.remove(ep.id)
    load()
  }

  const toggleRow = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleRows = (ids, select) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      ids.forEach((id) => (select ? next.add(id) : next.delete(id)))
      return next
    })
  }

  const clearSelection = () => {
    setSelectedIds(new Set())
    setBulkScholarId('')
    setBulkSeriesId('')
  }

  // Applies scholar and/or series (whichever the admin picked) to every
  // selected episode in one batched write — e.g. assigning a batch of
  // seeded/imported episodes to a scholar or series at once.
  const applyBulkAssign = async () => {
    if (!bulkScholarId && !bulkSeriesId) return
    setBulkApplying(true)
    try {
      const data = {}
      if (bulkScholarId) {
        const scholar = scholars.find((s) => s.id === bulkScholarId)
        data.scholarId = bulkScholarId
        data.scholar = scholar ? { name: scholar.name } : null
      }
      if (bulkSeriesId) {
        const seriesEntry = series.find((s) => s.id === bulkSeriesId)
        data.seriesId = bulkSeriesId
        data.series = seriesEntry ? { title: seriesEntry.title } : null
      }
      await episodesApi.bulkUpdate(Array.from(selectedIds), data)
      clearSelection()
      load()
    } finally {
      setBulkApplying(false)
    }
  }

  const toggleTopic = (name) => {
    setForm((f) => ({
      ...f,
      topics: f.topics.includes(name) ? f.topics.filter((t) => t !== name) : [...f.topics, name],
    }))
  }

  const publishBlockedInModal = form.status === 'PUBLISHED' && isBlocked(form.scholarId)

  return (
    <>
      <TopBar crumb="Content" title="Episodes" />
      <main className="px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
        <div className="mb-4 flex justify-end">
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white"
            style={{ background: 'var(--accent)' }}
          >
            <Plus size={15} /> New episode
          </button>
        </div>

        {selectedIds.size > 0 && (
          <div
            className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3"
            style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent)' }}
          >
            <span className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
              {selectedIds.size} selected
            </span>

            <div className="w-48">
              <SearchableSelect
                options={scholars}
                value={bulkScholarId || null}
                onChange={(id) => setBulkScholarId(id ?? '')}
                placeholder="Assign scholar…"
              />
            </div>

            <div className="w-48">
              <SearchableSelect
                options={series}
                value={bulkSeriesId || null}
                onChange={(id) => setBulkSeriesId(id ?? '')}
                getLabel={(s) => s.title}
                placeholder="Assign series…"
              />
            </div>

            <button
              onClick={applyBulkAssign}
              disabled={bulkApplying || (!bulkScholarId && !bulkSeriesId)}
              className="rounded-xl px-3 py-2 text-sm font-semibold text-white disabled:opacity-40"
              style={{ background: 'var(--accent)' }}
            >
              {bulkApplying ? 'Applying…' : 'Apply'}
            </button>

            <button
              onClick={clearSelection}
              className="ml-auto flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium"
              style={{ color: 'var(--muted)' }}
            >
              <X size={14} /> Clear
            </button>
          </div>
        )}

        {loading ? (
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Loading…</p>
        ) : (
          <DataTable
            rows={episodes}
            emptyLabel="No episodes yet."
            selectable
            selectedIds={selectedIds}
            onToggleRow={toggleRow}
            onToggleRows={toggleRows}
            columns={[
              { key: 'title', label: 'Title', sortable: true },
              { key: 'scholar', label: 'Scholar', render: (r) => r.scholar?.name },
              { key: 'series', label: 'Series', render: (r) => r.series?.title ?? '—' },
              { key: 'status', label: 'Status', sortable: true, render: (r) => <StatusPill status={r.status} /> },
              {
                key: 'publishedAt',
                label: 'Published',
                render: (r) => (
                  <span className="font-data text-xs" style={{ color: 'var(--muted)' }}>
                    {r.publishedAt ? new Date(r.publishedAt).toLocaleDateString() : '—'}
                  </span>
                ),
              },
              {
                key: 'actions',
                label: '',
                render: (r) => {
                  const blocked = isBlocked(r.scholarId)
                  const wouldPublish = r.status !== 'PUBLISHED'
                  return (
                    <div className="flex items-center justify-end gap-1">
                      <button
                        title={wouldPublish && blocked ? `Rights ${blocked.status}` : r.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                        onClick={() => togglePublish(r)}
                        disabled={wouldPublish && !!blocked}
                        className="rounded p-1.5 disabled:opacity-30"
                        style={{ color: wouldPublish && blocked ? 'var(--danger)' : 'var(--accent)' }}
                      >
                        {wouldPublish && blocked ? <Ban size={15} /> : <UploadCloud size={15} />}
                      </button>
                      <button onClick={() => openEdit(r)} className="rounded p-1.5" style={{ color: 'var(--muted)' }}>
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => remove(r)} className="rounded p-1.5" style={{ color: 'var(--danger)' }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )
                },
              },
            ]}
          />
        )}
      </main>

      <FormModal
        open={modalOpen}
        title={form.id ? 'Edit episode' : 'New episode'}
        onClose={() => setModalOpen(false)}
        onSubmit={submit}
        submitLabel={form.id ? 'Save changes' : 'Create episode'}
        submitDisabled={!!publishBlockedInModal}
        submitHint={error || (publishBlockedInModal ? `Rights for this scholar are ${publishBlockedInModal.status} — cannot publish.` : '')}
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
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Scholar</label>
          <SearchableSelect
            options={scholars}
            value={form.scholarId || null}
            onChange={(id) => setForm((f) => ({ ...f, scholarId: id }))}
            placeholder="Choose scholar…"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Series (optional)</label>
          <SearchableSelect
            options={series}
            value={form.seriesId || null}
            onChange={(id) => setForm((f) => ({ ...f, seriesId: id }))}
            getLabel={(s) => s.title}
            placeholder="No series"
          />
        </div>

        {form.seriesId && (
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Position in series</label>
            <input
              type="number"
              value={form.position}
              onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
              className="w-full rounded-xl px-3 py-2 text-sm outline-none"
              style={{ border: '1px solid var(--border)' }}
            />
            <p className="mt-1 text-[11px]" style={{ color: 'var(--muted)' }}>
              Lower numbers show first. Or use "Reorder" on the Series page to drag into order.
            </p>
          </div>
        )}

        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Topics</label>
          <div className="flex flex-wrap gap-1.5">
            {topics.map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => toggleTopic(t.name)}
                className="rounded-full px-2.5 py-1 text-xs font-medium"
                style={{
                  border: `1px solid ${form.topics.includes(t.name) ? 'var(--accent)' : 'var(--border)'}`,
                  background: form.topics.includes(t.name) ? 'var(--accent-soft)' : 'transparent',
                  color: form.topics.includes(t.name) ? 'var(--accent)' : 'var(--muted)',
                }}
              >
                {t.name}
              </button>
            ))}
            {topics.length === 0 && <p className="text-xs" style={{ color: 'var(--muted)' }}>No topics yet.</p>}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>YouTube link (optional)</label>
          <input
            type="url"
            placeholder="https://www.youtube.com/watch?v=…"
            value={form.youtubeUrl}
            onChange={(e) => handleYoutubeUrlChange(e.target.value)}
            className="w-full rounded-xl px-3 py-2 text-sm outline-none"
            style={{ border: '1px solid var(--border)' }}
          />
          <p className="mt-1 text-[11px]" style={{ color: 'var(--muted)' }}>
            {ytLoading
              ? 'Fetching video info…'
              : 'Plays audio-only in the app via a hidden player — no upload needed.'}
          </p>
          {ytPreview?.thumbnail && (
            <div className="mt-2 flex items-center gap-2 rounded-xl p-2" style={{ border: '1px solid var(--border)' }}>
              <img src={ytPreview.thumbnail} alt="" className="h-10 w-10 rounded-lg object-cover" />
              <p className="truncate text-xs" style={{ color: 'var(--ink)' }}>{ytPreview.title ?? 'YouTube video linked'}</p>
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Description</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full rounded-xl px-3 py-2 text-sm outline-none"
            style={{ border: '1px solid var(--border)' }}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Thumbnail</label>
          <ImageUpload value={null} onChange={() => {}} />
          <p className="mt-1 text-[11px]" style={{ color: 'var(--muted)' }}>Preview only — thumbnail upload isn't wired to Storage yet.</p>
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
      </FormModal>
    </>
  )
}

export default Episodes
