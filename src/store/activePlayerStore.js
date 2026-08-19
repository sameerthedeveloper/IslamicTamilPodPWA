import { create } from 'zustand'

// Which of the two independent audio sources (episode vs Quran) is the
// one currently "in focus" — used purely to decide which mini player to
// show, so they never both dock on screen at once. Playback itself is
// already mutually exclusive (see quranStore's pause/close coordination);
// this just tracks which one the user last engaged with, so a paused
// session still keeps its mini bar until the other one is actually
// started.
export const useActivePlayerStore = create(() => ({
  active: null, // 'episode' | 'quran' | null
}))
