import { useState, type FormEvent } from 'react'
import { toast } from 'react-toastify'
import { createDoctor, updateDoctor } from '../api/doctors'
import PasswordInput from './PasswordInput'
import type { Doctor } from '../types/api'
import { getApiErrorMessage } from '../utils/apiError'

interface DoctorFormModalProps {
  doctor: Doctor | null
  onClose: () => void
  onSaved: (message: string) => void
}

const fieldClass =
  'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-medibook-500 focus:ring-4 focus:ring-medibook-100 disabled:bg-slate-100'

export default function DoctorFormModal({ doctor, onClose, onSaved }: DoctorFormModalProps) {
  const [name, setName] = useState(doctor?.name ?? '')
  const [email, setEmail] = useState(doctor?.email ?? '')
  const [password, setPassword] = useState('')
  const [specialization, setSpecialization] = useState(doctor?.specialization ?? '')
  const [consultationFee, setConsultationFee] = useState(
    doctor ? String(doctor.consultation_fee) : '',
  )
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)

    try {
      const details = {
        name: name.trim(),
        email: email.trim(),
        specialization: specialization.trim(),
        consultation_fee: Number(consultationFee),
      }

      const result = doctor
        ? await updateDoctor(doctor.id, details)
        : await createDoctor({ ...details, password })

      onSaved(result.message)
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, 'Unable to save doctor details.'))
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
        aria-labelledby="doctor-form-title"
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-7"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="doctor-form-title" className="text-xl font-semibold text-slate-900">
              {doctor ? 'Edit doctor' : 'Add a doctor'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {doctor ? 'Update the doctor profile details.' : 'Enter details for the new doctor profile.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close form"
            className="rounded-lg px-2 py-1 text-xl leading-none text-slate-500 hover:bg-slate-100 disabled:opacity-50"
          >
            ×
          </button>
        </div>

        <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Doctor name</span>
            <input className={fieldClass} required minLength={3} maxLength={50} value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Email</span>
            <input className={fieldClass} type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          {!doctor && (
            <div className="block">
              <label htmlFor="doctor-password" className="mb-1.5 block text-sm font-medium text-slate-700">
                Temporary password
              </label>
              <PasswordInput id="doctor-password" className={fieldClass} required minLength={8} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} />
            </div>
          )}
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Specialization</span>
            <input className={fieldClass} required minLength={2} maxLength={100} value={specialization} onChange={(event) => setSpecialization(event.target.value)} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Consultation fee</span>
            <input className={fieldClass} type="number" required min="0.01" step="0.01" value={consultationFee} onChange={(event) => setConsultationFee(event.target.value)} />
          </label>
          <div className="mt-2 flex justify-end gap-2 sm:col-span-2">
            <button type="button" disabled={saving} onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="rounded-xl bg-medibook-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-medibook-700 disabled:cursor-not-allowed disabled:opacity-60">
              {saving ? 'Saving...' : doctor ? 'Save changes' : 'Add doctor'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
