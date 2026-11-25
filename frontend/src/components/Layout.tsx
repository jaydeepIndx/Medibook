import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-medibook-100 text-medibook-700'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
  }`

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-medibook-950">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-medibook-600 text-white">M</span>
            MediBook
          </Link>

          <nav aria-label="Main navigation" className="flex items-center gap-1">
            {user?.role !== 'doctor' && (
              <NavLink to="/doctors" className={navClass}>Doctors</NavLink>
            )}
            {(user?.role === 'patient' || user?.role === 'doctor') && (
              <NavLink to="/appointments" className={navClass}>Appointments</NavLink>
            )}
            {user?.role === 'admin' && (
              <NavLink to="/admin" className={navClass}>Dashboard</NavLink>
            )}
            {user ? (
              <>
                <span className="hidden rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700 md:block">
                  {user.name}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={navClass}>Login</NavLink>
                <NavLink to="/register" className={navClass}>Register</NavLink>
              </>
            )}
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
