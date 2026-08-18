import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'

function SearchableSelect({ options, value, onChange, placeholder = 'Select…', getLabel = (o) => o.name, getValue = (o) => o.id }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef(null)

  const filtered = useMemo(() => {
    if (!query.trim()) return options
    return options.filter((o) => getLabel(o).toLowerCase().includes(query.toLowerCase()))
  }, [options, query, getLabel])

  const selected = options.find((o) => getValue(o) === value)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false)
        setQuery('')
      }
    }
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm"
        style={{ border: '1px solid var(--border)', background: 'var(--surface)', color: selected ? 'var(--ink)' : 'var(--muted)' }}
      >
        {selected ? getLabel(selected) : placeholder}
        <ChevronDown size={14} style={{ color: 'var(--muted)', transform: open ? 'rotate(180deg)' : undefined, transition: 'transform 0.15s ease' }} />
      </button>

      {open && (
        <div
          className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 8px 24px rgba(28,25,23,0.12)' }}
        >
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="w-full px-3 py-2 text-sm outline-none"
            style={{ borderBottom: '1px solid var(--border)' }}
          />
          <div className="max-h-48 overflow-y-auto scrollbar-thin">
            {filtered.length === 0 && (
              <p className="px-3 py-2 text-sm" style={{ color: 'var(--muted)' }}>No matches.</p>
            )}
            {filtered.map((o) => (
              <button
                type="button"
                key={getValue(o)}
                onClick={() => { onChange(getValue(o)); setOpen(false); setQuery('') }}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-[var(--base)]"
              >
                {getLabel(o)}
                {value === getValue(o) && <Check size={14} style={{ color: 'var(--accent)' }} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchableSelect
