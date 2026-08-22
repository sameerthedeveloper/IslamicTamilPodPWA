import { motion } from 'framer-motion'
import { GraduationCap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cardEntrance, cardHover } from '../../lib/motion'
import { useImageFallback } from '../../hooks/useImageFallback'

// Same card chrome as TitleCard/ListCard/FeaturedCard — white card, a
// bordered image slot, title then subtitle below it — so a scholar reads
// as one more card in the same family the rest of the app already uses,
// not a one-off design. Portrait sits in the image slot the way an
// episode's artwork does; the cap badge stands in for the bookmark
// button (there's nothing to bookmark on a scholar).
function ScholarCard({ scholar, index = 0, episodeCount, shrink = false }) {
  const navigate = useNavigate()
  const { failed, onError } = useImageFallback()
  const showImage = scholar.image && !failed

  return (
    <motion.button
      onClick={() => navigate(`/scholars/${scholar.id}`)}
      {...cardEntrance(index)}
      {...cardHover}
      className={`flex h-50 flex-col rounded-2xl border border-gray-200 bg-white p-2 text-left shadow-sm transition-shadow duration-200 cursor-pointer hover:shadow-md ${shrink ? 'w-40 shrink-0' : 'w-full'}`}>
      <div
        className="relative flex flex-1 items-center justify-center rounded-xl border border-gray-200 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, var(--accent-soft), var(--base))' }}>
        {showImage ? (
          <img src={scholar.image} alt={scholar.name} loading="lazy" decoding="async" onError={onError} className="h-full w-full object-cover" />
        ) : (
          <span className="font-display text-3xl font-semibold" style={{ color: 'var(--accent)' }}>
            {scholar.name?.[0] ?? '?'}
          </span>
        )}
        <span className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white/90 shadow-sm">
          <GraduationCap size={13} style={{ color: 'var(--accent)' }} />
        </span>
      </div>

      <p className="mt-2 truncate px-1 text-sm font-medium text-gray-900">
        {scholar.name}
      </p>
      {typeof episodeCount === 'number' && (
        <p className="truncate px-1 text-xs text-gray-500">
          {episodeCount} lecture{episodeCount === 1 ? '' : 's'}
        </p>
      )}
    </motion.button>
  )
}

export default ScholarCard
