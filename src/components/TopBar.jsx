import { useNavigate } from 'react-router-dom'
import { Settings } from 'lucide-react'

function TopBar() {
    const navigate = useNavigate()

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

            <button
                onClick={() => navigate('/settings')}
                aria-label="Settings"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-white shadow-sm transition hover:bg-gray-100"
                style={{ color: 'var(--accent)' }}>
                <Settings size={18} />
            </button>

        </header>
    )
}

export default TopBar
