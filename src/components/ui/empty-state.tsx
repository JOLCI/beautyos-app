import { ReactNode } from 'react'

interface EmptyStateProps {
  icon: React.ElementType
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="bg-muted/30 p-5 rounded-full mb-5">
        <Icon className="w-16 h-16 text-muted-foreground/25" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6">{description}</p>
      {action}
    </div>
  )
}
