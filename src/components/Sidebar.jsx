import { NavLink, useNavigate } from 'react-router-dom'
import { Home, Search, Book, Bookmark, Settings, LogOut } from 'lucide-react'
import { useUserStore, logout } from '../store/userStore'

const TABS = [
    { to: '/', label: 'Home', icon: Home, end: true },
    { to: '/library', label: 'Library', icon: Bookmark },
    { to: '/browse', label: 'Discover', icon: Search },
    { to: '/quran', label: 'Quran', icon: Book },
]

function Sidebar() {
    const navigate = useNavigate()
    const user = useUserStore((s) => s.user)
    const isSignedIn = user && !user.isAnonymous
    const initial = isSignedIn ? (user.name?.[0] ?? user.email?.[0] ?? 'U').toUpperCase() : 'U'

    const handleLogout = async () => {
        await logout()
        navigate('/')
    }

    return (
        <aside className="fixed inset-y-3 ml-3 inset-x-3 rounded-3xl shadow left-0 z-50 hidden w-64 flex-col border border-gray-200 bg-gray-100/95 backdrop-blur lg:flex">
            <div className="px-6 pt-8 pb-6">
                <p className="font-display text-xl font-semibold tracking-tight text-gray-900">
                    Tamil Islamic
                </p>
                <p className="text-xs text-gray-500">
                    Learn • Listen • Reflect
                </p>
            </div>

            <nav className="flex-1 space-y-1 px-3">
                {TABS.map(({ to, label, icon: Icon, end }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={end}
                        className={({ isActive }) =>
                            `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                                isActive
                                    ? 'text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-200/70 hover:text-gray-950'
                            }`
                        }
                        style={({ isActive }) => (isActive ? { background: 'var(--accent)' } : undefined)}
                    >
                        <Icon size={18} strokeWidth={2.5} />
                        {label}
                    </NavLink>
                ))}
            </nav>

            {/* Account & settings — kept visually separate from the main
                nav above, with its own divider, since it's a different
                kind of destination (account state, not content). */}
            <div className="border-t border-gray-200 px-3 py-3 space-y-1">
                <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                            isActive
                                ? 'text-white shadow-sm'
                                : 'text-gray-600 hover:bg-gray-200/70 hover:text-gray-950'
                        }`
                    }
                    style={({ isActive }) => (isActive ? { background: 'var(--accent)' } : undefined)}
                >
                    <Settings size={18} strokeWidth={2.5} />
                    Settings
                </NavLink>

                {isSignedIn && (
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition hover:bg-red-50"
                        style={{ color: 'var(--danger)' }}
                    >
                        <LogOut size={18} strokeWidth={2.5} />
                        Sign out
                    </button>
                )}
            </div>

            <div className="border-t border-gray-200 p-4">
                <button
                    onClick={() => navigate(isSignedIn ? '/settings' : '/login')}
                    className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-gray-200/70"
                >
                    <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-white text-sm font-semibold shadow-sm"
                        style={{ color: 'var(--accent)' }}
                    >
                        {initial}
                    </span>
                    <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-gray-900">
                            {isSignedIn ? user.name ?? user.email : 'Sign in'}
                        </span>
                        <span className="block text-xs text-gray-500">
                            {isSignedIn ? 'Synced across devices' : 'Save & sync your listening'}
                        </span>
                    </span>
                </button>
            </div>
        </aside>
    )
}

export default Sidebar
