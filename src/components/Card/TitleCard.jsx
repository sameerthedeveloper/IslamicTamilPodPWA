import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import BookmarkButton from '../BookmarkButton'
import { cardEntrance, cardHover } from '../../lib/motion'
import { useImageFallback } from '../../hooks/useImageFallback'

function TitleCard({ title, image, scholarName, thumbnail, episode, index = 0 }) {
  const navigate = useNavigate()
  const { failed, onError } = useImageFallback()
  const showImage = thumbnail && !failed

  const handleClick = () => {
    if (episode) navigate(`/episode/${episode.id}`)
  }

  return (
    <motion.div
      onClick={handleClick}
      {...cardEntrance(index)}
      {...cardHover}
      className="flex h-50 w-40 shrink-0 flex-col rounded-2xl border border-gray-200 bg-white p-2 shadow-sm transition-shadow duration-200 cursor-pointer hover:shadow-md">
      <div
        className="relative flex flex-1 items-center justify-center rounded-xl border border-gray-200 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, var(--accent-soft), var(--base))' }}>
        {showImage ? (
          <img src={thumbnail} alt={title} loading="lazy" decoding="async" onError={onError} className="h-full w-full object-cover" />
        ) : (
          <span className="font-display text-3xl font-semibold" style={{ color: 'var(--accent)' }}>{image}</span>
        )}
        <BookmarkButton episode={episode} size={13} className="absolute right-1.5 top-1.5 h-7 w-7" />
      </div>

      <p className="mt-2 truncate px-1 text-sm font-medium text-gray-900">
        {title}
      </p>
      {scholarName && (
        <p className="truncate px-1 text-xs text-gray-500">
          {scholarName}
        </p>
      )}
    </motion.div>
  )
}

export default TitleCard
