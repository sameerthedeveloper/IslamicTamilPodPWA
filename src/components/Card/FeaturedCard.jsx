import { motion } from 'framer-motion'
import { Play, Moon, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import BookmarkButton from '../BookmarkButton'
import { cardEntrance, cardHover } from '../../lib/motion'
import { useImageFallback } from '../../hooks/useImageFallback'

// Same illuminated-manuscript language as the Now Playing artwork and
// episode detail screen (dark gradient, gold frame, star-pattern texture,
// crescent+star mark) — the first thing on Home should read as the same
// app as the player, not a generic dark-overlay media card.
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
      className="relative flex h-44 w-72 shrink-0 flex-col justify-end overflow-hidden rounded-2xl cursor-pointer"
      style={{ background: 'linear-gradient(160deg, #0F2E29 0%, #081B18 55%, #050F0D 100%)', border: '2px solid var(--gold)' }}>

      <div className="pattern-star pointer-events-none absolute inset-0 opacity-[0.07]" />

      {showImage && (
        <img src={thumbnail} alt={title} loading="lazy" decoding="async" onError={onError} className="absolute inset-0 h-full w-full object-cover" />
      )}

      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(5,15,13,0.15) 30%, rgba(5,15,13,0.88) 100%)' }} />

      {!showImage && (
        <span
          className="absolute left-4 top-4 font-display text-4xl font-semibold text-white/25">
          {image}
        </span>
      )}

      <div
        className="absolute left-3 top-3 flex items-center gap-1 rounded-full px-2 py-1"
        style={{ background: 'rgba(5,15,13,0.55)', backdropFilter: 'blur(4px)', color: 'var(--gold)' }}>
        <Moon size={11} fill="currentColor" strokeWidth={0} />
        <Star size={5} fill="currentColor" strokeWidth={0} className="-ml-0.5 mt-0.5" />
      </div>

      <BookmarkButton episode={episode} size={14} className="absolute right-3 top-3 h-8 w-8" />

      <div className="relative flex items-end justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="truncate font-display text-base font-semibold text-white">{title}</p>
          {scholarName && (
            <p className="truncate text-xs font-medium" style={{ color: 'var(--gold)' }}>{scholarName}</p>
          )}
        </div>
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white"
          style={{ background: 'linear-gradient(155deg, var(--accent), #0B5C55)', boxShadow: '0 4px 14px -2px rgba(15,118,110,0.6)' }}>
          <Play size={14} fill="currentColor" />
        </span>
      </div>
    </motion.div>
  )
}

export default FeaturedCard
