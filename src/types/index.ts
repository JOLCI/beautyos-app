export type Role = 'admin' | 'atendimento' | 'root'

export interface User {
  id: string
  name: string
  username: string
  role: Role
  companyId?: string
  passkey?: string
}

export interface Client {
  id: string
  name: string
  phone: string
  email?: string
  avatarUrl?: string
  createdAt: string
  specialPrices?: Record<string, number>
}

export interface Service {
  id: string
  code: string
  name: string
  price: number
  duration: number // in minutes
  isComposite?: boolean
  costPrice?: number
}

export interface Appointment {
  id: string
  clientId: string
  serviceId?: string
  serviceIds?: string[]
  professionalId: string
  date: string // YYYY-MM-DD
  startTime: string // HH:mm
  endTime: string // HH:mm
  status: 'agendado' | 'confirmado' | 'em_atendimento' | 'finalizado' | 'cancelado' | 'faltou'
}

export interface Attendance {
  id: string
  appointmentId?: string
  clientId: string
  services: { serviceId: string; price: number }[]
  total: number
  discount: number
  finalTotal: number
  paymentMethod: string
  status: 'pending' | 'paid'
  date: string
}
