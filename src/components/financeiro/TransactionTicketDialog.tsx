import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useQuery } from '@/hooks/use-query'
import { parseFinancialDescription } from '@/lib/financial'
import { Receipt, User, Clock, CheckCircle2, AlertCircle } from 'lucide-react'

export function TransactionTicketDialog({ transaction, open, onOpenChange }: any) {
  const { data: profiles } = useQuery<any>('profiles')

  if (!transaction) return null

  const { isStandard, clientName, origin } = parseFinancialDescription(transaction.description)
  const professional = profiles.find((p: any) => p.id === transaction.user_id)
  const metadata = transaction.metadata || {}
  const items = metadata.items || []
  const discount = metadata.discount || 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Receipt className="w-5 h-5 text-primary" />
            Ticket da Transação
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-2">
          {/* Header Info */}
          <div className="flex justify-between items-start text-sm">
            <div className="space-y-1.5">
              <p className="text-muted-foreground text-[10px] uppercase tracking-wider font-semibold">
                Data e Hora
              </p>
              <p className="font-medium flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-muted-foreground" />
                {new Date(transaction.created_at).toLocaleString()}
              </p>
            </div>
            <div className="text-right space-y-1.5">
              <p className="text-muted-foreground text-[10px] uppercase tracking-wider font-semibold">
                ID Transação
              </p>
              <p className="font-mono text-sm bg-muted px-2 py-0.5 rounded text-muted-foreground">
                {transaction.id.split('-')[0].toUpperCase()}
              </p>
            </div>
          </div>

          {/* Main Info Card */}
          <div className="bg-primary/5 border border-primary/10 p-4 rounded-xl space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Cliente</span>
              <span className="font-semibold text-foreground">
                {isStandard ? clientName : 'Não Identificado'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Profissional</span>
              <span className="font-medium flex items-center gap-1.5">
                <User className="w-4 h-4 text-muted-foreground" />
                {professional?.name || 'Sistema'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Origem</span>
              <Badge
                variant="secondary"
                className="font-normal text-[10px] uppercase tracking-wider"
              >
                {origin === 'A' ? 'Automático (PDV)' : 'Lançamento Manual'}
              </Badge>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-border/50">
              <span className="text-muted-foreground">Forma de Pagamento</span>
              <span className="font-bold uppercase tracking-wide">
                {transaction.payment_method || '-'}
              </span>
            </div>
          </div>

          {/* Items Section */}
          {items.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Itens do Atendimento
              </p>
              <div className="space-y-2 bg-muted/40 p-3 rounded-lg border">
                {items.map((it: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="font-medium">
                      {it.quantity}x {it.name}
                    </span>
                    <span className="text-muted-foreground">R$ {it.price.toFixed(2)}</span>
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
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/40 p-3 rounded-lg border">
              <AlertCircle className="w-4 h-4" />
              Sem itens detalhados associados.
            </div>
          )}

          <Separator />

          {/* Footer Total */}
          <div className="flex justify-between items-center text-xl font-black">
            <span>Total Final</span>
            <span
              className={transaction.type === 'entrada' ? 'text-green-600' : 'text-destructive'}
            >
              {transaction.type === 'saida' ? '-' : ''} R$ {transaction.amount.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-center">
            <Badge
              variant="outline"
              className={`gap-1.5 py-1 px-3 ${
                transaction.status === 'completed'
                  ? 'bg-green-500/10 text-green-700 border-green-500/20'
                  : transaction.status === 'cancelled'
                    ? 'bg-destructive/10 text-destructive border-destructive/20'
                    : 'bg-amber-500/10 text-amber-700 border-amber-500/20'
              }`}
            >
              {transaction.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
              {transaction.status === 'completed'
                ? 'Recebido / Concluído'
                : transaction.status.toUpperCase()}
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
