import { Outlet, useLocation } from 'react-router-dom'
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

function AppLayout() {
  const { pathname } = useLocation()
  const isQuran = pathname === '/quran'

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
      <TopBar />

      <main className="flex-1 overflow-y-auto pt-[calc(5rem+env(safe-area-inset-top))] pb-[calc(6rem+env(safe-area-inset-bottom))] sm:mx-auto sm:w-full sm:max-w-lg sm:border-x sm:border-[var(--border)] lg:mx-0 lg:max-w-none lg:border-x-0 lg:pt-8 lg:pb-28 lg:pl-64">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      {!isQuran && <MiniPlayer />}
      {!isQuran && <QuranMiniPlayer />}
      <BottomNavigationBar />
      <AudioEngine />
      <FullPlayerSheet />
      <QuranAudioEngine />
      <QuranFullPlayerSheet />
    </div>
  )
}

export default AppLayout
