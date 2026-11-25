import { apiClient } from './client'
import type { Appointment, MyAppointment } from '../types/api'

export interface BookAppointmentPayload {
  doctor_id: number
  start_time: string
}

interface AppointmentResponse {
  message: string
  appointment: Appointment
}

interface MyAppointmentsResponse {
  appointments: MyAppointment[]
}

export const bookAppointment = async (payload: BookAppointmentPayload) => {
  const response = await apiClient.post<AppointmentResponse>('/appointments', payload)
  return response.data
}

export const cancelAppointment = async (appointmentId: number) => {
  const response = await apiClient.post<AppointmentResponse>(
    `/appointments/${appointmentId}/cancel`,
  )
  return response.data
}

export const getMyAppointments = async () => {
  const response = await apiClient.get<MyAppointmentsResponse>('/appointments/me')
  return response.data.appointments
}
