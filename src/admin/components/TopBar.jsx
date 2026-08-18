import { Search } from 'lucide-react'

function TopBar({ title, crumb }) {
  return (
    <header
      className="sticky top-0 z-30 flex h-16 items-center justify-between px-8"
      style={{ background: 'var(--base)', borderBottom: '1px solid var(--border)' }}
    >
      <div>
        {crumb && (
          <p className="text-xs font-data uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
            {crumb}
          </p>
        )}
        <h1 className="text-lg font-semibold tracking-tight" style={{ color: 'var(--ink)' }}>
          {title}
        </h1>
      </div>

      <div
        className="flex w-64 items-center gap-2 rounded-xl px-3 py-1.5 text-sm"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}
      >
        <Search size={15} />
        <span>Search…</span>
      </div>
    </header>
  )
}

export default TopBar
