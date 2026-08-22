import { motion } from 'framer-motion'
import { ArrowRight, Moon, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cardEntrance, cardHover } from '../../lib/motion'
import { useImageFallback } from '../../hooks/useImageFallback'

// Corner brackets, echoing the cornerpiece ornaments framing text on an
// illuminated manuscript folio — the one flourish this card is allowed,
// reserved for it alone so it stays a signature rather than a pattern
// repeated until it's just decoration.
function CornerBracket({ className }) {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" className={className} aria-hidden="true">
      <path d="M1 13V3a2 2 0 0 1 2-2h10" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
    </svg>
  )
}

// Wide hero variant — the "Featured" treatment for a scholar rather than
// an episode, in the same illuminated-manuscript language as the Now
// Playing artwork (dark gradient, gold frame, star-pattern texture,
// crescent+star mark) so it reads as one app, not a generic hero banner.
function ScholarSpotlightCard({ scholar, episodeCount }) {
  const navigate = useNavigate()
  const { failed, onError } = useImageFallback()
  const showImage = scholar.image && !failed

  return (
    <motion.button
      onClick={() => navigate(`/scholars/${scholar.id}`)}
      {...cardEntrance(0)}
      {...cardHover}
      className="relative flex h-48 w-full items-stretch overflow-hidden rounded-2xl text-left cursor-pointer"
      style={{ background: 'linear-gradient(160deg, #0F2E29 0%, #081B18 55%, #050F0D 100%)', border: '2px solid var(--gold)' }}>

      <div className="pattern-star pointer-events-none absolute inset-0 opacity-[0.07]" />
      <CornerBracket className="absolute left-2.5 top-2.5" />
      <CornerBracket className="absolute right-2.5 bottom-2.5 rotate-180" />

      <div className="relative flex flex-1 flex-col justify-center gap-2 p-6">
        <span className="font-data text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--gold)' }}>
          Scholar Spotlight
        </span>
        <h3 className="font-display text-2xl font-semibold leading-tight text-white">{scholar.name}</h3>
        {typeof episodeCount === 'number' && (
          <p className="text-sm text-white/60">{episodeCount} lecture{episodeCount === 1 ? '' : 's'} on the podcast</p>
        )}
        <span className="mt-1.5 flex items-center gap-1.5 text-sm font-medium" style={{ color: 'var(--gold)' }}>
          View lectures <ArrowRight size={14} />
        </span>
      </div>

      <div className="relative w-28 shrink-0 sm:w-36" style={{ borderLeft: '2px solid var(--gold)' }}>
        {showImage ? (
          <img src={scholar.image} alt="" onError={onError} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-display text-5xl font-semibold text-white/15">{scholar.name?.[0] ?? '?'}</span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(5,15,13,0.5) 0%, transparent 30%)' }} />
        <div
          className="absolute right-2 top-2 flex items-center gap-1 rounded-full px-1.5 py-1"
          style={{ background: 'rgba(5,15,13,0.55)', backdropFilter: 'blur(4px)', color: 'var(--gold)' }}>
          <Moon size={10} fill="currentColor" strokeWidth={0} />
          <Star size={4} fill="currentColor" strokeWidth={0} className="-ml-0.5 mt-0.5" />
        </div>
      </div>
    </motion.button>
  )
}

export default ScholarSpotlightCard
