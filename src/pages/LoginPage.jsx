import { useState } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { loginUser, loginWithGoogle, authErrorMessage } from '../api/userAuth'
import { useUserStore } from '../store/userStore'
import AuthLayout from '../components/AuthLayout'
import GoogleIcon from '../components/GoogleIcon'

function LoginPage() {
  const navigate = useNavigate()
  const authStatus = useUserStore((s) => s.status)
  const user = useUserStore((s) => s.user)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  // Already signed in (not just the anonymous session everyone starts
  // with) — nothing to do here, send them back to the app.
  if (authStatus === 'ready' && user && !user.isAnonymous) {
    return <Navigate to="/" replace />
  }

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

  const handleGoogle = async () => {
    setError('')
    setGoogleLoading(true)
    try {
      await loginWithGoogle()
      navigate('/')
    } catch (err) {
      setError(authErrorMessage(err))
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <AuthLayout>
      <form
        onSubmit={handleSubmit}
        className="animate-rise-in w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
      >
        <div
          className="mb-5 flex h-10 w-10 items-center justify-center rounded-2xl text-base font-bold text-white shadow-sm lg:hidden"
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

        <button
          type="button"
          onClick={handleGoogle}
          disabled={googleLoading}
          className="mb-5 flex w-full items-center justify-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 active:scale-[0.98] disabled:opacity-50"
        >
          <GoogleIcon size={17} />
          {googleLoading ? 'Signing in…' : 'Continue with Google'}
        </button>

        <div className="mb-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-400">or</span>
          <span className="h-px flex-1 bg-gray-200" />
        </div>

        <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500">
          Email
        </label>
        <input
          type="email"
          required
          autoComplete="username"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-[var(--accent)]"
        />

        <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500">
          Password
        </label>
        <div className="relative mb-5">
          <input
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-[var(--accent)]"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

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
    </AuthLayout>
  )
}

export default LoginPage
