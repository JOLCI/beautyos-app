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
    name: 'Pacote Noiva',
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

export const mockTransactions = [
  {
    id: 't1',
    type: 'entrada',
    amount: 150,
    description: 'Corte - Carla',
    date: new Date().toISOString(),
  },
  {
    id: 't2',
    type: 'saida',
    amount: 50,
    description: 'Material Limpeza',
    date: new Date().toISOString(),
  },
]

export const mockPayables = [
  {
    id: 'p1',
    description: 'Conta de Luz',
    amount: 350,
    dueDate: new Date().toISOString(),
    status: 'pending',
  },
  {
    id: 'p2',
    description: 'Fornecedor X',
    amount: 1200,
    dueDate: new Date(Date.now() - 86400000).toISOString(),
    status: 'overdue',
  },
]

export const mockReceivables = [
  {
    id: 'r1',
    description: 'Convênio Y',
    amount: 500,
    dueDate: new Date().toISOString(),
    status: 'pending',
    type: 'convenio',
  },
]

export const mockDashboard = {
  revenueWeekly: [
    { name: 'Seg', total: 400 },
    { name: 'Ter', total: 300 },
    { name: 'Qua', total: 550 },
    { name: 'Qui', total: 200 },
    { name: 'Sex', total: 800 },
    { name: 'Sáb', total: 1200 },
    { name: 'Dom', total: 0 },
  ],
  cashFlow: [
    { name: 'Jan', entrada: 4000, saida: 2400 },
    { name: 'Fev', entrada: 3000, saida: 1398 },
    { name: 'Mar', entrada: 2000, saida: 9800 },
    { name: 'Abr', entrada: 2780, saida: 3908 },
    { name: 'Mai', entrada: 1890, saida: 4800 },
    { name: 'Jun', entrada: 2390, saida: 3800 },
  ],
}
