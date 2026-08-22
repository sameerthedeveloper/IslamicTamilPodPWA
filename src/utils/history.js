import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase'
import { queryClient } from '../queryClient'

// Denormalized so the Home screen can render "Continue Listening" straight
// off this doc, no per-episode joins.
export async function saveProgress(episode, currentTime, duration) {
  const uid = auth.currentUser?.uid
  if (!uid || !episode?.id || !currentTime) return
  await setDoc(
    doc(db, 'users', uid, 'history', String(episode.id)),
    {
      episodeId: episode.id,
      title: episode.title ?? null,
      thumbnail: episode.thumbnail ?? null,
      scholarName: episode.scholar?.name ?? null,
      youtubeId: episode.youtubeId ?? null,
      audioUrl: episode.audioAsset?.url ?? episode.audioUrl ?? null,
      currentTime,
      duration: duration || episode.duration || null,
      playedAt: serverTimestamp(),
    },
    { merge: true },
  ).then(() => {
    // Home's Continue Listening and Library's Recently Played both cache
    // this under ['history', uid] — invalidate so they pick up the new
    // progress next time either is visited, instead of a stale snapshot
    // from before this listen.
    queryClient.invalidateQueries({ queryKey: ['history'] })
  }).catch((err) => {
    // Was silently swallowed before — a permission-denied write (e.g.
    // Firestore rules not actually published yet) looked identical to
    // "Continue Listening" just being empty, with no way to tell them
    // apart. Surface it instead.
    console.error('[history] failed to save playback progress:', err.code || err.message, err)
  })
}
