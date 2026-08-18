import { usePlayerStore } from '../../store/playerStore'

function TitleCard({ title, image, scholarName, thumbnail, episode }) {
  const play = usePlayerStore((s) => s.play)

  const handleClick = () => {
    if (episode) play(episode)
  }

  return (
    <div
      onClick={handleClick}
      className="flex h-60 w-40 shrink-0 flex-col rounded-2xl border border-gray-200 bg-white p-2 shadow-sm cursor-pointer">
      <div
        className="flex flex-1 items-center justify-center rounded-xl border border-gray-200 bg-gray-100 overflow-hidden">
        {thumbnail ? (
          <img src={thumbnail} alt={title} className="h-full w-full object-cover" />
        ) : (
          image
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
