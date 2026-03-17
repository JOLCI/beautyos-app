import { useQuery } from '@/hooks/use-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Wallet, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react'

export default function CaixaPage() {
  const { data: txs, loading } = useQuery<any>('transactions', {
    order: { column: 'created_at', ascending: false },
  })

  const saldo = txs.reduce(
    (acc, t) =>
      t.status === 'completed' ? (t.type === 'entrada' ? acc + t.amount : acc - t.amount) : acc,
    0,
  )

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Caixa Diário</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-primary mb-2">
              <Wallet className="w-4 h-4" /> Saldo Final
            </div>
            <div className="text-3xl font-bold">R$ {saldo.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="p-8 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Lançamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {txs.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="text-muted-foreground">
                      {new Date(t.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>{t.description}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={t.type === 'entrada' ? 'text-green-600' : 'text-destructive'}
                      >
                        {t.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{t.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold">R$ {t.amount.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
