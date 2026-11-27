import { createContext } from 'react'
import type { User } from '../types/api'

export interface AuthContextValue {
  user: User | null
  token: string | null
  login: (token: string, user: User) => void
  updateUser: (updates: Pick<User, 'name' | 'email'>) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
