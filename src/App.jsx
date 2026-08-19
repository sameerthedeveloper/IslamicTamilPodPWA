import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import HomePage from './pages/HomePage'
import LibraryPage from './pages/LibraryPage'
import BrowsePage from './pages/BrowsePage'
import QuranPage from './pages/QuranPage'
import SettingsPage from './pages/SettingsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProtectedRoute from './admin/components/ProtectedRoute'
import AdminLogin from './admin/pages/Login'
import Dashboard from './admin/pages/Dashboard'
import Episodes from './admin/pages/Episodes'
import Scholars from './admin/pages/Scholars'
import Series from './admin/pages/Series'
import Topics from './admin/pages/Topics'
import Audio from './admin/pages/Audio'
import Rights from './admin/pages/Rights'
import Users from './admin/pages/Users'
import Featured from './admin/pages/Featured'
import Settings from './admin/pages/Settings'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="library" element={<LibraryPage />} />
        <Route path="browse" element={<BrowsePage />} />
        <Route path="quran" element={<QuranPage />} />
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
        <Route path="topics" element={<Topics />} />
        <Route path="audio" element={<Audio />} />
        <Route path="rights" element={<Rights />} />
        <Route path="users" element={<Users />} />
        <Route path="featured" element={<Featured />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
