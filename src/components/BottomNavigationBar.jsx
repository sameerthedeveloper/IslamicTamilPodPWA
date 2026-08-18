import { NavLink } from 'react-router-dom'
import { Home, Search, Book, Bookmark } from 'lucide-react'

const TABS = [
    { to: '/', label: 'Home', icon: Home, end: true },
    { to: '/library', label: 'Library', icon: Bookmark },
    { to: '/browse', label: 'Discover', icon: Search },
    { to: '/quran', label: 'Quran', icon: Book },
]

function BottomNavigationBar() {
    return (
        <nav className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-50 rounded-full border border-gray-200 bg-white/95 p-2 shadow-xl backdrop-blur-sm">
            <div className="grid grid-cols-4 gap-1">
                {TABS.map(({ to, label, icon: Icon, end }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={end}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center gap-1 rounded-full py-2.5 transition-all duration-200 ${
                                isActive
                                    ? 'text-white shadow-sm'
                                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-950'
                            }`
                        }
                        style={({ isActive }) => (isActive ? { background: 'var(--accent)' } : undefined)}
                    >
                        <Icon size={17} strokeWidth={3} />
                        <span className="text-[11px] font-medium leading-none">
                            {label}
                        </span>
                    </NavLink>
                ))}
            </div>
        </nav>
    )
}

export default BottomNavigationBar
