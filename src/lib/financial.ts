/**
 * Utility functions for standardizing financial descriptions across the app.
 */

/**
 * Formats a standardized financial description.
 */
export function formatFinancialDescription(method: string, entityName: string, isAuto: boolean) {
  const safeName = entityName?.trim() || 'Não Identificado'
  return `(${method || 'OUTROS'}) - ${safeName} (${isAuto ? 'A' : 'M'})`
}

/**
 * Parses a financial description into its components.
 */
export function parseFinancialDescription(desc: string) {
  const match = desc?.match(/^\((.*?)\) - (.*?) \((A|M|AUTOMATICO|MANUAL)\)$/i)

  if (match) {
    const originStr = match[3].toUpperCase()
    const origin = originStr.startsWith('A') ? 'A' : 'M'
    return {
      method: match[1],
      clientName: match[2].trim(),
      origin: origin as 'A' | 'M',
      isStandard: true,
    }
  }

  return {
    method: '',
    clientName: desc?.trim() || '',
    origin: 'M' as const,
    isStandard: false,
  }
}

/**
 * Generates a strictly formatted transaction label based on a record object.
 * It enforces the (PAYMENT_METHOD) - Entity Name (A/M) pattern even for legacy records.
 */
export function formatTransactionLabel(record: any, entityNameOverride?: string) {
  if (!record) return ''
  const desc = record.description || ''
  const parsed = parseFinancialDescription(desc)

  let isAuto = parsed.isStandard ? parsed.origin === 'A' : false
  if (record.origin && record.origin !== 'manual') isAuto = true
  if (record.ref_id || record.transaction_id) isAuto = true

  const method = parsed.isStandard ? parsed.method : record.payment_method || 'OUTROS'

  let entityName = ''

  if (entityNameOverride && entityNameOverride.trim() !== '') {
    entityName = entityNameOverride
  } else if (record.clients) {
    entityName = Array.isArray(record.clients) ? record.clients[0]?.name : record.clients?.name
  } else if (record.suppliers) {
    entityName = Array.isArray(record.suppliers)
      ? record.suppliers[0]?.name
      : record.suppliers?.name
  }

  if (
    (!entityName || entityName.trim() === '') &&
    parsed.isStandard &&
    parsed.clientName &&
    !parsed.clientName.toLowerCase().includes('não identificado') &&
    !parsed.clientName.toLowerCase().includes('nao identificado')
  ) {
    entityName = parsed.clientName
  }

  if (
    (!entityName || entityName.trim() === '') &&
    desc &&
    !desc.toLowerCase().includes('não identificado') &&
    !desc.toLowerCase().includes('nao identificado')
  ) {
    entityName = desc
  }

  if (
    !entityName ||
    entityName.trim() === '' ||
    entityName.toLowerCase().includes('não identificado') ||
    entityName.toLowerCase().includes('nao identificado')
  ) {
    entityName = 'Não Identificado'
  }

  return formatFinancialDescription(method, entityName, isAuto)
}
