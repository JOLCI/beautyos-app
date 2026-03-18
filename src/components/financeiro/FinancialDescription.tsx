import { Bot, User as UserIcon } from 'lucide-react'
import { parseFinancialDescription } from '@/lib/financial'

interface FinancialDescriptionProps {
  description: string
}

export function FinancialDescription({ description }: FinancialDescriptionProps) {
  const { isStandard, clientName, origin } = parseFinancialDescription(description)

  if (!isStandard) {
    return (
      <span className="truncate block max-w-[200px]" title={description}>
        {description}
      </span>
    )
  }

  return (
    <div className="flex items-center gap-2" title={description}>
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
