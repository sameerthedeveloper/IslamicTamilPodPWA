import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cardEntrance, cardHover } from '../../lib/motion'
import { useImageFallback } from '../../hooks/useImageFallback'

// Wide hero variant — the "Featured" treatment for a scholar rather than
// an episode. Same visual language as FeaturedCard (accent-soft-to-base
// gradient, image bleeding through, dark-to-transparent overlay for the
// text) so it reads as the same card family, not a different app.
function ScholarSpotlightCard({ scholar, episodeCount }) {
  const navigate = useNavigate()
  const { failed, onError } = useImageFallback()
  const showImage = scholar.image && !failed

  return (
    <motion.button
      onClick={() => navigate(`/scholars/${scholar.id}`)}
      {...cardEntrance(0)}
      {...cardHover}
      className="relative flex h-44 w-full flex-col justify-end overflow-hidden rounded-2xl border border-gray-200 text-left shadow-sm transition-shadow duration-200 cursor-pointer hover:shadow-md">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, var(--accent-soft), var(--base))' }}>
        {showImage && (
          <img src={scholar.image} alt={scholar.name} onError={onError} className="h-full w-full object-cover" />
        )}
      </div>

      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 35%, rgba(0,0,0,0.7) 100%)' }} />

      {!showImage && (
        <span className="absolute left-4 top-4 font-display text-4xl font-semibold" style={{ color: 'var(--accent)' }}>
          {scholar.name?.[0] ?? '?'}
        </span>
      )}

      <span className="absolute left-4 top-4 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-white" style={{ background: 'rgba(0,0,0,0.35)' }}>
        Scholar Spotlight
      </span>

      <div className="relative flex items-end justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-white">{scholar.name}</p>
          {typeof episodeCount === 'number' && (
            <p className="truncate text-xs text-white/80">{episodeCount} lecture{episodeCount === 1 ? '' : 's'}</p>
          )}
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/90" style={{ color: 'var(--accent)' }}>
          <ArrowRight size={15} />
        </span>
      </div>
    </motion.button>
  )
}

export default ScholarSpotlightCard
