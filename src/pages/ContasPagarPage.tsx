import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Plus, CheckCircle2 } from 'lucide-react'
import { mockPayables } from '@/lib/mock'
import { toast } from 'sonner'

export default function ContasPagarPage() {
  const [payables, setPayables] = useState(mockPayables)

  const handlePay = (id: string) => {
    setPayables(payables.map((p) => (p.id === id ? { ...p, status: 'paid' } : p)))
    toast.success('Conta Paga', { description: 'Despesa registrada no caixa.' })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contas a Pagar</h1>
          <p className="text-muted-foreground">Gestão de despesas e fornecedores.</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" /> Nova Conta
        </Button>
      </div>

      <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
        <div>
          <h4 className="font-semibold text-sm">Atenção: Contas Vencidas</h4>
          <p className="text-xs mt-1 opacity-90">
            Existem contas vencidas. Regularize para evitar juros.
          </p>
        </div>
      </div>

      <div className="md:hidden space-y-4">
        {payables.map((p) => (
          <Card key={p.id} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <span className="font-semibold">{p.description}</span>
              <span className="font-bold">R$ {p.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm mt-4">
              <span className="text-muted-foreground">
                Venc: {new Date(p.dueDate).toLocaleDateString('pt-BR')}
              </span>
              {p.status !== 'paid' ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-green-600"
                  onClick={() => handlePay(p.id)}
                >
                  Pagar
                </Button>
              ) : (
                <Badge className="bg-green-500">Pago</Badge>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="hidden md:block">
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
                {payables.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.description}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(p.dueDate).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="font-bold">R$ {p.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      {p.status === 'paid' ? (
                        <Badge className="bg-green-500">Pago</Badge>
                      ) : p.status === 'overdue' ? (
                        <Badge variant="destructive">Vencida</Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-600 border-amber-300">
                          Pendente
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {p.status !== 'paid' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-200 hover:bg-green-50"
                          onClick={() => handlePay(p.id)}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" /> Pagar
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
    </div>
  )
}
