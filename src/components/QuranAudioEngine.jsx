import { useEffect, useRef } from 'react'
import { useQuranStore } from '../store/quranStore'

// Owns the single <audio> element for Quran playback, mounted once at the
// app root so playback survives navigation — mirrors how AudioEngine backs
// the episode MiniPlayer/FullPlayerSheet pair.
function QuranAudioEngine() {
  const audioRef = useRef(null)
  const surahData = useQuranStore((s) => s.surahData)
  const currentAyah = useQuranStore((s) => s.currentAyah)
  const isPlaying = useQuranStore((s) => s.isPlaying)
  const playbackSpeed = useQuranStore((s) => s.playbackSpeed)
  const pause = useQuranStore((s) => s.pause)
  const onAyahEnded = useQuranStore((s) => s.onAyahEnded)

  const ayah = surahData?.ayahs.find((a) => a.number === currentAyah)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.playbackRate = playbackSpeed
    if (isPlaying && ayah) audio.play().catch(() => pause())
    else audio.pause()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, ayah?.audioUrl, playbackSpeed])

  return (
    <audio
      ref={audioRef}
      src={ayah?.audioUrl}
      onEnded={onAyahEnded}
      preload="none"
    />
  )
}

export default QuranAudioEngine
