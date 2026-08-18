import { NavLink } from 'react-router-dom'
import { SlidersHorizontal } from 'lucide-react'
import { NAV_ITEMS } from '../navConfig'
import { useAdminUiStore } from '../store/uiStore'

function BottomNavBar() {
  const bottomNavKeys = useAdminUiStore((s) => s.bottomNavKeys)
  const openCustomize = useAdminUiStore((s) => s.openCustomize)

  const items = bottomNavKeys
    .map((key) => NAV_ITEMS.find((n) => n.key === key))
    .filter(Boolean)

  return (
    <nav
      className="fixed inset-x-3 bottom-3 z-30 rounded-full border p-1.5 shadow-xl backdrop-blur-sm lg:hidden"
      style={{ background: 'rgba(255,255,255,0.95)', borderColor: 'var(--border)' }}
    >
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${items.length + 1}, minmax(0, 1fr))` }}>
        {items.map(({ key, to, label, icon: Icon, end }) => (
          <NavLink
            key={key}
            to={to}
            end={end}
            className="flex flex-col items-center justify-center gap-1 rounded-full px-2 py-3 transition-all duration-200"
            style={({ isActive }) => ({
              background: isActive ? 'var(--accent)' : 'transparent',
              color: isActive ? '#fff' : 'var(--muted)',
            })}
          >
            <Icon size={17} strokeWidth={2.5} />
            <span className="text-[10px] font-medium leading-none">{label}</span>
          </NavLink>
        ))}

        <button
          type="button"
          onClick={openCustomize}
          className="flex flex-col items-center justify-center gap-1 rounded-full px-2 py-3 transition-all duration-200"
          style={{ color: 'var(--muted)' }}
          aria-label="Customize quick nav"
        >
          <SlidersHorizontal size={17} strokeWidth={2.5} />
          <span className="text-[10px] font-medium leading-none">Edit</span>
        </button>
      </div>
    </nav>
  )
}

export default BottomNavBar
