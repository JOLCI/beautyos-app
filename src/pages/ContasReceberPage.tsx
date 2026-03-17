import { useQuery } from '@/hooks/use-query'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Undo2, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function ContasReceberPage() {
  const { data: receivables, refetch } = useQuery<any>('financial_accounts', {
    match: { type: 'receivable' },
  })

  const receive = async (p: any) => {
    await supabase
      .from('financial_accounts')
      .update({ status: 'paid', settled_at: new Date().toISOString() })
      .eq('id', p.id)
    if (p.transaction_id)
      await supabase.from('transactions').update({ status: 'completed' }).eq('id', p.transaction_id)
    toast.success('Valor Recebido')
    refetch()
  }

  const undo = async (p: any) => {
    await supabase
      .from('financial_accounts')
      .update({ status: 'pending', settled_at: null })
      .eq('id', p.id)
    if (p.transaction_id)
      await supabase.from('transactions').update({ status: 'pending' }).eq('id', p.transaction_id)
    toast.info('Recebimento Desfeito')
    refetch()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Contas a Receber</h1>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receivables.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.description}</TableCell>
                  <TableCell>{new Date(p.due_date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-bold text-primary">R$ {p.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    {p.status === 'paid' ? (
                      <Badge className="bg-green-500">Recebido</Badge>
                    ) : (
                      <Badge variant="outline">Pendente</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {p.status !== 'paid' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600"
                        onClick={() => receive(p)}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Receber
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-amber-500"
                        onClick={() => undo(p)}
                      >
                        <Undo2 className="w-4 h-4 mr-2" /> Desfazer
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
