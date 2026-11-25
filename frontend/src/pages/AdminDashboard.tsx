import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { deleteDoctor, getDoctors } from '../api/doctors'
import DoctorFormModal from '../components/DoctorFormModal'
import type { Doctor } from '../types/api'
import { getApiErrorMessage } from '../utils/apiError'

interface AdminDashboardProps {
  initialAddOpen?: boolean
}

export default function AdminDashboard({ initialAddOpen = false }: AdminDashboardProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [formOpen, setFormOpen] = useState(initialAddOpen)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)

  const loadDoctors = useCallback(async () => {
    try {
      const result = await getDoctors()
      setDoctors(result)
      setError('')
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, 'Unable to load doctors. Please try again.')
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true

    const loadInitialDoctors = async () => {
      try {
        const result = await getDoctors()
        if (active) {
          setDoctors(result)
          setError('')
        }
      } catch (requestError) {
        if (active) {
          const message = getApiErrorMessage(requestError, 'Unable to load doctors. Please try again.')
          setError(message)
          toast.error(message)
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadInitialDoctors()
    return () => {
      active = false
    }
  }, [])

  const filteredDoctors = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    if (!query) return doctors
    return doctors.filter((doctor) =>
      doctor.specialization.toLocaleLowerCase().includes(query),
    )
  }, [doctors, search])

  const specializationCount = useMemo(
    () => new Set(doctors.map((doctor) => doctor.specialization.trim().toLocaleLowerCase()).filter(Boolean)).size,
    [doctors],
  )

  const handleSaved = (message: string) => {
    setFormOpen(false)
    setSelectedDoctor(null)
    toast.success(message)
    setLoading(true)
    void loadDoctors()
  }

  const handleDelete = async (doctor: Doctor) => {
    const confirmed = window.confirm(`Delete ${doctor.name}? This action cannot be undone.`)
    if (!confirmed) return

    setDeletingId(doctor.id)
    setError('')
    try {
      const result = await deleteDoctor(doctor.id)
      toast.success(result.message || `${doctor.name} was deleted.`)
      setLoading(true)
      await loadDoctors()
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, 'Unable to delete doctor. Please try again.'))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Overview</h2>
            <p className="mt-1 text-sm text-slate-500">Manage the doctors registered with MediBook.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedDoctor(null)
              setFormOpen(true)
            }}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-medibook-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-medibook-700 sm:self-auto"
          >
            <span aria-hidden="true" className="text-lg leading-none">+</span>
            Add doctor
          </button>
        </div>

        <div className="mb-7 grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total doctors</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">
              {loading ? <span className="text-xl text-slate-400">Loading...</span> : doctors.length}
            </p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total specializations</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">
              {loading ? <span className="text-xl text-slate-400">Loading...</span> : specializationCount}
            </p>
          </article>
        </div>

        <section id="doctor-directory" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <h3 className="font-semibold text-slate-900">Doctor directory</h3>
              <p className="mt-0.5 text-sm text-slate-500">
                {loading ? 'Loading doctor records...' : `${filteredDoctors.length} of ${doctors.length} doctors`}
              </p>
            </div>
            <label className="relative block w-full sm:max-w-xs">
              <span className="sr-only">Search by specialization</span>
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400">
                <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="m13 13 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search specialization"
                className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-medibook-500 focus:ring-4 focus:ring-medibook-100"
              />
            </label>
          </div>

          {loading ? (
            <div className="px-5 py-12 text-center text-sm text-slate-500">Loading doctors...</div>
          ) : error && doctors.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-sm text-slate-600">Doctor records could not be loaded.</p>
              <button
                type="button"
                onClick={() => {
                  setLoading(true)
                  void loadDoctors()
                }}
                className="mt-3 text-sm font-semibold text-medibook-700 hover:underline"
              >
                Retry
              </button>
            </div>
          ) : doctors.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="font-medium text-slate-800">No doctors registered yet</p>
              <p className="mt-1 text-sm text-slate-500">Add a doctor to start building the directory.</p>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-slate-500">
              No doctors match “{search}”. Try another specialization.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Doctor name</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3">Specialization</th>
                    <th className="px-5 py-3">Consultation fee</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDoctors.map((doctor) => (
                    <tr key={doctor.id} className="hover:bg-slate-50/70">
                      <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-900">{doctor.name}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">{doctor.email}</td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="rounded-full bg-medibook-100 px-2.5 py-1 text-xs font-medium text-medibook-700">{doctor.specialization}</span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-700">Rs. {Number(doctor.consultation_fee).toFixed(2)}</td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDoctor(doctor)
                              setFormOpen(true)
                            }}
                            className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={deletingId === doctor.id}
                            onClick={() => void handleDelete(doctor)}
                            className="rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingId === doctor.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
      {formOpen && (
        <DoctorFormModal
          doctor={selectedDoctor}
          onClose={() => {
            setFormOpen(false)
            setSelectedDoctor(null)
          }}
          onSaved={handleSaved}
        />
      )}
    </>
  )
}
