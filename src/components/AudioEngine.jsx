import { useEffect, useRef } from 'react'
import { usePlayerStore } from '../store/playerStore'

function AudioEngine() {
  const audioRef = useRef(null)
  const currentEpisode = usePlayerStore((s) => s.currentEpisode)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const volume = usePlayerStore((s) => s.volume)
  const setCurrentTime = usePlayerStore((s) => s.setCurrentTime)
  const setDuration = usePlayerStore((s) => s.setDuration)
  const next = usePlayerStore((s) => s.next)
  const setAudioEl = usePlayerStore((s) => s.setAudioEl)

  useEffect(() => {
    setAudioEl(audioRef.current)
  }, [])

  useEffect(() => {
    if (!audioRef.current || !currentEpisode) return
    const src = currentEpisode.audioAsset?.url ?? currentEpisode.audioUrl ?? ''
    if (src) {
      audioRef.current.src = src
      if (isPlaying) audioRef.current.play().catch(() => {})
    }
  }, [currentEpisode])

  useEffect(() => {
    if (!audioRef.current || !currentEpisode) return
    if (isPlaying) {
      audioRef.current.play().catch(() => {})
    } else {
      audioRef.current.pause()
    }
  }, [isPlaying])

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  return (
    <audio
      ref={audioRef}
      onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
      onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      onEnded={next}
    />
  )
}

export default AudioEngine
