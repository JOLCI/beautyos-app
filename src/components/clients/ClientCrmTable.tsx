import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

interface ClientCrmTableProps {
  serviceIntervals: any[]
  transactions: any[]
}

const formatStatus = (status: string) => {
  const s = status?.toLowerCase() || ''
  if (['completed', 'finalizado', 'paid', 'pago'].includes(s)) return 'Finalizado'
  if (['cancelled', 'cancelado'].includes(s)) return 'Cancelado'
  return 'Aberto'
}

export function ClientCrmTable({ serviceIntervals, transactions }: ClientCrmTableProps) {
  const consumoList = useMemo(() => {
    const items: any[] = []

    serviceIntervals?.forEach((s: any) => {
      items.push({
        id: s.appointment_id,
        date: s.date,
        name: s.service_name,
        price: s.service_price,
        status: s.status,
        interval: s.days_interval,
        type: 'service',
      })
    })

    transactions?.forEach((t: any) => {
      if (t.type === 'inflow') {
        items.push({
          id: t.id,
          date: t.transaction_date,
          name: t.description,
          price: t.amount,
          status: t.status,
          interval: null,
          type: 'product',
        })
      }
    })

    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [serviceIntervals, transactions])

  return (
    <Card>
      <CardHeader>
        <CardTitle>CRM & Consumo</CardTitle>
        <CardDescription>
          Histórico de serviços e produtos consumidos pelo cliente, com cálculo de frequência de
          retorno.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Nome do Item</TableHead>
                <TableHead>Valor (R$)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Intervalo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {consumoList.map((item: any, i: number) => (
                <TableRow key={`${item.id}-${i}`}>
                  <TableCell>{new Date(item.date).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="font-medium">
                    {item.type === 'service' ? (
                      <span>
                        Serviço {item.name} em {new Date(item.date).toLocaleDateString('pt-BR')}
                      </span>
                    ) : (
                      <span>Produto/Outro: {item.name}</span>
                    )}
                  </TableCell>
                  <TableCell>R$ {Number(item.price || 0).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        formatStatus(item.status) === 'Cancelado'
                          ? 'destructive'
                          : formatStatus(item.status) === 'Finalizado'
                            ? 'default'
                            : 'secondary'
                      }
                    >
                      {formatStatus(item.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {item.type === 'service' ? (
                      item.interval !== null ? (
                        <Badge
                          variant="outline"
                          className="bg-primary/10 text-primary border-primary/20 font-bold whitespace-nowrap shadow-sm"
                        >
                          Intervalo: {item.interval} dias
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-muted text-muted-foreground font-bold whitespace-nowrap shadow-sm"
                        >
                          Intervalo: 0 dias
                        </Badge>
                      )
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {consumoList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Nenhum consumo registrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
