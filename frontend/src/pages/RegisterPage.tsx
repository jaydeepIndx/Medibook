import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { registerUser } from '../api/auth'
import PasswordInput from '../components/PasswordInput'
import { getApiErrorMessage } from '../utils/apiError'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)

    try {
      await registerUser({ name, email, password })
      toast.success('Account created successfully. Redirecting to login...')
      window.setTimeout(() => navigate('/login'), 900)
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, 'Unable to create account. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto max-w-md px-4 py-14 sm:px-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50 sm:p-8">
        <h1 className="text-3xl font-bold text-medibook-950">Create account</h1>
        <p className="mt-2 text-sm text-slate-500">Register as a patient.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Full name</span>
            <input
              required
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-medibook-500 focus:ring-4 focus:ring-medibook-100"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-medibook-500 focus:ring-4 focus:ring-medibook-100"
            />
          </label>
          <div>
            <label htmlFor="register-password" className="mb-2 block text-sm font-semibold text-slate-700">
              Password
            </label>
            <PasswordInput
              id="register-password"
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-medibook-500 focus:ring-4 focus:ring-medibook-100"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-medibook-600 px-4 py-3 font-semibold text-white transition hover:bg-medibook-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-medibook-700 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </section>
  )
}
