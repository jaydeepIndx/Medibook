import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { cancelAppointment, getMyAppointments } from '../api/appointments'
import PrescriptionModal from '../components/PrescriptionModal'
import { getApiErrorMessage } from '../utils/apiError'
import { useAuth } from '../hooks/useAuth'
import type { MyAppointment } from '../types/api'

const cancellationWindowMs = 2 * 60 * 60 * 1000

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

const statusClass: Record<MyAppointment['status'], string> = {
  booked: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-slate-100 text-slate-700',
  completed: 'bg-green-100 text-green-800',
}

export default function MyAppointmentsPage() {
  const { user } = useAuth()
  const location = useLocation()
  const [appointments, setAppointments] = useState<MyAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<number | null>(null)
  const [currentTime, setCurrentTime] = useState<number | null>(null)
  const [loadError, setLoadError] = useState('')
  const [activePrescription, setActivePrescription] = useState<{
    appointment: MyAppointment
    mode: 'create' | 'view'
  } | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    let active = true

    const loadAppointments = async () => {
      try {
        const result = await getMyAppointments()
        if (active) {
          setAppointments(result)
          setLoadError('')
        }
      } catch (requestError) {
        if (active) {
          const message = getApiErrorMessage(requestError, 'Unable to load your appointments.')
          setLoadError(message)
          toast.error(message)
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadAppointments()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const successMessage = (location.state as { success?: string } | null)?.success
    if (!successMessage) return

    toast.success(successMessage)
    navigate(location.pathname, { replace: true, state: null })
  }, [location.pathname, location.state, navigate])

  useEffect(() => {
    const updateCurrentTime = () => setCurrentTime(Date.now())
    updateCurrentTime()
    const intervalId = window.setInterval(updateCurrentTime, 30_000)
    return () => window.clearInterval(intervalId)
  }, [])

  const handleCancel = async (appointment: MyAppointment) => {
    if (!window.confirm(`Cancel your appointment with ${appointment.doctor_name}?`)) return

    setCancellingId(appointment.id)
    try {
      const result = await cancelAppointment(appointment.id)
      setAppointments((current) =>
        current.map((item) =>
          item.id === appointment.id ? { ...item, status: 'cancelled' } : item,
        ),
      )
      toast.success(result.message)

      try {
        setAppointments(await getMyAppointments())
      } catch (requestError) {
        toast.error(
          getApiErrorMessage(
            requestError,
            'The appointment was cancelled, but the list could not be refreshed.',
          ),
        )
      }
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, 'Unable to cancel this appointment.'))
    } finally {
      setCancellingId(null)
    }
  }

  const handlePrescriptionCreated = async (message: string) => {
    setActivePrescription(null)
    toast.success(message)
    try {
      setAppointments(await getMyAppointments())
    } catch (requestError) {
      toast.error(
        getApiErrorMessage(
          requestError,
          'The prescription was saved, but appointments could not be refreshed.',
        ),
      )
    }
  }

  const isPatient = user?.role === 'patient'
  const isDoctor = user?.role === 'doctor'

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-medibook-600">
              Your schedule
            </p>
            <h1 className="mt-2 text-3xl font-bold text-medibook-950">My appointments</h1>
            <p className="mt-2 text-sm text-slate-500">
              You can cancel an appointment only if at least 2 hours remain before its scheduled start time.
            </p>
          </div>
          {isPatient && (
            <Link
              to="/appointments/book"
              className="rounded-xl bg-medibook-600 px-5 py-3 text-center font-semibold text-white transition hover:bg-medibook-700"
            >
              Book an appointment
            </Link>
          )}
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">Loading appointments...</div>
          ) : appointments.length === 0 ? (
            <div className="px-6 py-14 text-center">
              {loadError ? (
                <>
                  <p className="font-semibold text-slate-800">Appointments could not be loaded.</p>
                  <button
                    type="button"
                    onClick={async () => {
                      setLoading(true)
                      setLoadError('')
                      try {
                        setAppointments(await getMyAppointments())
                      } catch (requestError) {
                        const message = getApiErrorMessage(
                          requestError,
                          'Unable to load your appointments.',
                        )
                        setLoadError(message)
                        toast.error(message)
                      } finally {
                        setLoading(false)
                      }
                    }}
                    className="mt-2 text-sm font-semibold text-medibook-700 hover:underline"
                  >
                    Retry
                  </button>
                </>
              ) : (
                <>
                  <p className="font-semibold text-slate-800">No appointments yet</p>
                  {isPatient && (
                    <Link to="/doctors" className="mt-2 inline-block text-sm font-semibold text-medibook-700 hover:underline">
                      Browse doctors
                    </Link>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th scope="col" className="px-5 py-4 font-semibold">Doctor</th>
                    {isDoctor && (
                      <th scope="col" className="px-5 py-4 font-semibold">Patient</th>
                    )}
                    <th scope="col" className="px-5 py-4 font-semibold">Specialization</th>
                    <th scope="col" className="px-5 py-4 font-semibold">Date and time</th>
                    <th scope="col" className="px-5 py-4 font-semibold">Fee</th>
                    <th scope="col" className="px-5 py-4 font-semibold">Status</th>
                    {(isPatient || isDoctor) && (
                      <th scope="col" className="px-5 py-4 font-semibold">Action</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {appointments.map((appointment) => {
                    const canCancel =
                      isPatient &&
                      appointment.status === 'booked' &&
                      currentTime !== null &&
                      Date.parse(appointment.start_time) - currentTime >= cancellationWindowMs

                    return (
                      <tr key={appointment.id} className="hover:bg-slate-50/70">
                        <td className="px-5 py-4">
                          <span className="block font-semibold text-slate-900">
                            {appointment.doctor_name}
                          </span>
                          <span className="text-xs text-slate-500">Appointment #{appointment.id}</span>
                        </td>
                        {isDoctor && (
                          <td className="px-5 py-4">{appointment.patient_name}</td>
                        )}
                        <td className="px-5 py-4">{appointment.specialization}</td>
                        <td className="whitespace-nowrap px-5 py-4">
                          <time dateTime={appointment.start_time}>
                            {formatDateTime(appointment.start_time)}
                          </time>
                          <span className="mt-1 block text-xs text-slate-500">
                            Ends {new Date(appointment.end_time).toLocaleTimeString(undefined, {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4">
                          Rs. {Number(appointment.consultation_fee).toFixed(2)}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusClass[appointment.status]}`}>
                            {appointment.status}
                          </span>
                        </td>
                        {(isPatient || isDoctor) && (
                          <td className="px-5 py-4">
                            {isDoctor && appointment.status === 'booked' ? (
                              <button
                                type="button"
                                onClick={() => setActivePrescription({ appointment, mode: 'create' })}
                                className="whitespace-nowrap font-semibold text-medibook-700 hover:text-medibook-800"
                              >
                                Add prescription
                              </button>
                            ) : appointment.status === 'completed' ? (
                              <button
                                type="button"
                                onClick={() => setActivePrescription({ appointment, mode: 'view' })}
                                className="whitespace-nowrap font-semibold text-medibook-700 hover:text-medibook-800"
                              >
                                View prescription
                              </button>
                            ) : canCancel ? (
                              <button
                                type="button"
                                onClick={() => void handleCancel(appointment)}
                                disabled={cancellingId === appointment.id}
                                className="font-semibold text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {cancellingId === appointment.id ? 'Cancelling...' : 'Cancel'}
                              </button>
                            ) : isPatient && appointment.status === 'booked' ? (
                              <span className="text-xs text-slate-500">
                                {currentTime === null ? 'Checking...' : 'Cancellation closed'}
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
      {activePrescription && (
        <PrescriptionModal
          key={`${activePrescription.appointment.id}-${activePrescription.mode}`}
          appointment={activePrescription.appointment}
          personName={isDoctor
            ? activePrescription.appointment.patient_name
            : activePrescription.appointment.doctor_name}
          mode={activePrescription.mode}
          onClose={() => setActivePrescription(null)}
          onCreated={(message) => void handlePrescriptionCreated(message)}
        />
      )}
    </>
  )
}
