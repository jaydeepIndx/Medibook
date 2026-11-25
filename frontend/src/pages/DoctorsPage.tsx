import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getDoctors, getTopDoctors } from '../api/doctors'
import { getApiErrorMessage } from '../utils/apiError'
import type { Doctor, TopDoctor } from '../types/api'
import { useAuth } from '../hooks/useAuth'

export default function DoctorsPage() {
  const { user } = useAuth()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [topDoctors, setTopDoctors] = useState<TopDoctor[] | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showTopDoctors, setShowTopDoctors] = useState(false)
  const [loadingTopDoctors, setLoadingTopDoctors] = useState(false)

  useEffect(() => {
    let active = true

    const loadDoctors = async () => {
      setLoading(true)
      try {
        const result = await getDoctors()
        if (active) setDoctors(result)
      } catch (requestError) {
        if (active) {
          toast.error(getApiErrorMessage(requestError, 'Unable to load doctors.'))
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadDoctors()
    return () => {
      active = false
    }
  }, [])

  const query = search.trim().toLocaleLowerCase()
  const filteredDoctors = query
    ? doctors.filter((doctor) =>
        `${doctor.name} ${doctor.specialization}`.toLocaleLowerCase().includes(query),
      )
    : doctors

  const handleTopDoctorsClick = async () => {
    if (showTopDoctors && topDoctors !== null) {
      setShowTopDoctors(false)
      return
    }

    setShowTopDoctors(true)
    setLoadingTopDoctors(true)
    try {
      setTopDoctors(await getTopDoctors())
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, 'Unable to load top doctors.'))
    } finally {
      setLoadingTopDoctors(false)
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-medibook-600">Our doctors</p>
          <h1 className="mt-2 text-3xl font-bold text-medibook-950">Find a specialist</h1>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => void handleTopDoctorsClick()}
            disabled={loadingTopDoctors}
            className="rounded-xl border border-medibook-200 bg-white px-4 py-2.5 font-semibold text-medibook-700 transition hover:bg-medibook-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingTopDoctors
              ? 'Loading top doctors...'
              : showTopDoctors
                ? topDoctors === null
                  ? 'Retry top doctors'
                  : 'Hide top doctors'
                : 'Top doctors'}
          </button>
          <form onSubmit={(event) => event.preventDefault()} className="flex gap-2">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by doctor or specialization"
              className="min-w-0 rounded-xl border border-slate-300 bg-white px-4 py-2.5 outline-none focus:border-medibook-500 focus:ring-4 focus:ring-medibook-100"
            />
            <button
              type="submit"
              className="rounded-xl bg-medibook-600 px-4 py-2.5 font-semibold text-white hover:bg-medibook-700"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {showTopDoctors && (
        <section className="mt-8" aria-labelledby="top-doctors-heading">
          <div className="mb-4">
            <p className="text-sm font-semibold uppercase tracking-wider text-medibook-600">
              Patient favorites
            </p>
            <h2 id="top-doctors-heading" className="mt-1 text-2xl font-bold text-medibook-950">
              Top doctors
            </h2>
          </div>
          {loadingTopDoctors ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500">
              Loading top doctors...
            </div>
          ) : topDoctors?.length ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {topDoctors.map((doctor) => (
                <article
                  key={doctor.doctor_id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-medibook-600">Rank #{doctor.rank}</p>
                      <h3 className="mt-2 text-lg font-bold text-medibook-950">{doctor.name}</h3>
                    </div>
                    <span className="rounded-full bg-medibook-100 px-3 py-1 text-xs font-semibold text-medibook-700">
                      {doctor.completed_appointments} completed
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-slate-600">{doctor.specialization}</p>
                  <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-500">
                    Consultation fee{' '}
                    <strong className="text-slate-900">
                      Rs. {Number(doctor.consultation_fee).toFixed(2)}
                    </strong>
                  </p>
                  {user?.role === 'patient' && (
                    <Link
                      to={`/appointments/book?doctorId=${doctor.doctor_id}`}
                      className="mt-4 block rounded-xl bg-medibook-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-medibook-700"
                    >
                      Book appointment
                    </Link>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">
              No top doctors are available right now.
            </div>
          )}
        </section>
      )}

      <div className="mt-8">
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-48 animate-pulse rounded-2xl bg-slate-200" />
            ))}
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-slate-500">
            No doctors found{search.trim() ? ` for "${search.trim()}"` : ''}.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredDoctors.map((doctor) => (
              <article key={doctor.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-medibook-100 text-lg font-bold text-medibook-700">
                  {doctor.name.replace(/^Dr\.\s*/i, '').charAt(0)}
                </div>
                <h2 className="mt-4 text-xl font-bold text-medibook-950">{doctor.name}</h2>
                <p className="mt-1 font-medium text-medibook-600">{doctor.specialization}</p>
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-sm text-slate-500">Consultation fee</span>
                  <strong className="text-slate-900">Rs. {Number(doctor.consultation_fee).toFixed(2)}</strong>
                </div>
                <p className="mt-3 truncate text-sm text-slate-500">{doctor.email}</p>
                {user?.role === 'patient' && (
                  <Link
                    to={`/appointments/book?doctorId=${doctor.id}`}
                    className="mt-5 block rounded-xl bg-medibook-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-medibook-700"
                  >
                    Book appointment
                  </Link>
                )}
                {!user && (
                  <Link
                    to="/login"
                    className="mt-5 block rounded-xl border border-medibook-200 px-4 py-2.5 text-center text-sm font-semibold text-medibook-700 transition hover:bg-medibook-50"
                  >
                    Sign in to book
                  </Link>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
