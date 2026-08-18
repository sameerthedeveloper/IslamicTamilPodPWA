import { usePlayerStore } from '../../store/playerStore'

function TitleCard({ title, image, scholarName, thumbnail, episode, index = 0 }) {
  const play = usePlayerStore((s) => s.play)

  const handleClick = () => {
    if (episode) play(episode)
  }

  return (
    <div
      onClick={handleClick}
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
      className="animate-rise-in flex h-60 w-40 shrink-0 flex-col rounded-2xl border border-gray-200 bg-white p-2 shadow-sm transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]">
      <div
        className="flex flex-1 items-center justify-center rounded-xl border border-gray-200 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, var(--accent-soft), var(--base))' }}>
        {thumbnail ? (
          <img src={thumbnail} alt={title} className="h-full w-full object-cover" />
        ) : (
          <span className="font-display text-3xl font-semibold" style={{ color: 'var(--accent)' }}>{image}</span>
        )}
      </div>

      <p className="mt-2 truncate px-1 text-sm font-medium text-gray-900">
        {title}
      </p>
      {scholarName && (
        <p className="truncate px-1 text-xs text-gray-500">
          {scholarName}
        </p>
      )}
    </div>
  )
}

export default TitleCard
