/**
 * Utility functions for standardizing financial representations.
 * Updated to reflect the new rigid database schema.
 */

export function formatEntityName(record: any): string {
  if (!record) return 'Não Identificado'
  if (record.clients && !Array.isArray(record.clients)) return record.clients.name
  if (record.suppliers && !Array.isArray(record.suppliers)) return record.suppliers.name
  if (record.client_id) return 'Cliente vinculado (nome indisponível)'
  if (record.supplier_id) return 'Fornecedor vinculado (nome indisponível)'
  return 'Não Identificado'
}

export function formatTransactionLabel(record: any): string {
  if (!record) return ''
  const entity = formatEntityName(record)
  const method = record.payment_method || '-'
  const desc = record.description ? ` - ${record.description}` : ''
  return `[${method}] ${entity}${desc}`
}

export function getOriginLabel(origin: string): string {
  const map: Record<string, string> = {
    manual_entry: 'Lançamento Manual',
    automatic_entry: 'PDV (Automático)',
    receivable_settlement: 'Baixa de Recebível',
    payable_settlement: 'Baixa de Pagamento',
    adjustment: 'Ajuste',
    transfer: 'Transferência',
  }
  return map[origin] || origin
}

export function translateStatusBR(s: string): string {
  if (!s) return ''
  const map: Record<string, string> = {
    pending: 'Pendente',
    confirmed: 'Confirmado',
    paid: 'Pago',
    open: 'Aberto',
    partial: 'Parcial',
    cancelled: 'Cancelado',
    completed: 'Finalizado',
    inflow: 'Entrada',
    outflow: 'Saída',
    agendado: 'Agendado',
    finalizado: 'Finalizado',
    cancelado: 'Cancelado',
  }
  return map[s.toLowerCase()] || s
}
