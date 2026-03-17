import { User, Client, Service, Appointment } from '@/types'

export const mockUsers: User[] = [
  { id: '1', name: 'Ana Gerente', username: 'ana', role: 'admin', passkey: 'BEAUTY01' },
  { id: '2', name: 'Bia Recepcionista', username: 'bia', role: 'atendimento', passkey: 'BEAUTY01' },
  { id: '3', name: 'Root Admin', username: 'root', role: 'root' },
]

export const mockClients: Client[] = [
  {
    id: '1',
    name: 'Carla Dias',
    phone: '11999999999',
    email: 'carla@ex.com',
    createdAt: '2023-01-10',
  },
  {
    id: '2',
    name: 'Mariana Souza',
    phone: '11888888888',
    email: 'mariana@ex.com',
    createdAt: '2023-02-15',
  },
  {
    id: '3',
    name: 'Juliana Costa',
    phone: '11777777777',
    email: 'ju@ex.com',
    createdAt: '2023-03-20',
    specialPrices: { '2': 220 },
  },
]

export const mockServices: Service[] = [
  { id: '1', code: 'SRV-0001', name: 'Corte Feminino', price: 150, duration: 60 },
  { id: '2', code: 'SRV-0002', name: 'Coloração', price: 250, duration: 120 },
  { id: '3', code: 'SRV-0003', name: 'Escova', price: 80, duration: 40 },
  {
    id: '4',
    code: 'SRV-0004',
    name: 'Pacote Noiva (Corte + Cor)',
    price: 380,
    duration: 180,
    isComposite: true,
    costPrice: 300,
  },
]

export const mockProfessionals = [
  { id: 'p1', name: 'João Cabeleireiro' },
  { id: 'p2', name: 'Silvia Colorista' },
]

export const mockAppointments: Appointment[] = [
  {
    id: 'a1',
    clientId: '1',
    serviceId: '1',
    professionalId: 'p1',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    status: 'confirmado',
  },
  {
    id: 'a2',
    clientId: '2',
    serviceId: '2',
    professionalId: 'p2',
    date: new Date().toISOString().split('T')[0],
    startTime: '14:00',
    endTime: '16:00',
    status: 'agendado',
  },
]
