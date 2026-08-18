import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const status = useAuthStore((s) => s.status)
  const user = useAuthStore((s) => s.user)
  const login = useAuthStore((s) => s.login)

  if (status === 'ready' && user?.role === 'ADMIN') return <Navigate to="/admin" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
    } catch (err) {
      setError(firebaseAuthErrorMessage(err))
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

function firebaseAuthErrorMessage(err) {
  switch (err?.code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid credentials.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Try again later.'
    default:
      return err?.message || 'Invalid credentials.'
  }
}

export default Login
