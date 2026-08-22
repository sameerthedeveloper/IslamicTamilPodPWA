import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import ProtectedRoute from './admin/components/ProtectedRoute'
import PageLoader from './components/PageLoader'

const HomePage = lazy(() => import('./pages/HomePage'))
const LibraryPage = lazy(() => import('./pages/LibraryPage'))
const BrowsePage = lazy(() => import('./pages/BrowsePage'))
const QuranPage = lazy(() => import('./pages/QuranPage'))
const ScholarsPage = lazy(() => import('./pages/ScholarsPage'))
const EpisodeDetailPage = lazy(() => import('./pages/EpisodeDetailPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))

const AdminLogin = lazy(() => import('./admin/pages/Login'))
const Dashboard = lazy(() => import('./admin/pages/Dashboard'))
const Episodes = lazy(() => import('./admin/pages/Episodes'))
const Scholars = lazy(() => import('./admin/pages/Scholars'))
const Series = lazy(() => import('./admin/pages/Series'))
const Playlists = lazy(() => import('./admin/pages/Playlists'))
const Topics = lazy(() => import('./admin/pages/Topics'))
const Audio = lazy(() => import('./admin/pages/Audio'))
const Rights = lazy(() => import('./admin/pages/Rights'))
const Users = lazy(() => import('./admin/pages/Users'))
const Featured = lazy(() => import('./admin/pages/Featured'))
const Settings = lazy(() => import('./admin/pages/Settings'))

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="library" element={<LibraryPage />} />
          <Route path="browse" element={<BrowsePage />} />
          <Route path="quran" element={<QuranPage />} />
          <Route path="scholars" element={<ScholarsPage />} />
          <Route path="scholars/:scholarId" element={<ScholarsPage />} />
          <Route path="episode/:episodeId" element={<EpisodeDetailPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        <Route path="admin/login" element={<AdminLogin />} />
        <Route path="admin" element={<ProtectedRoute />}>
          <Route index element={<Dashboard />} />
          <Route path="episodes" element={<Episodes />} />
          <Route path="scholars" element={<Scholars />} />
          <Route path="series" element={<Series />} />
          <Route path="playlists" element={<Playlists />} />
          <Route path="topics" element={<Topics />} />
          <Route path="audio" element={<Audio />} />
          <Route path="rights" element={<Rights />} />
          <Route path="users" element={<Users />} />
          <Route path="featured" element={<Featured />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App
