import { useState } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { registerUser, authErrorMessage } from '../api/userAuth'
import { useUserStore } from '../store/userStore'
import AuthLayout from '../components/AuthLayout'

function RegisterPage() {
  const navigate = useNavigate()
  const authStatus = useUserStore((s) => s.status)
  const user = useUserStore((s) => s.user)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (authStatus === 'ready' && user && !user.isAnonymous) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await registerUser(name, email, password)
      navigate('/')
    } catch (err) {
      setError(authErrorMessage(err))
    } finally {
      setLoading(false)
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
          Create your account
        </h1>
        <p className="mt-1 mb-6 text-sm text-gray-500">
          Save bookmarks and pick up where you left off.
        </p>

        <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500">
          Name
        </label>
        <input
          required
          autoComplete="name"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-4 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-[var(--accent)]"
        />

        <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500">
          Email
        </label>
        <input
          type="email"
          required
          autoComplete="username"
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
            minLength={6}
            autoComplete="new-password"
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
          {loading ? 'Creating account…' : 'Create account'}
        </button>

        <p className="mt-5 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium" style={{ color: 'var(--accent)' }}>
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}

export default RegisterPage
