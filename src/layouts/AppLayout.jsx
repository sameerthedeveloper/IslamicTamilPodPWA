import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import BottomNavigationBar from '../components/BottomNavigationBar'
import MiniPlayer from '../components/MiniPlayer'
import TopBar from '../components/TopBar'
import Sidebar from '../components/Sidebar'
import AudioEngine from '../components/AudioEngine'
import ErrorBoundary from '../components/ErrorBoundary'
import FullPlayerSheet from '../components/FullPlayerSheet'
import QuranAudioEngine from '../components/QuranAudioEngine'
import QuranMiniPlayer from '../components/QuranMiniPlayer'
import QuranFullPlayerSheet from '../components/QuranFullPlayerSheet'
import { usePlayerStore } from '../store/playerStore'
import { useQuranStore } from '../store/quranStore'
import { useActivePlayerStore } from '../store/activePlayerStore'
import { useImmersiveRoute } from '../hooks/useImmersiveRoute'

function AppLayout() {
  const { pathname } = useLocation()
  const isQuran = pathname === '/quran'

  // Immersive detail screens (an episode, or a specific scholar) have
  // their own in-page Back button, so the mobile header/bottom nav would
  // just be redundant chrome eating space — unlike /scholars itself,
  // which is a bottom-nav destination with no other way to switch tabs,
  // so that one keeps its nav.
  const isImmersive = useImmersiveRoute()

  // Mirrors the visibility logic in MiniPlayer/QuranMiniPlayer — when one
  // of them is docked, scrollable content needs extra bottom padding or
  // its last row ends up hidden behind the floating bar (rather than
  // scrolled past it).
  const hasEpisode = usePlayerStore((s) => !!s.currentEpisode)
  const hasSurah = useQuranStore((s) => !!s.currentSurah)
  const active = useActivePlayerStore((s) => s.active)
  const miniPlayerDocked = !isQuran && ((hasEpisode && active !== 'quran') || (hasSurah && active !== 'episode'))

  return (
    <div
      className="flex h-screen flex-col overflow-hidden lg:flex-row"
      style={{
        // Floating bottom chrome's distance from the screen edge. Plain
        // addition (baseline + env(safe-area-inset-bottom)) double-counts
        // once installed as a standalone PWA: in a regular browser tab the
        // inset is 0 so it read fine, but standalone iOS reports a real
        // ~34px inset, and baseline-on-top-of-that stacked into a much
        // bigger gap than intended. max() makes the baseline a floor for
        // the no-inset case instead of an addend on top of a real one.
        '--nav-gap': 'max(1.25rem, calc(env(safe-area-inset-bottom) + 0.5rem))',
      }}
    >
      <Sidebar />
      {!isImmersive && <TopBar />}

      <main
        className={`flex-1 overflow-y-auto ${isImmersive ? 'pt-[env(safe-area-inset-top)]' : 'pt-[calc(5rem+env(safe-area-inset-top))]'} ${
          isImmersive
            ? (miniPlayerDocked ? 'pb-[calc(7rem+env(safe-area-inset-bottom))]' : 'pb-[env(safe-area-inset-bottom)]')
            : (miniPlayerDocked ? 'pb-[calc(11rem+env(safe-area-inset-bottom))]' : 'pb-[calc(6rem+env(safe-area-inset-bottom))]')
        } sm:mx-auto sm:w-full sm:max-w-lg sm:border-x sm:border-[var(--border)] lg:mx-0 lg:max-w-none lg:border-x-0 lg:pt-8 lg:pb-28 lg:pl-64`}>
        <ErrorBoundary>
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </ErrorBoundary>
      </main>

      {!isQuran && <MiniPlayer />}
      {!isQuran && <QuranMiniPlayer />}
      {!isImmersive && <BottomNavigationBar />}
      <AudioEngine />
      <FullPlayerSheet />
      <QuranAudioEngine />
      <QuranFullPlayerSheet />
    </div>
  )
}

export default AppLayout
