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
  // Matches: (METHOD) - Client Name (A or M or AUTOMATICO or MANUAL)
  const match = desc?.match(/^\((.*?)\) - (.*?) \((A|M|AUTOMATICO|MANUAL)\)$/)

  if (match) {
    const originStr = match[3]
    const origin = originStr === 'A' || originStr === 'AUTOMATICO' ? 'A' : 'M'
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
