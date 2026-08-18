import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from '../navConfig'
import { useAdminUiStore } from '../store/uiStore'

function BottomNavBar() {
  const bottomNavKeys = useAdminUiStore((s) => s.bottomNavKeys)

  const items = bottomNavKeys
    .map((key) => NAV_ITEMS.find((n) => n.key === key))
    .filter(Boolean)

  if (items.length === 0) return null

  return (
    <nav
      className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-30 rounded-[28px] border p-2 shadow-xl backdrop-blur-sm lg:hidden"
      style={{ background: 'rgba(255,255,255,0.95)', borderColor: 'var(--border)' }}
    >
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map(({ key, to, label, icon: Icon, end }) => (
          <NavLink
            key={key}
            to={to}
            end={end}
            className="flex flex-col items-center justify-center gap-1 rounded-2xl py-2.5 transition-all duration-200"
            style={({ isActive }) => ({
              background: isActive ? 'var(--accent)' : 'transparent',
              color: isActive ? '#fff' : 'var(--muted)',
            })}
          >
            <Icon size={17} strokeWidth={2.5} />
            <span className="text-[10px] font-medium leading-none">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default BottomNavBar
