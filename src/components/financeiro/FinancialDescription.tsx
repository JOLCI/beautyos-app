import { Bot, User as UserIcon } from 'lucide-react'
import { formatTransactionLabel, parseFinancialDescription } from '@/lib/financial'

interface FinancialDescriptionProps {
  record?: any
  description?: string
}

export function FinancialDescription({ record, description }: FinancialDescriptionProps) {
  // Backwards compatibility if only description is passed, but prefers record
  const descToParse = record
    ? formatTransactionLabel(record, record.clients?.name)
    : description || ''

  const { isStandard, clientName, origin } = parseFinancialDescription(descToParse)

  if (!isStandard) {
    return (
      <span className="truncate block max-w-[200px]" title={descToParse}>
        {descToParse}
      </span>
    )
  }

  return (
    <div className="flex items-center gap-2" title={descToParse}>
      <span className="truncate font-medium max-w-[160px]">{clientName}</span>
      {origin === 'A' ? (
        <div className="bg-blue-100 p-1 rounded-md" title="Origem Automática (PDV)">
          <Bot className="w-3.5 h-3.5 text-blue-600 shrink-0" />
        </div>
      ) : (
        <div className="bg-orange-100 p-1 rounded-md" title="Origem Manual">
          <UserIcon className="w-3.5 h-3.5 text-orange-600 shrink-0" />
        </div>
      )}
    </div>
  )
}
