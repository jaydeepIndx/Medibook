import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { bookAppointment } from '../api/appointments'
import { getDoctors } from '../api/doctors'
import { getApiErrorMessage } from '../utils/apiError'
import type { Doctor } from '../types/api'

const formatLocalDateTime = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const getNextSlot = () => {
  const date = new Date()
  date.setSeconds(0, 0)
  date.setMinutes(date.getMinutes() + (30 - (date.getMinutes() % 30)))
  return formatLocalDateTime(date)
}

export default function BookAppointmentPage() {
  const [searchParams] = useSearchParams()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [doctorId, setDoctorId] = useState(() => searchParams.get('doctorId') ?? '')
  const [minimumTime] = useState(getNextSlot)
  const [startTime, setStartTime] = useState(minimumTime)
  const [loadingDoctors, setLoadingDoctors] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    let active = true

    const loadDoctors = async () => {
      try {
        const result = await getDoctors()
        if (active) setDoctors(result)
      } catch (requestError) {
        if (active) {
          toast.error(getApiErrorMessage(requestError, 'Unable to load doctors.'))
        }
      } finally {
        if (active) setLoadingDoctors(false)
      }
    }

    void loadDoctors()
    return () => {
      active = false
    }
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const selectedTime = new Date(startTime)
    if (!doctors.some((doctor) => String(doctor.id) === doctorId)) {
      toast.error('Please select a doctor.')
      return
    }
    if (!Number.isFinite(selectedTime.getTime()) || selectedTime.getTime() <= Date.now()) {
      toast.error('Choose an appointment time in the future.')
      return
    }
    if (selectedTime.getMinutes() !== 0 && selectedTime.getMinutes() !== 30) {
      toast.error('Appointments must start on the hour or half-hour.')
      return
    }

    setSubmitting(true)
    try {
      const result = await bookAppointment({
        doctor_id: Number(doctorId),
        start_time: selectedTime.toISOString(),
      })
      navigate('/appointments', { state: { success: result.message } })
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, 'Unable to book this appointment.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-medibook-600">
          Appointment
        </p>
        <h1 className="mt-2 text-3xl font-bold text-medibook-950">Book a visit</h1>
        <p className="mt-2 text-sm text-slate-500">
          Choose a doctor and a future time on the hour or half-hour. Visits are 30 minutes.
        </p>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Doctor</span>
            <select
              required
              value={doctorId}
              onChange={(event) => setDoctorId(event.target.value)}
              disabled={loadingDoctors}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-medibook-500 focus:ring-4 focus:ring-medibook-100 disabled:bg-slate-100"
            >
              <option value="">
                {loadingDoctors ? 'Loading doctors...' : 'Select a doctor'}
              </option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name} — {doctor.specialization}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Date and time</span>
            <input
              type="datetime-local"
              required
              step={1800}
              min={minimumTime}
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-medibook-500 focus:ring-4 focus:ring-medibook-100"
            />
          </label>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              to="/doctors"
              className="rounded-xl border border-slate-300 px-5 py-3 text-center font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Back to doctors
            </Link>
            <button
              type="submit"
              disabled={submitting || loadingDoctors || doctors.length === 0}
              className="rounded-xl bg-medibook-600 px-5 py-3 font-semibold text-white transition hover:bg-medibook-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Booking...' : 'Book appointment'}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
