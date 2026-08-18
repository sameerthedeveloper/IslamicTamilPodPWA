import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import Sidebar from './Sidebar'

function ProtectedRoute({ children }) {
  const status = useAuthStore((s) => s.status)
  const user = useAuthStore((s) => s.user)

  if (status === 'pending') {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ color: 'var(--muted)' }}>
        Loading…
      </div>
    )
  }

  if (!user || user.role !== 'ADMIN') {
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
