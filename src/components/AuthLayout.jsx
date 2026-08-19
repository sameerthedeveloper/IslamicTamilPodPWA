import { Quote } from 'lucide-react'

function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Branding panel — desktop only, gives the auth flow the same
          teal/serif identity as the sidebar instead of a bare form on
          a blank background. */}
      <div
        className="relative hidden w-[42%] shrink-0 flex-col justify-between overflow-hidden p-12 text-white lg:flex"
        style={{ background: 'linear-gradient(155deg, var(--accent), #0B5C55)' }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 60% 70%, white 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-lg font-bold backdrop-blur-sm"
        >
          T
        </div>

        <div>
          <Quote size={28} className="mb-4 text-white/50" fill="currentColor" strokeWidth={0} />
          <p className="font-display text-3xl font-medium leading-snug">
            "Seek knowledge from the cradle to the grave."
          </p>
          <p className="mt-4 text-sm text-white/70">
            Tamil Islamic lectures and Quran recitations, wherever you are.
          </p>
        </div>

        <p className="text-xs text-white/50">
          Learn • Listen • Reflect
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center px-5 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        {children}
      </div>
    </div>
  )
}

export default AuthLayout
