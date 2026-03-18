import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useQuery } from '@/hooks/use-query'
import { formatEntityName, getOriginLabel } from '@/lib/financial'
import { Receipt, User, Clock, CheckCircle2, AlertCircle } from 'lucide-react'

export function TransactionTicketDialog({ transaction, open, onOpenChange }: any) {
  const { data: profiles } = useQuery<any>('profiles')
  const { data: appointments } = useQuery<any>('appointments')
  const { data: services } = useQuery<any>('services')

  if (!transaction) return null

  const professional = profiles?.find((p: any) => p.id === transaction.created_by)
  const resolvedClientName = formatEntityName(transaction)
  const metadata = transaction.metadata || {}
  let items = metadata.items || []
  const discount = metadata.discount || 0

  if (items.length === 0 && transaction.ref_id && appointments && services) {
    const app = appointments.find((a: any) => a.id === transaction.ref_id)
    if (app) {
      if (app.service_ids && app.service_ids.length > 0) {
        items = app.service_ids.map((sid: string) => {
          const svc = services.find((s: any) => s.id === sid)
          return { name: svc?.name || 'Serviço', price: svc?.price || 0, quantity: 1 }
        })
      } else if (app.service_id) {
        const svc = services.find((s: any) => s.id === app.service_id)
        items = [{ name: svc?.name || 'Serviço', price: svc?.price || 0, quantity: 1 }]
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] w-[95vw] p-0 flex flex-col gap-0 max-h-[90vh] overflow-hidden rounded-xl shadow-2xl">
        <DialogHeader className="p-6 pb-4 border-b shrink-0 bg-background z-10">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Receipt className="w-5 h-5 text-primary" /> Ticket da Transação
          </DialogTitle>
          <DialogDescription className="sr-only">Detalhes da transação.</DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto p-6 pt-4 space-y-6 flex-1 bg-background relative">
          <div className="flex justify-between items-start text-sm">
            <div className="space-y-1.5">
              <p className="text-muted-foreground text-[10px] uppercase tracking-wider font-semibold">
                Data e Hora
              </p>
              <p className="font-medium flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {new Date(transaction.created_at).toLocaleString()}
              </p>
            </div>
            <div className="text-right space-y-1.5">
              <p className="text-muted-foreground text-[10px] uppercase tracking-wider font-semibold">
                ID Transação
              </p>
              <p className="font-mono text-sm bg-muted px-2 py-0.5 rounded text-muted-foreground">
                {transaction.ticket_id}
              </p>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/10 p-4 rounded-xl space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Entidade Vinculada</span>
              <span className="font-semibold text-foreground text-right max-w-[180px] truncate">
                {resolvedClientName}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Auditado por</span>
              <span className="font-medium flex items-center gap-1.5 text-right max-w-[180px] truncate">
                <User className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="truncate">{professional?.name || 'Sistema'}</span>
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Origem</span>
              <Badge
                variant="secondary"
                className="font-normal text-[10px] uppercase tracking-wider bg-background/50"
              >
                {getOriginLabel(transaction.origin)}
              </Badge>
            </div>
            <div className="flex justify-between items-center pt-2 mt-1 border-t border-border/50">
              <span className="text-muted-foreground">Forma de Pagamento</span>
              <span className="font-bold uppercase tracking-wide text-primary">
                {transaction.payment_method}
              </span>
            </div>
          </div>

          {items.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Itens do Faturamento
              </p>
              <div className="space-y-2 bg-muted/40 p-3 rounded-lg border">
                {items.map((it: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="font-medium max-w-[200px] truncate">
                      {it.quantity}x {it.name}
                    </span>
                    <span className="text-muted-foreground whitespace-nowrap">
                      R$ {it.price?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                ))}
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-destructive pt-2 border-t mt-2">
                    <span className="font-medium">Desconto Aplicado</span>
                    <span>- R$ {discount.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <Separator />
          <div className="flex justify-between items-center text-xl font-black">
            <span>Total Final</span>
            <span className={transaction.type === 'inflow' ? 'text-green-600' : 'text-destructive'}>
              {transaction.type === 'outflow' ? '-' : ''} R$ {transaction.amount.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-center pt-2">
            <Badge
              variant="outline"
              className={`gap-1.5 py-1 px-3 ${transaction.status === 'confirmed' ? 'bg-green-500/10 text-green-700 border-green-500/20' : 'bg-amber-500/10 text-amber-700 border-amber-500/20'}`}
            >
              {transaction.status === 'confirmed' && <CheckCircle2 className="w-3.5 h-3.5" />}
              {transaction.status === 'confirmed' ? 'Confirmado' : transaction.status.toUpperCase()}
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
