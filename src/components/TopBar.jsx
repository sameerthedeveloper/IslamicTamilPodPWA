
function TopBar() {
  return (
        <header
            className=" sticky top-0 z-50 flex min-h-20 shrink-0 items-center justify-between border-b border-gray-200 bg-gray-100/95 px-5 shadow-sm backdrop-blur pt-10 pb-4">


            <div>

                <p className="font-display text-xl font-semibold tracking-tight text-gray-900">
                    Tamil Islamic Podcast
                </p>

                <p className="text-xs text-gray-500">
                    Learn • Listen • Reflect
                </p>

            </div>

            <button
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-white text-sm font-semibold shadow-sm transition hover:bg-gray-100"
                style={{ color: 'var(--accent)' }}>
                U
            </button>

        </header>
  )
}

export default TopBar