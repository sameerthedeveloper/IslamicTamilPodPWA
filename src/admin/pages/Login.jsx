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
    <div
      className="flex min-h-screen items-center justify-center sm:p-6"
      style={{ background: 'var(--base)' }}
    >
      <form
        onSubmit={handleSubmit}
        className="pt-safe pb-safe flex w-full flex-1 flex-col justify-center border-0 border-[var(--border)] px-6 sm:max-w-sm sm:flex-none sm:rounded-2xl sm:border sm:p-8"
        style={{ background: 'var(--surface)' }}
      >
        <div
          className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl text-base font-bold text-white sm:h-9 sm:w-9 sm:text-sm"
          style={{ background: 'var(--accent)' }}
        >
          T
        </div>
        <h1 className="text-xl font-semibold sm:text-lg" style={{ color: 'var(--ink)' }}>Admin sign in</h1>
        <p className="mt-1 mb-8 text-sm sm:mb-6" style={{ color: 'var(--muted)' }}>
          Tamil Islamic Audio — content management
        </p>

        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
          Email
        </label>
        <input
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-xl px-3 py-3 text-base outline-none sm:py-2 sm:text-sm"
          style={{ border: '1px solid var(--border)' }}
        />

        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
          Password
        </label>
        <input
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-5 w-full rounded-xl px-3 py-3 text-base outline-none sm:py-2 sm:text-sm"
          style={{ border: '1px solid var(--border)' }}
        />

        {error && (
          <p className="mb-4 text-sm" style={{ color: 'var(--danger)' }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl px-4 py-3 text-base font-semibold text-white transition active:opacity-80 disabled:opacity-50 sm:py-2 sm:text-sm"
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
