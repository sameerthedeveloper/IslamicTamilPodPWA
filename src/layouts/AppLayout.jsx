import { Outlet, useLocation } from 'react-router-dom'
import BottomNavigationBar from '../components/BottomNavigationBar'
import MiniPlayer from '../components/MiniPlayer'
import TopBar from '../components/TopBar'
import Sidebar from '../components/Sidebar'
import AudioEngine from '../components/AudioEngine'
import ErrorBoundary from '../components/ErrorBoundary'
import FullPlayerSheet from '../components/FullPlayerSheet'

function AppLayout() {
  const { pathname } = useLocation()
  const isQuran = pathname === '/quran'

  return (
    <div className="flex h-screen flex-col overflow-hidden lg:flex-row">
      <Sidebar />
      <TopBar />

      <main className="flex-1 overflow-y-auto pt-[calc(5rem+env(safe-area-inset-top))] pb-[calc(6rem+env(safe-area-inset-bottom))] sm:mx-auto sm:w-full sm:max-w-lg sm:border-x sm:border-[var(--border)] lg:mx-0 lg:max-w-none lg:border-x-0 lg:pt-8 lg:pb-28 lg:pl-64">
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
