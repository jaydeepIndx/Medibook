import { apiClient } from './client'
import type { User } from '../types/api'

export interface UpdateUserPayload {
  name: string
  email: string
  password: string
}

export interface UpdateUserResponse {
  message: string
  user: Pick<User, 'name' | 'email' | 'role'>
}

export const updateCurrentUser = async (payload: UpdateUserPayload) => {
  const response = await apiClient.patch<UpdateUserResponse>('/user/me', payload)
  return response.data
}
