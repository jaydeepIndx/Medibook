import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          
          <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight text-medibook-950 sm:text-6xl">
            Find the right doctor and book with confidence.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Browse specialists, check consultation fees, and manage your MediBook account in one place.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/doctors"
              className="rounded-xl bg-medibook-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-medibook-700"
            >
              Browse doctors
            </Link>
            <Link
              to="/register"
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:border-medibook-500 hover:text-medibook-700"
            >
              Create account
            </Link>
          </div>
        </div>

      
      </div>
    </section>
  )
}
