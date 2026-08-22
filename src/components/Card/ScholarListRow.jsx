import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cardEntrance, cardHover } from '../../lib/motion'
import { useImageFallback } from '../../hooks/useImageFallback'

// Compact horizontal variant of ScholarCard — for dense listings (search
// results, a directory) where a full poster per row would be too heavy.
function ScholarListRow({ scholar, index = 0, episodeCount }) {
  const navigate = useNavigate()
  const { failed, onError } = useImageFallback()
  const showImage = scholar.image && !failed

  return (
    <motion.button
      onClick={() => navigate(`/scholars/${scholar.id}`)}
      {...cardEntrance(index)}
      {...cardHover}
      className="flex w-full items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3 text-left shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full"
        style={{ background: 'var(--accent-soft)', border: showImage ? '2px solid var(--gold)' : 'none' }}>
        {showImage ? (
          <img src={scholar.image} alt={scholar.name} loading="lazy" decoding="async" onError={onError} className="h-full w-full object-cover" />
        ) : (
          <span className="font-display text-base font-semibold" style={{ color: 'var(--accent)' }}>
            {scholar.name?.[0] ?? '?'}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900">{scholar.name}</p>
        {typeof episodeCount === 'number' && (
          <p className="truncate text-xs text-gray-500">{episodeCount} lecture{episodeCount === 1 ? '' : 's'}</p>
        )}
      </div>

      <ChevronRight size={16} className="shrink-0" style={{ color: 'var(--muted)' }} />
    </motion.button>
  )
}

export default ScholarListRow
