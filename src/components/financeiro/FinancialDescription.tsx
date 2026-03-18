import { Bot, User as UserIcon, CheckSquare, ArrowRightLeft } from 'lucide-react'
import { formatEntityName, getOriginLabel } from '@/lib/financial'

interface FinancialDescriptionProps {
  record: any
}

export function FinancialDescription({ record }: FinancialDescriptionProps) {
  if (!record) return null

  const entityName = formatEntityName(record)
  const isAuto = ['automatic_entry', 'receivable_settlement', 'payable_settlement'].includes(
    record.origin,
  )
  const originLabel = getOriginLabel(record.origin)

  return (
    <div className="flex flex-col gap-0.5" title={`${originLabel} - ${record.description || ''}`}>
      <div className="flex items-center gap-2">
        <span className="truncate font-semibold max-w-[180px]">{entityName}</span>
        {isAuto ? (
          <div className="bg-blue-100 p-1 rounded-md" title={originLabel}>
            <Bot className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          </div>
        ) : record.origin === 'adjustment' ? (
          <div className="bg-zinc-100 p-1 rounded-md" title={originLabel}>
            <ArrowRightLeft className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
          </div>
        ) : (
          <div className="bg-orange-100 p-1 rounded-md" title={originLabel}>
            <UserIcon className="w-3.5 h-3.5 text-orange-600 shrink-0" />
          </div>
        )}
      </div>
      {record.description && (
        <span className="text-xs text-muted-foreground truncate max-w-[200px]">
          {record.description}
        </span>
      )}
    </div>
  )
}
