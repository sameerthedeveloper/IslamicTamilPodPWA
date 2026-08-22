import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Play, Pause, CloudOff, Share2, MapPin, Moon, Star } from 'lucide-react'
import { getEpisode } from '../api/client'
import { usePlayerStore } from '../store/playerStore'
import BookmarkButton from '../components/BookmarkButton'
import { useImageFallback } from '../hooks/useImageFallback'

function formatDate(ms) {
  if (!ms) return null
  return new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(ms))
}

function Artwork({ thumbnail, title }) {
  const { failed, onError } = useImageFallback()
  const showImage = thumbnail && !failed
  return (
    <div
      className="relative mx-auto flex aspect-square w-full max-w-56 shrink-0 items-center justify-center overflow-hidden rounded-3xl"
      style={{ background: 'linear-gradient(160deg, #0F2E29 0%, #081B18 55%, #050F0D 100%)', border: '3px solid var(--gold)' }}>
      <div className="pattern-star pointer-events-none absolute inset-0 opacity-[0.08]" />
      {showImage ? (
        <img src={thumbnail} alt="" onError={onError} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <span className="font-display relative text-6xl font-semibold text-white/90">{title?.[0] ?? 'I'}</span>
      )}
      <div
        className="absolute right-3 top-3 flex items-center gap-1 rounded-full px-2 py-1"
        style={{ background: 'rgba(5,15,13,0.55)', backdropFilter: 'blur(4px)', color: 'var(--gold)' }}>
        <Moon size={12} fill="currentColor" strokeWidth={0} />
        <Star size={5} fill="currentColor" strokeWidth={0} className="-ml-0.5 mt-0.5" />
      </div>
    </div>
  )
}

function EpisodeDetailPage() {
  const { episodeId } = useParams()
  const navigate = useNavigate()
  const [episode, setEpisode] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [copied, setCopied] = useState(false)

  const play = usePlayerStore((s) => s.play)
  const togglePlay = usePlayerStore((s) => s.togglePlay)
  const currentEpisode = usePlayerStore((s) => s.currentEpisode)
  const isPlaying = usePlayerStore((s) => s.isPlaying)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)
    getEpisode(episodeId)
      .then((data) => {
        if (!cancelled) setEpisode(data)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [episodeId])

  const isCurrent = currentEpisode?.id === episode?.id
  const handlePlay = () => {
    if (!episode) return
    if (isCurrent) togglePlay()
    else play(episode, [episode])
  }

  const handleShare = async () => {
    const url = episode?.sourceUrl || window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: episode?.title, url })
        return
      } catch {
        // user cancelled the native share sheet — fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // clipboard unavailable — nothing more we can do here
    }
  }

  return (
    <div className="px-5 pt-6 pb-6 lg:mx-auto lg:max-w-2xl lg:px-10 lg:pt-10">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900">
        <ArrowLeft size={16} /> Back
      </button>

      {loading && (
        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="skeleton mx-auto aspect-square w-full max-w-56 rounded-3xl" />
          <div className="skeleton h-5 w-2/3 rounded-full" />
          <div className="skeleton h-3.5 w-1/3 rounded-full" />
        </div>
      )}

      {!loading && (error || !episode) && (
        <div className="mt-8 flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4">
          <CloudOff size={18} style={{ color: 'var(--muted)' }} />
          <p className="text-sm text-gray-500">Couldn't load this episode.</p>
        </div>
      )}

      {!loading && !error && episode && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div className="mt-6">
            <Artwork thumbnail={episode.thumbnail} title={episode.title} />
          </div>

          <div className="mt-6 text-center">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-gray-900">
              {episode.title}
            </h1>
            <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
              {episode.scholar?.name && episode.scholarId ? (
                <Link to={`/scholars/${episode.scholarId}`} className="font-medium" style={{ color: 'var(--accent)' }}>
                  {episode.scholar.name}
                </Link>
              ) : episode.scholar?.name}
              {episode.createdAt && <span> · {formatDate(episode.createdAt)}</span>}
              {episode.series?.name && <span> · {episode.series.name}</span>}
            </p>
            {episode.location && (
              <p className="mt-1 flex items-center justify-center gap-1 text-xs" style={{ color: 'var(--muted)' }}>
                <MapPin size={12} /> {episode.location}
              </p>
            )}
          </div>

          <div className="mt-6 flex items-center justify-center gap-4">
            <BookmarkButton episode={episode} size={18} className="h-11 w-11" />

            <button
              onClick={handlePlay}
              className="flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg transition-transform duration-150 hover:opacity-90 active:scale-90"
              style={{
                background: 'linear-gradient(155deg, var(--accent), #0B5C55)',
                boxShadow: '0 8px 24px -4px rgba(15, 118, 110, 0.5)',
              }}
              aria-label={isCurrent && isPlaying ? 'Pause' : 'Play episode'}>
              {isCurrent && isPlaying ? <Pause size={26} strokeWidth={2.5} /> : <Play size={26} strokeWidth={2.5} />}
            </button>

            <button
              onClick={handleShare}
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:bg-gray-50"
              aria-label="Share episode">
              <Share2 size={17} />
              {copied && (
                <span className="absolute -top-8 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium text-white" style={{ background: 'var(--ink)' }}>
                  Link copied
                </span>
              )}
            </button>
          </div>

          {episode.topics?.length > 0 && (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {episode.topics.map((t) => (
                <span
                  key={t}
                  className="rounded-full px-3 py-1 text-xs font-medium"
                  style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                  {t}
                </span>
              ))}
            </div>
          )}

          <div className="mt-8 border-t border-gray-200 pt-6">
            <h2 className="font-display text-lg font-semibold text-gray-900">About this episode</h2>
            {episode.description ? (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-600">{episode.description}</p>
            ) : (
              <p className="mt-3 text-sm text-gray-500">No description available for this episode.</p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default EpisodeDetailPage
