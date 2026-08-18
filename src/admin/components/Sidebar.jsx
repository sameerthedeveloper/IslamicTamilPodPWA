import { NavLink, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Mic2,
  Users2,
  Library,
  Tags,
  AudioLines,
  ShieldCheck,
  UsersRound,
  Star,
  Settings2,
  LogOut,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/episodes', label: 'Episodes', icon: Mic2 },
  { to: '/admin/scholars', label: 'Scholars', icon: Users2 },
  { to: '/admin/series', label: 'Series', icon: Library },
  { to: '/admin/topics', label: 'Topics', icon: Tags },
  { to: '/admin/audio', label: 'Audio Library', icon: AudioLines },
  { to: '/admin/rights', label: 'Rights', icon: ShieldCheck },
  { to: '/admin/users', label: 'Users', icon: UsersRound },
  { to: '/admin/featured', label: 'Featured', icon: Star },
  { to: '/admin/settings', label: 'Settings', icon: Settings2 },
]

function Sidebar() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 flex w-60 shrink-0 flex-col border-r"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="flex h-16 items-center gap-2 px-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-xl text-sm font-bold text-white"
          style={{ background: 'var(--accent)' }}
        >
          T
        </div>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-semibold" style={{ color: 'var(--ink)' }}>Tamil Islamic</p>
          <p className="text-[11px] font-data uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Admin</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin px-2 py-4">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `mb-0.5 flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors border-l-2 ${
                isActive ? '' : 'border-transparent hover:bg-[var(--base)]'
              }`
            }
            style={({ isActive }) => ({
              borderLeftColor: isActive ? 'var(--accent)' : 'transparent',
              background: isActive ? 'var(--accent-soft)' : 'transparent',
              color: isActive ? 'var(--accent)' : 'var(--ink)',
            })}
          >
            <Icon size={17} strokeWidth={2.25} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4" style={{ borderTop: '1px solid var(--border)' }}>
        <Link
          to="/"
          className="mb-3 block text-xs font-medium"
          style={{ color: 'var(--accent)' }}
        >
          ← Back to app
        </Link>
        <div className="mb-3 min-w-0">
          <p className="truncate text-sm font-medium" style={{ color: 'var(--ink)' }}>{user?.name}</p>
          <p className="truncate text-xs" style={{ color: 'var(--muted)' }}>{user?.email}</p>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition hover:bg-[var(--base)]"
          style={{ color: 'var(--muted)' }}
        >
          <LogOut size={16} strokeWidth={2.25} />
          Sign out
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
