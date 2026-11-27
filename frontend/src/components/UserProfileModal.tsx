import { useState, type FormEvent } from 'react'
import { toast } from 'react-toastify'
import { updateCurrentUser } from '../api/users'
import type { User } from '../types/api'
import { getApiErrorMessage } from '../utils/apiError'
import PasswordInput from './PasswordInput'

interface UserProfileModalProps {
  user: User
  onClose: () => void
  onSaved: (updates: Pick<User, 'name' | 'email'>) => void
}

const fieldClass =
  'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-medibook-500 focus:ring-4 focus:ring-medibook-100 disabled:bg-slate-100'

export default function UserProfileModal({ user, onClose, onSaved }: UserProfileModalProps) {
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)

    try {
      const result = await updateCurrentUser({
        name: name.trim(),
        email: email.trim(),
        password,
      })
      onSaved({ name: result.user.name, email: result.user.email })
      toast.success(result.message)
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, 'Unable to update your profile.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/40 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose()
      }}
    >
      <section
        aria-labelledby="user-profile-title"
        aria-modal="true"
        className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl sm:p-7"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="user-profile-title" className="text-xl font-semibold text-slate-900">
              Update your profile
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Change your personal details. Doctor profile details are managed separately.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close profile form"
            className="rounded-lg px-2 py-1 text-xl leading-none text-slate-500 hover:bg-slate-100 disabled:opacity-50"
          >
            ×
          </button>
        </div>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Full name</span>
            <input
              className={fieldClass}
              required
              minLength={3}
              maxLength={50}
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={saving}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Email</span>
            <input
              className={fieldClass}
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={saving}
            />
          </label>
          <div>
            <label htmlFor="profile-password" className="mb-1.5 block text-sm font-medium text-slate-700">
              New password
            </label>
            <PasswordInput
              id="profile-password"
              className={fieldClass}
              minLength={8}
              autoComplete="new-password"
              placeholder="For old password leave this blank"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={saving}
            />
            <p className="mt-1 text-xs text-slate-500">
              The update requires a new password with at least 8 characters.
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-medibook-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-medibook-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
