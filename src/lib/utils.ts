import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges multiple class names into a single string
 * @param inputs - Array of class names
 * @returns Merged class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Translates database statuses to PT-BR
 * @param status - The original status string
 * @returns Translated status
 */
export function translateStatus(status?: string): string {
  if (!status) return ''
  const map: Record<string, string> = {
    open: 'Aberto',
    pending: 'Pendente',
    confirmed: 'Confirmado',
    agendado: 'Agendado',
    cancelled: 'Cancelado',
    cancelado: 'Cancelado',
    paid: 'Pago',
    partial: 'Parcial',
    provisional: 'Provisório',
    finalizado: 'Finalizado',
    completed: 'Concluído',
    inflow: 'Entrada',
    outflow: 'Saída',
  }
  return map[status.toLowerCase()] || status
}
