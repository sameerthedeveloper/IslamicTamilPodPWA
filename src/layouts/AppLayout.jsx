import { Outlet, useLocation } from 'react-router-dom'
import BottomNavigationBar from '../components/BottomNavigationBar'
import MiniPlayer from '../components/MiniPlayer'
import TopBar from '../components/TopBar'
import AudioEngine from '../components/AudioEngine'
import ErrorBoundary from '../components/ErrorBoundary'
import FullPlayerSheet from '../components/FullPlayerSheet'

function AppLayout() {
  const { pathname } = useLocation()
  const isQuran = pathname === '/quran'

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <TopBar />

      <main className="flex-1 overflow-y-auto pt-[calc(5rem+3.75rem+1rem)] pb-24">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      {!isQuran && <MiniPlayer />}
      <BottomNavigationBar />
      <AudioEngine />
      <FullPlayerSheet />
    </div>
  )
}

export default AppLayout
