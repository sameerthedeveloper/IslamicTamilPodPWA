import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../store/userStore'

function TopBar() {
    const navigate = useNavigate()
    const user = useUserStore((s) => s.user)
    const isSignedIn = user && !user.isAnonymous
    const initial = isSignedIn ? (user.name?.[0] ?? user.email?.[0] ?? 'U').toUpperCase() : 'U'

    return (
        <header
            className="fixed inset-x-0 top-0 z-50 flex min-h-20 shrink-0 items-center justify-between border-b border-gray-200 bg-gray-100/95 px-5 shadow-sm backdrop-blur pt-[calc(0.75rem+env(safe-area-inset-top))] pb-4 sm:left-1/2 sm:right-auto sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:border-x">


            <div>

                <p className="font-display text-xl font-semibold tracking-tight text-gray-900">
                    Tamil Islamic Podcast
                </p>

                <p className="text-xs text-gray-500">
                    Learn • Listen • Reflect
                </p>

            </div>

            <button
                onClick={() => navigate(isSignedIn ? '/' : '/login')}
                aria-label={isSignedIn ? user.name ?? 'Account' : 'Sign in'}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-white text-sm font-semibold shadow-sm transition hover:bg-gray-100"
                style={{ color: 'var(--accent)' }}>
                {initial}
            </button>

        </header>
    )
}

export default TopBar
