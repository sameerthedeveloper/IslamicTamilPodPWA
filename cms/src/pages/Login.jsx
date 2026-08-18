import React, { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { login as loginApi } from '../api/client'
import { useAuthStore } from '../store/authStore'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  if (token && user?.role === 'ADMIN') return <Navigate to="/" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await loginApi(email, password)
      if (data.user.role !== 'ADMIN') {
        setError('This account does not have admin access.')
        return
      }
      login(data.accessToken, data.user)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--base)' }}>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl p-8"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div
          className="mb-5 flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold text-white"
          style={{ background: 'var(--accent)' }}
        >
          T
        </div>
        <h1 className="text-lg font-semibold" style={{ color: 'var(--ink)' }}>Admin sign in</h1>
        <p className="mt-1 mb-6 text-sm" style={{ color: 'var(--muted)' }}>
          Tamil Islamic Audio — content management
        </p>

        <label className="mb-1 block text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
          Email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-xl px-3 py-2 text-sm outline-none"
          style={{ border: '1px solid var(--border)' }}
        />

        <label className="mb-1 block text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
          Password
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-5 w-full rounded-xl px-3 py-2 text-sm outline-none"
          style={{ border: '1px solid var(--border)' }}
        />

        {error && (
          <p className="mb-4 text-sm" style={{ color: 'var(--danger)' }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-50"
          style={{ background: 'var(--accent)' }}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}

export default Login
