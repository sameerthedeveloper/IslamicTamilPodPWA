import { Menu, Search } from 'lucide-react'
import { useAdminUiStore } from '../store/uiStore'

function TopBar({ title, crumb }) {
  const openSidebar = useAdminUiStore((s) => s.openSidebar)

  return (
    <header
      className="pt-safe sticky top-0 z-30 flex min-h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8"
      style={{ background: 'var(--base)', borderBottom: '1px solid var(--border)' }}
    >
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={openSidebar}
          className="-ml-1 shrink-0 rounded-lg p-1.5 lg:hidden"
          style={{ color: 'var(--ink)' }}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          {crumb && (
            <p className="text-xs font-data uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
              {crumb}
            </p>
          )}
          <h1 className="truncate text-lg font-semibold tracking-tight" style={{ color: 'var(--ink)' }}>
            {title}
          </h1>
        </div>
      </div>

      <div
        className="hidden w-64 items-center gap-2 rounded-xl px-3 py-1.5 text-sm sm:flex"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}
      >
        <Search size={15} />
        <span>Search…</span>
      </div>
      <button
        type="button"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:hidden"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}
        aria-label="Search"
      >
        <Search size={16} />
      </button>
    </header>
  )
}

export default TopBar
