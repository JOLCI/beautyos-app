import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPhoneForDisplay(phone: string | null | undefined) {
  if (!phone) return ''
  const digits = phone.replace(/\D/g, '')
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim()
  }
  return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim()
}

export function formatPhoneForStorage(phone: string | null | undefined) {
  if (!phone) return ''
  return phone.replace(/\D/g, '')
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
