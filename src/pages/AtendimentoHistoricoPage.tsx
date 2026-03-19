import { useState } from 'react'
import { useQuery } from '@/hooks/use-query'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Receipt, Loader2 } from 'lucide-react'
import { usePasskey } from '@/contexts/PasskeyContext'
import { TransactionTicketDialog } from '@/components/financeiro/TransactionTicketDialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { FinancialDescription } from '@/components/financeiro/FinancialDescription'
import { translateStatus } from '@/lib/utils'

export default function AtendimentoHistoricoPage() {
  const { company } = usePasskey()
  const [searchTerm, setSearchTerm] = useState('')
  const [ticketTx, setTicketTx] = useState<any>(null)

  const { data: transactions, loading } = useQuery<any>('transactions', {
    order: { column: 'created_at', ascending: false },
    select: '*, clients(name)',
  })

  const filtered = transactions.filter((t: any) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    const clientName = (Array.isArray(t.clients) ? t.clients[0]?.name : t.clients?.name) || ''
    return (
      t.id.toLowerCase().includes(term) ||
      t.description.toLowerCase().includes(term) ||
      clientName.toLowerCase().includes(term) ||
      t.payment_method?.toLowerCase().includes(term)
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Histórico de Transações</h1>
          <p className="text-muted-foreground">Consulte os tickets de vendas e atendimentos.</p>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-border bg-muted/20">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por ID, cliente, descrição..."
              className="pl-9 bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data / Hora</TableHead>
                  <TableHead>ID Ticket</TableHead>
                  <TableHead>Descrição / Cliente</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.slice(0, 100).map((t: any) => (
                  <TableRow
                    key={t.id}
                    className={t.status === 'cancelled' ? 'opacity-50 line-through' : ''}
                  >
                    <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                      {t.settled_at
                        ? new Date(t.settled_at).toLocaleString()
                        : new Date(t.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {t.id.split('-')[0].toUpperCase()}
                    </TableCell>
                    <TableCell className="font-medium max-w-[250px]">
                      <FinancialDescription record={t} />
                    </TableCell>
                    <TableCell className="uppercase text-[10px] tracking-wider font-semibold">
                      {t.payment_method || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          t.status === 'completed' || t.status === 'confirmed'
                            ? 'default'
                            : 'secondary'
                        }
                        className={
                          t.status === 'completed' || t.status === 'confirmed'
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : ''
                        }
                      >
                        {translateStatus(t.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold">R$ {t.amount.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      {(t.status === 'completed' || t.status === 'confirmed') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-primary"
                          onClick={() => setTicketTx(t)}
                          title="Ver Ticket"
                        >
                          <Receipt className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhuma transação encontrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        )}
      </Card>

      <TransactionTicketDialog
        transaction={ticketTx}
        open={!!ticketTx}
        onOpenChange={(o: boolean) => !o && setTicketTx(null)}
      />
    </div>
  )
}
