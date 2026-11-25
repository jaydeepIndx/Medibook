export type UserRole = 'patient' | 'doctor' | 'admin'

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
}

export interface Doctor {
  id: number
  user_id?: number
  name: string
  email: string
  specialization: string
  consultation_fee: number
}

export interface TopDoctor {
  rank: number
  doctor_id: number
  name: string
  specialization: string
  consultation_fee: number
  completed_appointments: number
}

export type AppointmentStatus = 'booked' | 'cancelled' | 'completed'

export interface Appointment {
  id: number
  doctor_id: number
  patient_id: number
  start_time: string
  end_time: string
  status: AppointmentStatus
}

export interface MyAppointment extends Appointment {
  patient_name: string
  doctor_name: string
  specialization: string
  consultation_fee: number
}

export interface Prescription {
  id: number
  appointment_id: number
  notes: string
  medicines: string
  created_at: string
}
