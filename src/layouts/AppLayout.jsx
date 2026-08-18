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
    <div>
      <TopBar />

      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>

      {!isQuran && <MiniPlayer />}
      <BottomNavigationBar />
      <AudioEngine />
      <FullPlayerSheet />
    </div>
  )
}

export default AppLayout
