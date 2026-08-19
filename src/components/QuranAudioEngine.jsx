import { useEffect, useRef } from 'react'
import { useQuranStore } from '../store/quranStore'

// Owns the single <audio> element for Quran playback, mounted once at the
// app root so playback survives navigation — mirrors how AudioEngine backs
// the episode MiniPlayer/FullPlayerSheet pair.
function QuranAudioEngine() {
  const audioRef = useRef(null)
  const prefetchRef = useRef(null)
  const surahData = useQuranStore((s) => s.surahData)
  const currentAyah = useQuranStore((s) => s.currentAyah)
  const isPlaying = useQuranStore((s) => s.isPlaying)
  const playbackSpeed = useQuranStore((s) => s.playbackSpeed)
  const pause = useQuranStore((s) => s.pause)
  const onAyahEnded = useQuranStore((s) => s.onAyahEnded)

  const idx = surahData?.ayahs.findIndex((a) => a.number === currentAyah) ?? -1
  const ayah = idx >= 0 ? surahData.ayahs[idx] : undefined
  const nextAyah = idx >= 0 ? surahData?.ayahs[idx + 1] : undefined

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.playbackRate = playbackSpeed
    if (isPlaying && ayah) audio.play().catch(() => pause())
    else audio.pause()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, ayah?.audioUrl, playbackSpeed])

  // Warm the browser's cache for the next ayah while the current one is
  // still playing, so auto-advance has no loading gap between verses.
  useEffect(() => {
    if (!nextAyah?.audioUrl) return
    const pre = new Audio()
    pre.preload = 'auto'
    pre.src = nextAyah.audioUrl
    prefetchRef.current = pre
    return () => {
      pre.src = ''
    }
  }, [nextAyah?.audioUrl])

  return (
    <audio
      ref={audioRef}
      src={ayah?.audioUrl}
      onEnded={onAyahEnded}
      preload="auto"
    />
  )
}

export default QuranAudioEngine
