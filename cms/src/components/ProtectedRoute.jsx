import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import Sidebar from './Sidebar'

function ProtectedRoute({ children }) {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)

  if (!token || user?.role !== 'ADMIN') {
    return <Navigate to="/login" replace />
  }

  return (
    <div>
      <Sidebar />
      <div className="ml-60 min-h-screen">{children}</div>
    </div>
  )
}

export default ProtectedRoute
