import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function translateStatus(status: string) {
  if (!status) return ''
  const s = status.toLowerCase()
  const map: Record<string, string> = {
    open: 'Aberto',
    partial: 'Parcial',
    paid: 'Pago',
    cancelled: 'Cancelado',
    pending: 'Pendente',
    confirmed: 'Confirmado',
    inflow: 'Entrada',
    outflow: 'Saída',
    agendado: 'Agendado',
    em_atendimento: 'Em Atendimento',
    finalizado: 'Finalizado',
    faltou: 'Faltou',
    provisional: 'Provisório',
    completed: 'Finalizado',
    sent: 'Enviado',
    failed: 'Falhou',
  }
  return map[s] || status.toUpperCase()
}
