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

export default function AtendimentoHistoricoPage() {
  const { data: apps } = useQuery<any>('appointments', { match: { status: 'finalizado' } })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Histórico de Atendimentos</h1>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Horário</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apps.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{a.date}</TableCell>
                  <TableCell>{a.start_time}</TableCell>
                </TableRow>
              ))}
              {apps.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-8">
                    Nenhum histórico
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
