import { useEffect, useState } from 'react'
import TopBar from '../components/TopBar'
import { settingsApi } from '../api/client'

function Settings() {
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    settingsApi.get().then(setForm)
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    try {
      const updated = await settingsApi.update({
        siteName: form.siteName,
        siteDescription: form.siteDescription,
        defaultBitrate: Number(form.defaultBitrate),
        maxUploadSize: Number(form.maxUploadSize),
      })
      setForm(updated)
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar crumb="System" title="Settings" />
      <main className="max-w-lg px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
        {!form ? (
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Loading…</p>
        ) : (
          <form onSubmit={submit} className="space-y-4 rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Site name</label>
              <input value={form.siteName} onChange={(e) => setForm((f) => ({ ...f, siteName: e.target.value }))} className="w-full rounded-xl px-3 py-2 text-sm outline-none" style={{ border: '1px solid var(--border)' }} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Description</label>
              <textarea rows={2} value={form.siteDescription} onChange={(e) => setForm((f) => ({ ...f, siteDescription: e.target.value }))} className="w-full rounded-xl px-3 py-2 text-sm outline-none" style={{ border: '1px solid var(--border)' }} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Default bitrate (kbps)</label>
              <input type="number" value={form.defaultBitrate} onChange={(e) => setForm((f) => ({ ...f, defaultBitrate: e.target.value }))} className="w-full rounded-xl px-3 py-2 text-sm outline-none font-data" style={{ border: '1px solid var(--border)' }} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Max upload size (bytes)</label>
              <input type="number" value={form.maxUploadSize} onChange={(e) => setForm((f) => ({ ...f, maxUploadSize: e.target.value }))} className="w-full rounded-xl px-3 py-2 text-sm outline-none font-data" style={{ border: '1px solid var(--border)' }} />
              <p className="mt-1 text-[11px]" style={{ color: 'var(--muted)' }}>{(form.maxUploadSize / (1024 * 1024)).toFixed(0)} MB</p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={saving} className="rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" style={{ background: 'var(--accent)' }}>
                {saving ? 'Saving…' : 'Save settings'}
              </button>
              {saved && <span className="text-xs" style={{ color: 'var(--accent)' }}>Saved.</span>}
            </div>
          </form>
        )}
      </main>
    </>
  )
}

export default Settings
