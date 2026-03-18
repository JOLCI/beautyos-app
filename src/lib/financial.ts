/**
 * Utility functions for standardizing financial descriptions across the app.
 */

/**
 * Formats a standardized financial description.
 * @param method The payment method (e.g., PIX, DINHEIRO)
 * @param clientName The client's name (defaults to 'Cliente Não Identificado')
 * @param isAuto Whether the transaction was generated automatically by the system
 * @returns Standardized string like "(PIX) - Maria Silva (A)"
 */
export function formatFinancialDescription(method: string, clientName: string, isAuto: boolean) {
  const safeName = clientName?.trim() || 'Cliente Não Identificado'
  return `(${method || 'OUTROS'}) - ${safeName} (${isAuto ? 'A' : 'M'})`
}

/**
 * Parses a financial description into its components.
 * @param desc The description string
 * @returns Object with parsed components and whether it matches the standard format
 */
export function parseFinancialDescription(desc: string) {
  // Matches both legacy and new standardized descriptions
  const match = desc?.match(/^\((.*?)\) - (.*?) \((A|M|AUTOMATICO|MANUAL)\)$/i)

  if (match) {
    const originStr = match[3].toUpperCase()
    const origin = originStr.startsWith('A') ? 'A' : 'M'
    return {
      method: match[1],
      clientName: match[2],
      origin: origin as 'A' | 'M',
      isStandard: true,
    }
  }

  return {
    method: '',
    clientName: desc || '',
    origin: 'M' as const,
    isStandard: false,
  }
}

/**
 * Generates a strictly formatted transaction label based on a record object.
 * It enforces the (PAYMENT_METHOD) - Client Name (A/M) pattern even for legacy records.
 * @param record The transaction or financial_account record
 * @param clientNameOverride Optional client name fetched via JOIN or relation
 */
export function formatTransactionLabel(record: any, clientNameOverride?: string) {
  if (!record) return ''
  const desc = record.description || ''
  const parsed = parseFinancialDescription(desc)

  let isAuto = parsed.isStandard ? parsed.origin === 'A' : false
  if (record.origin && record.origin !== 'manual') isAuto = true
  if (record.ref_id || record.transaction_id) isAuto = true // Has appointment or related ref

  const method = parsed.isStandard ? parsed.method : record.payment_method || 'OUTROS'

  let clientName = parsed.isStandard ? parsed.clientName : desc

  if (clientNameOverride) {
    clientName = clientNameOverride
  } else if (
    clientName === '' ||
    clientName.toLowerCase().includes('não identificado') ||
    clientName.toLowerCase().includes('nao identificado')
  ) {
    clientName = 'Cliente Não Identificado'
  }

  return formatFinancialDescription(method, clientName, isAuto)
}
