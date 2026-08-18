import { useEffect, useRef } from 'react'
import { usePlayerStore } from '../store/playerStore'

let ytApiPromise = null
function loadYoutubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (ytApiPromise) return ytApiPromise
  ytApiPromise = new Promise((resolve) => {
    const prevReady = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prevReady?.()
      resolve(window.YT)
    }
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(tag)
  })
  return ytApiPromise
}

function NativeAudioEngine() {
  const audioRef = useRef(null)
  const currentEpisode = usePlayerStore((s) => s.currentEpisode)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const volume = usePlayerStore((s) => s.volume)
  const setCurrentTime = usePlayerStore((s) => s.setCurrentTime)
  const setDuration = usePlayerStore((s) => s.setDuration)
  const next = usePlayerStore((s) => s.next)
  const registerEngine = usePlayerStore((s) => s.registerEngine)
  const isYoutube = !!currentEpisode?.youtubeId

  useEffect(() => {
    registerEngine('audio', {
      seek: (time) => {
        if (audioRef.current) audioRef.current.currentTime = time
      },
    })
  }, [])

  useEffect(() => {
    if (!audioRef.current || !currentEpisode || isYoutube) return
    const src = currentEpisode.audioAsset?.url ?? currentEpisode.audioUrl ?? ''
    if (src) {
      audioRef.current.src = src
      if (isPlaying) audioRef.current.play().catch(() => {})
    }
  }, [currentEpisode])

  useEffect(() => {
    if (!audioRef.current || !currentEpisode || isYoutube) return
    if (isPlaying) {
      audioRef.current.play().catch(() => {})
    } else {
      audioRef.current.pause()
    }
  }, [isPlaying, isYoutube])

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  return (
    <audio
      ref={audioRef}
      onTimeUpdate={(e) => { if (!isYoutube) setCurrentTime(e.currentTarget.currentTime) }}
      onLoadedMetadata={(e) => { if (!isYoutube) setDuration(e.currentTarget.duration) }}
      onEnded={() => { if (!isYoutube) next() }}
    />
  )
}

function YoutubeEngine() {
  const containerRef = useRef(null)
  const playerRef = useRef(null)
  const pollRef = useRef(null)
  const currentEpisode = usePlayerStore((s) => s.currentEpisode)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const volume = usePlayerStore((s) => s.volume)
  const setCurrentTime = usePlayerStore((s) => s.setCurrentTime)
  const setDuration = usePlayerStore((s) => s.setDuration)
  const next = usePlayerStore((s) => s.next)
  const registerEngine = usePlayerStore((s) => s.registerEngine)
  const isYoutube = !!currentEpisode?.youtubeId

  useEffect(() => {
    let cancelled = false
    loadYoutubeApi().then((YT) => {
      if (cancelled) return
      playerRef.current = new YT.Player(containerRef.current, {
        height: '1',
        width: '1',
        playerVars: { controls: 0, disablekb: 1, fs: 0, modestbranding: 1, playsinline: 1 },
        events: {
          onReady: () => {
            registerEngine('youtube', {
              seek: (time) => playerRef.current?.seekTo(time, true),
            })
            playerRef.current.setVolume(volume * 100)
          },
          onStateChange: (e) => {
            if (e.data === YT.PlayerState.ENDED) next()
          },
        },
      })
    })
    return () => {
      cancelled = true
      playerRef.current?.destroy?.()
      clearInterval(pollRef.current)
    }
  }, [])

  useEffect(() => {
    if (!playerRef.current || !isYoutube || !currentEpisode) return
    if (playerRef.current.getVideoData?.()?.video_id !== currentEpisode.youtubeId) {
      playerRef.current.loadVideoById(currentEpisode.youtubeId)
      setDuration(0)
      if (!isPlaying) playerRef.current.pauseVideo?.()
    }
  }, [currentEpisode, isYoutube])

  useEffect(() => {
    if (!playerRef.current || !isYoutube) return
    if (isPlaying) playerRef.current.playVideo?.()
    else playerRef.current.pauseVideo?.()
  }, [isPlaying, isYoutube])

  useEffect(() => {
    if (playerRef.current?.setVolume) playerRef.current.setVolume(volume * 100)
  }, [volume])

  useEffect(() => {
    clearInterval(pollRef.current)
    if (!isYoutube) return
    pollRef.current = setInterval(() => {
      const p = playerRef.current
      if (!p?.getCurrentTime) return
      setCurrentTime(p.getCurrentTime())
      const d = p.getDuration?.()
      if (d) setDuration(d)
    }, 500)
    return () => clearInterval(pollRef.current)
  }, [isYoutube])

  return <div style={{ position: 'fixed', width: 1, height: 1, opacity: 0, pointerEvents: 'none', overflow: 'hidden' }}>
    <div ref={containerRef} />
  </div>
}

function AudioEngine() {
  return (
    <>
      <NativeAudioEngine />
      <YoutubeEngine />
    </>
  )
}

export default AudioEngine
