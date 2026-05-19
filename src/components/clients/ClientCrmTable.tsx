import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, DollarSign } from 'lucide-react'
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
  if (['completed', 'finalizado', 'paid', 'pago', 'confirmed'].includes(s)) return 'Finalizado'
  if (['cancelled', 'cancelado', 'failed', 'estornado'].includes(s)) return 'Cancelado'
  if (['pending', 'open', 'agendado', 'partial'].includes(s)) return 'Pendente'
  return 'Aberto'
}

const getStatusColor = (statusStr: string) => {
  if (statusStr === 'Finalizado') return 'bg-green-500 text-white border-green-600'
  if (statusStr === 'Cancelado') return 'bg-destructive text-white border-destructive'
  return 'bg-amber-500 text-white border-amber-600'
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
        const tItems = t.metadata?.items
        if (tItems && tItems.length > 0) {
          tItems.forEach((item: any, index: number) => {
            items.push({
              id: `${t.id}-${index}`,
              date: t.transaction_date,
              name: item.name,
              price: item.price,
              status: t.status,
              interval: null,
              type: 'product',
            })
          })
        } else {
          items.push({
            id: t.id,
            date: t.transaction_date,
            name: t.description || 'Outros (Sem itens detalhados)',
            price: t.amount,
            status: t.status,
            interval: null,
            type: 'product',
          })
        }
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
                  <TableCell
                    className={`font-medium ${formatStatus(item.status) === 'Cancelado' ? 'line-through text-muted-foreground' : ''}`}
                  >
                    {item.type === 'service' ? (
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg shrink-0">
                          <Calendar className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex flex-col">
                          <span>Serviço {item.name}</span>
                          <span className="text-xs text-muted-foreground font-normal">
                            Realizado em {new Date(item.date).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="bg-emerald-500/10 p-2 rounded-lg shrink-0">
                          <DollarSign className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="flex flex-col">
                          <span>Produto/Outro: {item.name}</span>
                        </div>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>R$ {Number(item.price || 0).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(formatStatus(item.status))}>
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
