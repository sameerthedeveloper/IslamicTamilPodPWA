import { useEffect, useState } from 'react'
import { Check, RotateCcw } from 'lucide-react'
import TopBar from '../components/TopBar'
import { settingsApi } from '../api/client'
import { useAdminUiStore } from '../store/uiStore'
import { NAV_ITEMS, BOTTOM_NAV_MAX } from '../navConfig'

function Settings() {
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const bottomNavKeys = useAdminUiStore((s) => s.bottomNavKeys)
  const toggleBottomNavKey = useAdminUiStore((s) => s.toggleBottomNavKey)
  const resetBottomNavKeys = useAdminUiStore((s) => s.resetBottomNavKeys)
  const atMax = bottomNavKeys.length >= BOTTOM_NAV_MAX

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

        <div className="mt-6 rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Quick nav (mobile)</h2>
            <button
              type="button"
              onClick={resetBottomNavKeys}
              className="flex items-center gap-1.5 text-xs font-medium"
              style={{ color: 'var(--muted)' }}
            >
              <RotateCcw size={12} /> Reset
            </button>
          </div>
          <p className="mb-4 text-xs" style={{ color: 'var(--muted)' }}>
            Pick up to {BOTTOM_NAV_MAX} shortcuts for the bottom bar shown on phones.
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
              const selected = bottomNavKeys.includes(key)
              const disabled = !selected && atMax
              return (
                <button
                  key={key}
                  type="button"
                  disabled={disabled}
                  onClick={() => toggleBottomNavKey(key)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors disabled:opacity-40"
                  style={{
                    background: selected ? 'var(--accent-soft)' : 'var(--base)',
                    color: selected ? 'var(--accent)' : 'var(--ink)',
                  }}
                >
                  <Icon size={16} strokeWidth={2.25} />
                  <span className="flex-1 truncate">{label}</span>
                  {selected && <Check size={14} />}
                </button>
              )
            })}
          </div>
        </div>
      </main>
    </>
  )
}

export default Settings
