import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { AlertTriangle, Plus, ArrowUpRight, ArrowDownRight, Wallet, Info } from 'lucide-react'
import { mockTransactions } from '@/lib/mock'
import { useAuth } from '@/contexts/AuthContext'

export default function CaixaPage() {
  const { user } = useAuth()
  const isAtendimento = user?.role === 'atendimento'
  const [transactions] = useState(mockTransactions)

  const saldo = transactions.reduce(
    (acc, t) => (t.type === 'entrada' ? acc + t.amount : acc - t.amount),
    1000,
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Caixa</h1>
          <p className="text-muted-foreground">Controle de entradas e saídas do dia.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="text-destructive border-destructive/30 hover:bg-destructive/10"
          >
            <ArrowDownRight className="w-4 h-4 mr-2" /> Nova Saída
          </Button>
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            <ArrowUpRight className="w-4 h-4 mr-2" /> Nova Entrada
          </Button>
        </div>
      </div>

      {isAtendimento && (
        <div className="bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 p-3 rounded-lg flex items-center gap-2 text-sm font-medium">
          <Info className="w-5 h-5" />
          Visualizando apenas seus lançamentos de hoje.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
              <Wallet className="w-4 h-4" /> Saldo Atual
            </div>
            <div className="text-3xl font-bold">R$ {saldo.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-sm font-medium text-green-600 mb-2">
              <ArrowUpRight className="w-4 h-4" /> Entradas Hoje
            </div>
            <div className="text-2xl font-bold">R$ 150,00</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-sm font-medium text-destructive mb-2">
              <ArrowDownRight className="w-4 h-4" /> Saídas Hoje
            </div>
            <div className="text-2xl font-bold">R$ 50,00</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-sm font-medium text-amber-500 mb-2">
              <AlertTriangle className="w-4 h-4" /> Pendente PIX
            </div>
            <div className="text-2xl font-bold">R$ 0,00</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="text-muted-foreground">
                    {new Date(t.date).toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell className="font-medium">{t.description}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        t.type === 'entrada'
                          ? 'text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20'
                          : 'text-destructive border-destructive/30 bg-destructive/10'
                      }
                    >
                      {t.type.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className={`text-right font-bold ${t.type === 'entrada' ? 'text-green-600' : 'text-destructive'}`}
                  >
                    {t.type === 'entrada' ? '+' : '-'} R$ {t.amount.toFixed(2)}
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
