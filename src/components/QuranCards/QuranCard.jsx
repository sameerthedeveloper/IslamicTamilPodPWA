import { PlayIcon } from 'lucide-react'

function QuranCard({ title, subtitle, index = 0 }) {
  return (
    <div
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
      className="animate-rise-in mt-4 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]">

      <div className="flex items-center gap-4">

        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-white shadow-sm"
          style={{ background: 'linear-gradient(155deg, var(--accent), #0B5C55)' }}
        >
          <PlayIcon size={20} fill="currentColor" />
        </div>

        <div className="min-w-0">

          <p className="font-display truncate font-semibold text-gray-900">
            {title}
          </p>

          <p className="truncate text-sm text-gray-500">
            {subtitle}
          </p>

        </div>

      </div>

    </div>
  )
}

export default QuranCard
