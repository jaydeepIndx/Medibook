import { apiClient } from './client'
import type { User } from '../types/api'

export interface RegisterPayload {
  name: string
  email: string
  password: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  message: string
  access_token?: string
  jwt_token?: string
  user: User
}

export interface RegisterResponse {
  message: string
  user: User
}

export const registerUser = async (payload: RegisterPayload) => {
  const response = await apiClient.post<RegisterResponse>('/register', payload)
  return response.data
}

export const loginUser = async (payload: LoginPayload) => {
  const response = await apiClient.post<LoginResponse>('/login', payload)
  const accessToken = response.data.access_token?.trim() || response.data.jwt_token?.trim()

  if (!accessToken || accessToken.split('.').length !== 3 || accessToken.split('.').some((part) => !part)) {
    throw new Error('Login response did not contain a valid JWT. Please check the backend response.')
  }

  return {
    ...response.data,
    access_token: accessToken,
  }
}
