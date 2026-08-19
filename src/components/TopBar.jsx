import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings, LogOut, LogIn } from 'lucide-react'
import { useUserStore, logout } from '../store/userStore'

function TopBar() {
    const navigate = useNavigate()
    const user = useUserStore((s) => s.user)
    const isSignedIn = user && !user.isAnonymous
    const initial = isSignedIn ? (user.name?.[0] ?? user.email?.[0] ?? 'U').toUpperCase() : 'U'

    const [open, setOpen] = useState(false)
    const menuRef = useRef(null)

    useEffect(() => {
        if (!open) return
        const onClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener('mousedown', onClickOutside)
        return () => document.removeEventListener('mousedown', onClickOutside)
    }, [open])

    const goTo = (path) => {
        setOpen(false)
        navigate(path)
    }

    const handleLogout = async () => {
        setOpen(false)
        await logout()
        navigate('/')
    }

    return (
        <header
            className="fixed inset-x-0 top-0 z-50 flex min-h-20 shrink-0 items-center justify-between border-b border-gray-200 bg-gray-100/95 px-5 shadow-sm backdrop-blur pt-[max(0.75rem,env(safe-area-inset-top))] pb-4 sm:left-1/2 sm:right-auto sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:border-x lg:hidden">


            <div>

                <p className="font-display text-xl font-semibold tracking-tight text-gray-900">
                    Tamil Islamic Podcast
                </p>

                <p className="text-xs text-gray-500">
                    Learn • Listen • Reflect
                </p>

            </div>

            <div className="relative" ref={menuRef}>
                <button
                    onClick={() => setOpen((v) => !v)}
                    aria-label={isSignedIn ? user.name ?? 'Account' : 'Account'}
                    aria-expanded={open}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-white text-sm font-semibold shadow-sm transition hover:bg-gray-100"
                    style={{ color: 'var(--accent)' }}>
                    {initial}
                </button>

                {open && (
                    <div
                        className="animate-rise-in absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-2xl border border-gray-200 bg-white py-1.5 shadow-lg"
                        style={{ animationDuration: '0.22s' }}
                    >
                        <div className="px-4 py-2.5">
                            <p className="truncate text-sm font-medium text-gray-900">
                                {isSignedIn ? user.name ?? user.email : 'Guest'}
                            </p>
                            <p className="truncate text-xs text-gray-500">
                                {isSignedIn ? user.email : 'Not signed in'}
                            </p>
                        </div>

                        <div className="my-1 h-px bg-gray-100" />

                        <button
                            onClick={() => goTo('/settings')}
                            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-50"
                        >
                            <Settings size={15} />
                            Settings
                        </button>

                        {isSignedIn ? (
                            <button
                                onClick={handleLogout}
                                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition hover:bg-red-50"
                                style={{ color: 'var(--danger)' }}
                            >
                                <LogOut size={15} />
                                Sign out
                            </button>
                        ) : (
                            <button
                                onClick={() => goTo('/login')}
                                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition hover:bg-gray-50"
                                style={{ color: 'var(--accent)' }}
                            >
                                <LogIn size={15} />
                                Sign in
                            </button>
                        )}
                    </div>
                )}
            </div>

        </header>
    )
}

export default TopBar
