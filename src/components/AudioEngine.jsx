import { useEffect, useRef, useState } from 'react'
import { usePlayerStore } from '../store/playerStore'
import { saveProgress } from '../utils/history'

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
  const rafRef = useRef(null)
  const currentEpisode = usePlayerStore((s) => s.currentEpisode)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const volume = usePlayerStore((s) => s.volume)
  const playbackRate = usePlayerStore((s) => s.playbackRate)
  const setCurrentTime = usePlayerStore((s) => s.setCurrentTime)
  const setDuration = usePlayerStore((s) => s.setDuration)
  const onEnded = usePlayerStore((s) => s.onEnded)
  const registerEngine = usePlayerStore((s) => s.registerEngine)
  const isYoutube = !!currentEpisode?.youtubeId

  useEffect(() => {
    registerEngine('audio', {
      seek: (time) => {
        if (audioRef.current) audioRef.current.currentTime = time
      },
      // Called directly and synchronously from the Media Session 'play'
      // handler (see MediaSessionSync) — iOS only carries the lock-screen
      // tap's user-activation for a play() call made inside that same
      // synchronous callback, not one a React effect gets to later.
      resume: () => {
        console.log('[audio] engine.resume() called, paused =', audioRef.current?.paused)
        if (!audioRef.current?.paused) return
        // A rejection here (autoplay policy, or the OS genuinely meant to
        // keep it paused) doesn't fire a 'pause' event — it was already
        // paused, nothing changed — so sync the store here directly
        // instead of relying on handleNativePause below to catch it.
        audioRef.current.play()
          .then(() => {
            console.log('[audio] engine.resume() succeeded')
            usePlayerStore.getState().setPlaying(true)
          })
          .catch((err) => {
            console.error('[audio] engine.resume() FAILED:', err?.name, err?.message)
            usePlayerStore.getState().setPlaying(false)
          })
      },
      pause: () => {
        console.log('[audio] engine.pause() called')
        audioRef.current?.pause()
      },
    })
  }, [])

  // onTimeUpdate fires irregularly (~4/s) — drive the progress bar off a
  // rAF loop instead so it reads smooth, like a native player.
  useEffect(() => {
    if (isYoutube || !isPlaying) return
    const tick = () => {
      if (audioRef.current) setCurrentTime(audioRef.current.currentTime)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [isPlaying, isYoutube])

  useEffect(() => {
    if (!audioRef.current || !currentEpisode || isYoutube) return
    const src = currentEpisode.audioAsset?.url ?? currentEpisode.audioUrl ?? ''
    if (src) {
      audioRef.current.src = src
      if (currentEpisode.currentTime) audioRef.current.currentTime = currentEpisode.currentTime
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

  // The other engine's effects early-return once isYoutube flips (they
  // guard on `isYoutube`), so switching tracks never actually pauses
  // whichever engine was playing the previous one — without this both
  // play at once. Explicitly stop this engine the moment it's no longer
  // the active one.
  useEffect(() => {
    if (isYoutube) audioRef.current?.pause()
  }, [isYoutube])

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackRate
  }, [playbackRate])

  // Mobile OSes (iOS lock screen especially) can pause the underlying
  // <audio> element on their own — not through togglePlay()/pause() — to
  // suspend a backgrounded tab, briefly hand audio focus to something
  // else, etc. Previously nothing listened for that, so the store (and
  // the mini/full player UI) kept claiming "playing" while no sound was
  // actually coming out, with no way to tell short of tapping play twice.
  // Try one immediate resume; if that's rejected (the OS meant to pause
  // it, or a programmatic resume needs a real tap it didn't get), reflect
  // reality so the UI shows Play again — one tap then genuinely works,
  // instead of a player that silently lies about its own state forever.
  const handleNativePause = () => {
    if (isYoutube) return
    const { isPlaying: storeIsPlaying, setPlaying } = usePlayerStore.getState()
    console.log('[audio] native "pause" event fired, store isPlaying =', storeIsPlaying)
    if (!storeIsPlaying) return
    console.log('[audio] involuntary pause detected — attempting immediate resume')
    audioRef.current?.play()
      .then(() => {
        console.log('[audio] involuntary-pause resume succeeded')
        setPlaying(true)
      })
      .catch((err) => {
        console.error('[audio] involuntary-pause resume FAILED:', err?.name, err?.message)
        setPlaying(false)
      })
  }

  const handleNativePlay = () => {
    if (isYoutube) return
    const { isPlaying: storeIsPlaying, setPlaying } = usePlayerStore.getState()
    console.log('[audio] native "play" event fired, store isPlaying =', storeIsPlaying)
    if (!storeIsPlaying) setPlaying(true)
  }

  return (
    <audio
      ref={audioRef}
      preload="auto"
      onTimeUpdate={(e) => { if (!isYoutube) setCurrentTime(e.currentTarget.currentTime) }}
      onLoadedMetadata={(e) => { if (!isYoutube) setDuration(e.currentTarget.duration) }}
      onEnded={() => { if (!isYoutube) onEnded() }}
      onPause={handleNativePause}
      onPlay={handleNativePlay}
    />
  )
}

// YouTube's iframe API only exposes one quality knob and it's video
// resolution — there's no separate audio-bitrate control, and audio
// barely changes across resolution tiers anyway. So "lowest data, same
// audio" just means: pin video to the smallest available tier. Bandwidth
// is overwhelmingly video, so this is most of the win available here.
function forceLowestQuality(player) {
  const levels = player?.getAvailableQualityLevels?.()
  const lowest = levels?.length ? levels[levels.length - 1] : 'small'
  player?.setPlaybackQuality?.(lowest)
}

function YoutubeEngine() {
  const containerRef = useRef(null)
  const playerRef = useRef(null)
  const pollRef = useRef(null)
  // The IFrame API loads asynchronously — if a video is already selected
  // by the time onReady fires (e.g. the very first play of a session,
  // before the script has finished loading), the load/play effects below
  // must re-run once the player actually exists. Refs don't trigger
  // re-renders, so this needs to be real state.
  const [isReady, setIsReady] = useState(false)
  const currentEpisode = usePlayerStore((s) => s.currentEpisode)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const volume = usePlayerStore((s) => s.volume)
  const playbackRate = usePlayerStore((s) => s.playbackRate)
  const setCurrentTime = usePlayerStore((s) => s.setCurrentTime)
  const setDuration = usePlayerStore((s) => s.setDuration)
  const onEnded = usePlayerStore((s) => s.onEnded)
  const registerEngine = usePlayerStore((s) => s.registerEngine)
  const isYoutube = !!currentEpisode?.youtubeId

  useEffect(() => {
    let cancelled = false
    loadYoutubeApi().then((YT) => {
      if (cancelled) return
      playerRef.current = new YT.Player(containerRef.current, {
        // iOS/WebKit treats 1x1 iframes as likely ad/tracker content and
        // suspends them (and their audio) far more aggressively in the
        // background — a real-sized iframe positioned off-screen doesn't
        // trip that heuristic and keeps playing when the screen locks.
        height: '180',
        width: '320',
        playerVars: {
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          origin: window.location.origin,
          // Undocumented but harmless hint some clients still honor as a
          // starting point — the real enforcement is setPlaybackQuality
          // below, since this alone isn't reliable.
          vq: 'small',
        },
        events: {
          onReady: () => {
            registerEngine('youtube', {
              seek: (time) => playerRef.current?.seekTo(time, true),
              resume: () => {
                if (playerRef.current?.getPlayerState?.() !== YT.PlayerState.PLAYING) {
                  playerRef.current?.playVideo?.()
                }
              },
              pause: () => playerRef.current?.pauseVideo?.(),
            })
            playerRef.current.setVolume(volume * 100)
            forceLowestQuality(playerRef.current)
            setIsReady(true)
          },
          onStateChange: (e) => {
            if (e.data === YT.PlayerState.ENDED) onEnded()
            // Starting a new video (or resuming) can silently reset
            // YouTube's own quality choice — re-pin it each time.
            if (e.data === YT.PlayerState.PLAYING || e.data === YT.PlayerState.CUED) {
              forceLowestQuality(playerRef.current)
            }
          },
          // YouTube can still bump itself back up mid-playback (e.g. once
          // it decides the connection can handle more) — pin it back down.
          onPlaybackQualityChange: () => forceLowestQuality(playerRef.current),
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
    if (!playerRef.current || !isReady || !isYoutube || !currentEpisode) return
    if (playerRef.current.getVideoData?.()?.video_id !== currentEpisode.youtubeId) {
      playerRef.current.loadVideoById({
        videoId: currentEpisode.youtubeId,
        startSeconds: currentEpisode.currentTime || 0,
      })
      setDuration(0)
      if (!isPlaying) playerRef.current.pauseVideo?.()
    }
  }, [currentEpisode, isYoutube, isReady])

  useEffect(() => {
    if (!playerRef.current || !isReady || !isYoutube) return
    if (isPlaying) playerRef.current.playVideo?.()
    else playerRef.current.pauseVideo?.()
  }, [isPlaying, isYoutube, isReady])

  // Mirror of NativeAudioEngine's guard above: pause this engine the
  // moment a native track becomes active, since its own play/pause effect
  // (deps include isYoutube) stops reacting once isYoutube goes false.
  useEffect(() => {
    if (!isYoutube) playerRef.current?.pauseVideo?.()
  }, [isYoutube])

  useEffect(() => {
    if (playerRef.current?.setVolume) playerRef.current.setVolume(volume * 100)
  }, [volume, isReady])

  useEffect(() => {
    if (playerRef.current?.setPlaybackRate) playerRef.current.setPlaybackRate(playbackRate)
  }, [playbackRate, isReady])

  useEffect(() => {
    clearInterval(pollRef.current)
    if (!isYoutube || !isReady) return
    pollRef.current = setInterval(() => {
      const p = playerRef.current
      if (!p?.getCurrentTime) return
      setCurrentTime(p.getCurrentTime())
      const d = p.getDuration?.()
      if (d) setDuration(d)
    }, 250)
    return () => clearInterval(pollRef.current)
  }, [isYoutube, isReady])

  return (
    <div style={{ position: 'fixed', top: 0, left: '-9999px', width: 320, height: 180, pointerEvents: 'none' }}>
      <div ref={containerRef} />
    </div>
  )
}

// Lock-screen / notification-shade media controls, like a native player.
// Also what keeps most browsers from suspending playback when the app is
// backgrounded — an active MediaSession session signals "this is media
// playback", not just a hidden tab doing background work.
const SUPPORTS_MEDIA_SESSION = typeof navigator !== 'undefined' && 'mediaSession' in navigator

// Registering an action the browser doesn't recognize throws — wrap each
// so one unsupported action can't take the rest down with it.
function setActionHandler(action, handler) {
  try {
    navigator.mediaSession.setActionHandler(action, handler)
  } catch {
    // Unsupported action on this browser — fine, play/pause etc. still work.
  }
}

function MediaSessionSync() {
  const currentEpisode = usePlayerStore((s) => s.currentEpisode)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const duration = usePlayerStore((s) => s.duration)
  const currentTime = usePlayerStore((s) => s.currentTime)

  useEffect(() => {
    if (!SUPPORTS_MEDIA_SESSION) {
      console.log('[audio] Media Session API not supported in this browser')
      return
    }
    if (!currentEpisode) return
    console.log('[audio] registering mediaSession handlers for', currentEpisode.title)
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentEpisode.title,
      artist: currentEpisode.scholar?.name ?? '',
      artwork: currentEpisode.thumbnail
        ? [{ src: currentEpisode.thumbnail, sizes: '512x512', type: 'image/jpeg' }]
        : [],
    })

    // These read usePlayerStore.getState() fresh on every invocation (not
    // values captured when this effect ran) so they can't go stale, and —
    // critically for 'play' — call the actual HTMLAudioElement/YouTube
    // player synchronously via activeEngine(), in the same tick as the
    // lock-screen tap. Routing this through isPlaying + a later effect
    // (the way the in-app play button does, which is fine for a direct
    // click) loses iOS's implicit user-activation for the play() call by
    // the time that effect runs — that's what made lock-screen Play stop
    // reliably resuming after a lock-screen Pause.
    setActionHandler('play', () => {
      console.log('[audio] mediaSession "play" action received')
      const { currentEpisode: ep, activeEngine } = usePlayerStore.getState()
      if (!ep) return
      activeEngine()?.resume?.()
    })
    setActionHandler('pause', () => {
      console.log('[audio] mediaSession "pause" action received')
      const { currentEpisode: ep, activeEngine, setPlaying } = usePlayerStore.getState()
      if (!ep) return
      setPlaying(false)
      activeEngine()?.pause?.()
    })
    setActionHandler('stop', () => {
      const { currentEpisode: ep, activeEngine, setPlaying, seek } = usePlayerStore.getState()
      if (!ep) return
      setPlaying(false)
      activeEngine()?.pause?.()
      seek(0)
    })
    setActionHandler('nexttrack', () => usePlayerStore.getState().next())
    setActionHandler('previoustrack', () => usePlayerStore.getState().prev())
    setActionHandler('seekbackward', (details) => {
      usePlayerStore.getState().skipBy(-(details.seekOffset || 10))
    })
    setActionHandler('seekforward', (details) => {
      usePlayerStore.getState().skipBy(details.seekOffset || 10)
    })
    setActionHandler('seekto', (details) => {
      if (details.seekTime != null) usePlayerStore.getState().seek(details.seekTime)
    })

    return () => {
      setActionHandler('play', null)
      setActionHandler('pause', null)
      setActionHandler('stop', null)
      setActionHandler('nexttrack', null)
      setActionHandler('previoustrack', null)
      setActionHandler('seekbackward', null)
      setActionHandler('seekforward', null)
      setActionHandler('seekto', null)
      // currentEpisode is the dep this whole effect re-runs on — becoming
      // null (queue exhausted, or onEnded with nothing next) means
      // playback is genuinely over, not just paused.
      if (!usePlayerStore.getState().currentEpisode) {
        navigator.mediaSession.playbackState = 'none'
      }
    }
  }, [currentEpisode])

  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused'
    }
  }, [isPlaying])

  useEffect(() => {
    if (!('mediaSession' in navigator) || !duration || !isFinite(duration)) return
    try {
      navigator.mediaSession.setPositionState({
        duration,
        position: Math.min(currentTime, duration),
        playbackRate: 1,
      })
    } catch {
      // Some browsers throw if position > duration mid-seek — ignore.
    }
  }, [duration, currentTime])

  return null
}

// Periodically persists playback position to Firestore ("Continue
// Listening" on the Home screen) — throttled while playing, plus an
// immediate flush whenever the track changes or playback stops.
function HistorySync() {
  const currentEpisode = usePlayerStore((s) => s.currentEpisode)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const currentTime = usePlayerStore((s) => s.currentTime)
  const duration = usePlayerStore((s) => s.duration)
  const lastSavedRef = useRef(0)
  const stateRef = useRef({})
  useEffect(() => {
    stateRef.current = { currentEpisode, currentTime, duration }
  })

  useEffect(() => {
    if (!isPlaying || !currentEpisode) return
    const id = setInterval(() => {
      const { currentEpisode: ep, currentTime: t, duration: d } = stateRef.current
      saveProgress(ep, t, d)
      lastSavedRef.current = t
    }, 10000)
    return () => clearInterval(id)
  }, [isPlaying, currentEpisode?.id])

  // Flush on pause, track switch, or unmount so the last few seconds aren't lost.
  useEffect(() => {
    return () => {
      const { currentEpisode: ep, currentTime: t, duration: d } = stateRef.current
      if (ep && Math.abs(t - lastSavedRef.current) > 2) saveProgress(ep, t, d)
    }
  }, [currentEpisode?.id, isPlaying])

  // Also flush when the page is backgrounded — a PWA doesn't reliably
  // unmount on background/OS-kill the way a closed tab does, so the
  // unmount-only flush above can miss the last stretch of listening
  // entirely if the app never comes back to foreground.
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState !== 'hidden') return
      const { currentEpisode: ep, currentTime: t, duration: d } = stateRef.current
      if (ep && Math.abs(t - lastSavedRef.current) > 2) {
        saveProgress(ep, t, d)
        lastSavedRef.current = t
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  return null
}

// iOS can silently pause a backgrounded/locked YouTube iframe despite the
// fixes above. Re-assert play on return to foreground so the user comes
// back to actually-playing audio instead of a silently stalled player.
function ForegroundResume() {
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const activeEngine = usePlayerStore((s) => s.activeEngine)

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && isPlaying) {
        activeEngine()?.resume?.()
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [isPlaying])

  return null
}

function AudioEngine() {
  return (
    <>
      <NativeAudioEngine />
      <YoutubeEngine />
      <MediaSessionSync />
      <HistorySync />
      <ForegroundResume />
    </>
  )
}

export default AudioEngine
