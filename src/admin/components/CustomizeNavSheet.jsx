import { Check, RotateCcw, X } from 'lucide-react'
import { NAV_ITEMS, BOTTOM_NAV_MAX } from '../navConfig'
import { useAdminUiStore } from '../store/uiStore'

function CustomizeNavSheet() {
  const open = useAdminUiStore((s) => s.customizeOpen)
  const close = useAdminUiStore((s) => s.closeCustomize)
  const bottomNavKeys = useAdminUiStore((s) => s.bottomNavKeys)
  const toggleKey = useAdminUiStore((s) => s.toggleBottomNavKey)
  const resetKeys = useAdminUiStore((s) => s.resetBottomNavKeys)

  if (!open) return null

  const atMax = bottomNavKeys.length >= BOTTOM_NAV_MAX

  return (
    <div className="fixed inset-0 z-[60] flex items-end lg:hidden">
      <div
        className="absolute inset-0 animate-[fadein_0.15s_ease]"
        style={{ background: 'rgba(28,25,23,0.35)' }}
        onClick={close}
      />
      <style>{`
        @keyframes fadein { from { opacity: 0 } to { opacity: 1 } }
        @keyframes sheetup { from { transform: translateY(100%) } to { transform: translateY(0) } }
      `}</style>

      <div
        className="relative flex w-full max-h-[75vh] flex-col rounded-t-3xl animate-[sheetup_0.25s_cubic-bezier(0.22,1,0.36,1)]"
        style={{ background: 'var(--surface)', boxShadow: '0 -8px 24px rgba(28,25,23,0.12)' }}
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <h2 className="text-base font-semibold" style={{ color: 'var(--ink)' }}>Customize quick nav</h2>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Pick up to {BOTTOM_NAV_MAX} shortcuts for the bottom bar.</p>
          </div>
          <button type="button" onClick={close} className="rounded p-1.5 hover:bg-[var(--base)]" aria-label="Close">
            <X size={18} style={{ color: 'var(--muted)' }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin px-3 py-3">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
            const selected = bottomNavKeys.includes(key)
            const disabled = !selected && atMax
            return (
              <button
                key={key}
                type="button"
                disabled={disabled}
                onClick={() => toggleKey(key)}
                className="mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition-colors disabled:opacity-40"
                style={{
                  background: selected ? 'var(--accent-soft)' : 'transparent',
                  color: selected ? 'var(--accent)' : 'var(--ink)',
                }}
              >
                <Icon size={17} strokeWidth={2.25} />
                <span className="flex-1">{label}</span>
                {selected && <Check size={16} />}
              </button>
            )
          })}
        </div>

        <div className="px-5 py-4" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={resetKeys}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium"
              style={{ border: '1px solid var(--border)', color: 'var(--ink)' }}
            >
              <RotateCcw size={14} /> Reset
            </button>
            <button
              type="button"
              onClick={close}
              className="flex-1 rounded-xl px-4 py-2 text-sm font-semibold text-white"
              style={{ background: 'var(--accent)' }}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomizeNavSheet
