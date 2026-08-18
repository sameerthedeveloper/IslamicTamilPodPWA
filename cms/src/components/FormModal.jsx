import React from 'react'
import { X } from 'lucide-react'

function FormModal({ open, title, onClose, onSubmit, submitLabel = 'Save', children, submitDisabled, submitHint }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 animate-[fadein_0.15s_ease]"
        style={{ background: 'rgba(28,25,23,0.35)' }}
        onClick={onClose}
      />
      <style>{`
        @keyframes fadein { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slidein { from { transform: translateX(100%) } to { transform: translateX(0) } }
      `}</style>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit?.()
        }}
        className="relative flex h-full w-full max-w-md flex-col animate-[slidein_0.25s_cubic-bezier(0.22,1,0.36,1)]"
        style={{ background: 'var(--surface)', boxShadow: '-8px 0 24px rgba(28,25,23,0.08)' }}
      >
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <h2 className="text-base font-semibold" style={{ color: 'var(--ink)' }}>{title}</h2>
          <button type="button" onClick={onClose} className="rounded p-1 hover:bg-[var(--base)]">
            <X size={18} style={{ color: 'var(--muted)' }} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto scrollbar-thin px-6 py-5">
          {children}
        </div>

        <div className="px-6 py-4" style={{ borderTop: '1px solid var(--border)' }}>
          {submitHint && (
            <p className="mb-2 text-xs" style={{ color: 'var(--danger)' }}>{submitHint}</p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl px-4 py-2 text-sm font-medium"
              style={{ border: '1px solid var(--border)', color: 'var(--ink)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitDisabled}
              className="flex-1 rounded-xl px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-40"
              style={{ background: 'var(--accent)' }}
            >
              {submitLabel}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default FormModal
