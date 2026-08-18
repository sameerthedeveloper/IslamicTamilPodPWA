import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase'

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
  ).catch(() => {})
}
