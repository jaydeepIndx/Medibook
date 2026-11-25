import { apiClient } from './client'
import type { Prescription } from '../types/api'

export interface CreatePrescriptionPayload {
  notes: string
  medicines: string
}

interface CreatePrescriptionResponse {
  message: string
  prescription: Prescription
}

interface PrescriptionResponse {
  prescription: Prescription
}

export const createPrescription = async (
  appointmentId: number,
  payload: CreatePrescriptionPayload,
) => {
  const response = await apiClient.post<CreatePrescriptionResponse>(
    `/appointments/${appointmentId}/prescription`,
    payload,
  )
  return response.data
}

export const getPrescription = async (appointmentId: number) => {
  const response = await apiClient.get<PrescriptionResponse>(
    `/appointments/${appointmentId}/prescription`,
  )
  return response.data.prescription
}
