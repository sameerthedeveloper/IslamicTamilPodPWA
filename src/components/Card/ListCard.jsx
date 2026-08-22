import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import { usePlayerStore } from '../../store/playerStore'
import BookmarkButton from '../BookmarkButton'
import { cardEntrance, cardHover } from '../../lib/motion'

function ListCard({ title, image, scholarName, thumbnail, episode, queue, index = 0 }) {
  const play = usePlayerStore((s) => s.play)

  const handleClick = () => {
    if (episode) play(episode, queue)
  }

  return (
    <motion.div
      onClick={handleClick}
      {...cardEntrance(index)}
      {...cardHover}
      className="flex w-full items-center gap-3 rounded-2xl border border-gray-200 bg-white p-2.5 shadow-sm transition-shadow duration-200 cursor-pointer hover:shadow-md">
      <div
        className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200"
        style={{ background: 'linear-gradient(160deg, var(--accent-soft), var(--base))' }}>
        {thumbnail ? (
          <img src={thumbnail} alt={title} loading="lazy" decoding="async" className="h-full w-full object-cover" />
        ) : (
          <span className="font-display text-lg font-semibold" style={{ color: 'var(--accent)' }}>{image}</span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900">{title}</p>
        {scholarName && (
          <p className="truncate text-xs text-gray-500">{scholarName}</p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <BookmarkButton episode={episode} size={13} className="h-8 w-8" />
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full"
          style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
          <Play size={13} fill="currentColor" />
        </span>
      </div>
    </motion.div>
  )
}

export default ListCard
