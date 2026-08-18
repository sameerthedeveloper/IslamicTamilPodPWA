import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loginUser, authErrorMessage } from '../api/userAuth'

function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await loginUser(email, password)
      navigate('/')
    } catch (err) {
      setError(authErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-5">
      <form
        onSubmit={handleSubmit}
        className="animate-rise-in w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
      >
        <div
          className="mb-5 flex h-10 w-10 items-center justify-center rounded-2xl text-base font-bold text-white shadow-sm"
          style={{ background: 'linear-gradient(155deg, var(--accent), #0B5C55)' }}
        >
          T
        </div>

        <h1 className="font-display text-2xl font-semibold tracking-tight text-gray-900">
          Welcome back
        </h1>
        <p className="mt-1 mb-6 text-sm text-gray-500">
          Sign in to sync your listening across devices.
        </p>

        <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500">
          Email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-[var(--accent)]"
        />

        <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500">
          Password
        </label>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-[var(--accent)]"
        />

        {error && <p className="mb-4 text-sm text-[var(--danger)]">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          style={{ background: 'var(--accent)' }}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="mt-5 text-center text-sm text-gray-500">
          New here?{' '}
          <Link to="/register" className="font-medium" style={{ color: 'var(--accent)' }}>
            Create an account
          </Link>
        </p>
      </form>
    </div>
  )
}

export default LoginPage
