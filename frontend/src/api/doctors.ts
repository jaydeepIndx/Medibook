import { apiClient } from './client'
import type { Doctor, TopDoctor } from '../types/api'

export interface CreateDoctorPayload {
  name: string
  email: string
  password: string
  specialization: string
  consultation_fee: number
}

export type UpdateDoctorPayload = Omit<CreateDoctorPayload, 'password'>

export interface DoctorsResponse {
  doctors: Doctor[]
}

export const getDoctors = async (specialization?: string) => {
  const response = await apiClient.get<DoctorsResponse>('/doctors', {
    params: specialization ? { specialization } : undefined,
  })
  return response.data.doctors
}

export const getTopDoctors = async () => {
  const response = await apiClient.get<{ doctors: TopDoctor[] }>('/doctors/top')
  return response.data.doctors
}

export const createDoctor = async (payload: CreateDoctorPayload) => {
  const response = await apiClient.post<{ message: string; doctor: Doctor }>(
    '/doctors',
    payload,
  )
  return response.data
}

export const updateDoctor = async (doctorId: number, payload: UpdateDoctorPayload) => {
  const response = await apiClient.put<{ message: string; doctor: Doctor }>(
    `/doctors/${doctorId}`,
    payload,
  )
  return response.data
}

export const deleteDoctor = async (doctorId: number) => {
  const response = await apiClient.delete<{ message: string }>(`/doctors/${doctorId}`)
  return response.data
}
