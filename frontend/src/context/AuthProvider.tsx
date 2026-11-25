import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import type { User } from '../types/api'
import { getTokenExpirationTime, isWellFormedToken } from '../utils/authToken'
import { AuthContext } from './authContext'

const readStoredToken = () => {
  const token = sessionStorage.getItem('medibook_token')
  if (token && !isWellFormedToken(token)) {
    sessionStorage.removeItem('medibook_token')
    sessionStorage.removeItem('medibook_user')
    return null
  }

  const expiresAt = token ? getTokenExpirationTime(token) : null

  if (expiresAt !== null && expiresAt <= Date.now()) {
    sessionStorage.removeItem('medibook_token')
    sessionStorage.removeItem('medibook_user')
    return null
  }

  return token
}

const readStoredUser = (): User | null => {
  const value = sessionStorage.getItem('medibook_user')
  if (!value) return null

  try {
    return JSON.parse(value) as User
  } catch {
    sessionStorage.removeItem('medibook_user')
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(readStoredToken)
  const [user, setUser] = useState<User | null>(readStoredUser)

  useEffect(() => {
    const handleUnauthorized = () => {
      sessionStorage.removeItem('medibook_token')
      sessionStorage.removeItem('medibook_user')
      setToken(null)
      setUser(null)
    }

    window.addEventListener('medibook:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('medibook:unauthorized', handleUnauthorized)
  }, [])

  useEffect(() => {
    if (!token) return

    const expiresAt = getTokenExpirationTime(token)
    if (expiresAt === null) return

    const timeout = window.setTimeout(() => {
      toast.info('Your session has expired. Please sign in again.')
      window.dispatchEvent(new Event('medibook:unauthorized'))
    }, Math.max(0, expiresAt - Date.now()))

    return () => window.clearTimeout(timeout)
  }, [token])

  const login = (nextToken: string, nextUser: User) => {
    sessionStorage.setItem('medibook_token', nextToken)
    sessionStorage.setItem('medibook_user', JSON.stringify(nextUser))
    setToken(nextToken)
    setUser(nextUser)
  }

  const logout = () => {
    sessionStorage.removeItem('medibook_token')
    sessionStorage.removeItem('medibook_user')
    setToken(null)
    setUser(null)
  }

  const value = useMemo(
    () => ({ user, token, login, logout }),
    [user, token],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
      <ToastContainer
        position="top-center"
        autoClose={5000}
        closeOnClick
        pauseOnFocusLoss
        pauseOnHover
        newestOnTop
        hideProgressBar={false}
        theme="light"
      />
    </AuthContext.Provider>
  )
}
