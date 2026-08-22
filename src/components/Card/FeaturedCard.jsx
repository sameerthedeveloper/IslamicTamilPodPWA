import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import BookmarkButton from '../BookmarkButton'
import { cardEntrance, cardHover } from '../../lib/motion'
import { useImageFallback } from '../../hooks/useImageFallback'

function FeaturedCard({ title, image, scholarName, thumbnail, episode, index = 0 }) {
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
      className="relative flex h-44 w-72 shrink-0 flex-col justify-end overflow-hidden rounded-2xl border border-gray-200 shadow-sm transition-shadow duration-200 cursor-pointer hover:shadow-md">
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(160deg, var(--accent-soft), var(--base))' }}>
        {showImage && (
          <img src={thumbnail} alt={title} loading="lazy" decoding="async" onError={onError} className="h-full w-full object-cover" />
        )}
      </div>

      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.65) 100%)' }} />

      {!showImage && (
        <span
          className="absolute left-4 top-4 font-display text-4xl font-semibold"
          style={{ color: 'var(--accent)' }}>
          {image}
        </span>
      )}

      <BookmarkButton episode={episode} size={14} className="absolute right-3 top-3 h-8 w-8 bg-white/90" />

      <div className="relative flex items-end justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-white">{title}</p>
          {scholarName && (
            <p className="truncate text-xs text-white/80">{scholarName}</p>
          )}
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/90" style={{ color: 'var(--accent)' }}>
          <Play size={15} fill="currentColor" />
        </span>
      </div>
    </motion.div>
  )
}

export default FeaturedCard
