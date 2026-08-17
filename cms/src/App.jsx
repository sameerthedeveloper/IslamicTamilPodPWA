import React from 'react'
import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Episodes from './pages/Episodes'
import Scholars from './pages/Scholars'
import Series from './pages/Series'
import Topics from './pages/Topics'
import Audio from './pages/Audio'
import Rights from './pages/Rights'
import Users from './pages/Users'
import Featured from './pages/Featured'
import Settings from './pages/Settings'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/episodes" element={<ProtectedRoute><Episodes /></ProtectedRoute>} />
      <Route path="/scholars" element={<ProtectedRoute><Scholars /></ProtectedRoute>} />
      <Route path="/series" element={<ProtectedRoute><Series /></ProtectedRoute>} />
      <Route path="/topics" element={<ProtectedRoute><Topics /></ProtectedRoute>} />
      <Route path="/audio" element={<ProtectedRoute><Audio /></ProtectedRoute>} />
      <Route path="/rights" element={<ProtectedRoute><Rights /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
      <Route path="/featured" element={<ProtectedRoute><Featured /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
    </Routes>
  )
}

export default App
