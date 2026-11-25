import { useEffect, useState, type FormEvent } from 'react'
import { toast } from 'react-toastify'
import { createPrescription, getPrescription } from '../api/prescriptions'
import type { MyAppointment, Prescription } from '../types/api'
import { getApiErrorMessage } from '../utils/apiError'

interface PrescriptionModalProps {
  appointment: MyAppointment
  personName: string
  mode: 'create' | 'view'
  onClose: () => void
  onCreated: (message: string) => void
}

export default function PrescriptionModal({
  appointment,
  personName,
  mode,
  onClose,
  onCreated,
}: PrescriptionModalProps) {
  const [notes, setNotes] = useState('')
  const [medicines, setMedicines] = useState('')
  const [prescription, setPrescription] = useState<Prescription | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [loading, setLoading] = useState(mode === 'view')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (mode !== 'view') return

    let active = true
    const loadPrescription = async () => {
      try {
        const result = await getPrescription(appointment.id)
        if (active) setPrescription(result)
      } catch (requestError) {
        if (active) {
          setLoadError(true)
          toast.error(getApiErrorMessage(requestError, 'Unable to load this prescription.'))
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadPrescription()
    return () => {
      active = false
    }
  }, [appointment.id, mode])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)

    try {
      const result = await createPrescription(appointment.id, { notes, medicines })
      onCreated(result.message)
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, 'Unable to add this prescription.'))
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
        aria-labelledby="prescription-title"
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-7"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="prescription-title" className="text-xl font-semibold text-slate-900">
              {mode === 'create' ? 'Add prescription' : 'Prescription'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {personName} · Appointment #{appointment.id}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close prescription"
            className="rounded-lg px-2 py-1 text-xl leading-none text-slate-500 hover:bg-slate-100 disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {mode === 'create' ? (
          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Doctor's notes</span>
              <textarea
                required
                rows={4}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-medibook-500 focus:ring-4 focus:ring-medibook-100"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Medicines and dosage instructions
              </span>
              <textarea
                required
                rows={4}
                value={medicines}
                onChange={(event) => setMedicines(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-medibook-500 focus:ring-4 focus:ring-medibook-100"
              />
            </label>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-medibook-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-medibook-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save prescription'}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-5">
            {loading ? (
              <p className="py-8 text-center text-sm text-slate-500">Loading prescription...</p>
            ) : loadError || !prescription ? (
              <p className="py-8 text-center text-sm text-slate-600">
                Prescription could not be loaded. Close this window and try again.
              </p>
            ) : (
              <div className="space-y-5">
                <p className="text-sm text-slate-500">
                  Added <time dateTime={prescription.created_at}>
                    {new Date(prescription.created_at).toLocaleString()}
                  </time>
                </p>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">Doctor's notes</h3>
                  <p className="mt-1 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                    {prescription.notes}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    Medicines and dosage instructions
                  </h3>
                  <p className="mt-1 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                    {prescription.medicines}
                  </p>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl bg-medibook-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-medibook-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
