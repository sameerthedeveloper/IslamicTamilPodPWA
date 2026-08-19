import { useNavigate } from 'react-router-dom'
import { LogOut, LogIn, UserCircle2, ChevronRight, Info } from 'lucide-react'
import { useUserStore, logout } from '../store/userStore'

function SettingsPage() {
  const navigate = useNavigate()
  const user = useUserStore((s) => s.user)
  const isSignedIn = user && !user.isAnonymous

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="px-5 pt-6 lg:mx-auto lg:max-w-2xl lg:px-10 lg:pt-10">

      <h1 className="font-display text-3xl font-semibold tracking-tight text-gray-900">
        Settings
      </h1>
      <p className="mt-2 text-gray-500">
        Manage your account and preferences.
      </p>

      <div className="animate-rise-in mt-8 flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white"
          style={{ background: 'linear-gradient(155deg, var(--accent), #0B5C55)' }}
        >
          {isSignedIn ? (user.name?.[0] ?? user.email?.[0] ?? 'U').toUpperCase() : <UserCircle2 size={28} />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-gray-900">
            {isSignedIn ? user.name ?? user.email : 'Guest'}
          </p>
          <p className="truncate text-sm text-gray-500">
            {isSignedIn ? 'Signed in • Synced across devices' : 'Sign in to sync your listening across devices'}
          </p>
        </div>
      </div>

      <div className="animate-rise-in mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm" style={{ animationDelay: '60ms' }}>
        {!isSignedIn && (
          <button
            onClick={() => navigate('/login')}
            className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-gray-50"
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
              style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
            >
              <LogIn size={16} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-gray-900">Sign in</span>
              <span className="block text-xs text-gray-500">Access your saved lectures on any device</span>
            </span>
            <ChevronRight size={16} className="shrink-0 text-gray-300" />
          </button>
        )}

        <div className="flex items-center gap-3 border-t border-gray-100 px-5 py-4 first:border-t-0">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
            style={{ background: 'var(--gold-soft)', color: 'var(--gold)' }}
          >
            <Info size={16} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-gray-900">About</span>
            <span className="block text-xs text-gray-500">Tamil Islamic Podcast &middot; Learn, Listen, Reflect</span>
          </span>
        </div>

        {isSignedIn && (
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 border-t border-gray-100 px-5 py-4 text-left transition hover:bg-red-50"
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
              style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}
            >
              <LogOut size={16} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium" style={{ color: 'var(--danger)' }}>Sign out</span>
              <span className="block text-xs text-gray-500">You can always sign back in later</span>
            </span>
          </button>
        )}
      </div>

    </div>
  )
}

export default SettingsPage
