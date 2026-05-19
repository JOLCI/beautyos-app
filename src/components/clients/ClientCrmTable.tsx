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
    const appsMap = new Map()

    // 1. Group services by appointment
    serviceIntervals?.forEach((s: any) => {
      if (s.appointment_id) {
        if (!appsMap.has(s.appointment_id)) {
          appsMap.set(s.appointment_id, {
            id: s.appointment_id,
            date: s.date,
            services: [s.service_name].filter(Boolean),
            price: Number(s.service_price || 0),
            status: s.status,
            interval: s.days_interval,
            type: 'service',
          })
        } else {
          const app = appsMap.get(s.appointment_id)
          if (s.service_name) app.services.push(s.service_name)
          app.price += Number(s.service_price || 0)
          if (s.days_interval && (app.interval === null || s.days_interval < app.interval)) {
            app.interval = s.days_interval
          }
        }
      }
    })

    // 2. Process transactions
    const processedAppIds = new Set()
    transactions?.forEach((t: any) => {
      if (t.type === 'inflow') {
        const isAppointment = !!t.ref_id

        if (isAppointment && appsMap.has(t.ref_id)) {
          // Update the grouped appointment with transaction exact data (accounting for discounts/products)
          const app = appsMap.get(t.ref_id)
          app.price = t.amount // Use transaction amount with discount
          app.status =
            t.status === 'confirmed'
              ? 'finalizado'
              : t.status === 'cancelled'
                ? 'cancelado'
                : app.status

          if (t.metadata?.items?.length) {
            app.services = t.metadata.items.map((i: any) => i.name)
          }

          processedAppIds.add(t.ref_id)
        } else {
          // Standalone transaction / Product / Avulso
          const tItems = t.metadata?.items
          if (tItems && tItems.length > 0) {
            items.push({
              id: t.id, // Grouping standalone items in one line for the transaction
              date: t.transaction_date,
              name: tItems.map((i: any) => i.name).join(', '),
              price: t.amount, // Real amount paid
              status: t.status,
              interval: null,
              type: 'product',
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
      }
    })

    // 3. Add all grouped appointments
    appsMap.forEach((app) => {
      items.push({
        id: app.id,
        date: app.date,
        name: app.services.length > 0 ? app.services.join(', ') : 'Serviço',
        price: app.price,
        status: app.status,
        interval: app.interval,
        type: 'service',
      })
    })

    // 4. Sort descending by date
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
                <TableHead>Itens / Serviços</TableHead>
                <TableHead>Valor Total (R$)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Frequência</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {consumoList.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {new Date(item.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell
                    className={`font-medium ${formatStatus(item.status) === 'Cancelado' ? 'line-through text-muted-foreground' : ''}`}
                  >
                    {item.type === 'service' ? (
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg shrink-0">
                          <Calendar className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex flex-col">
                          <span>{item.name}</span>
                          <span className="text-xs text-muted-foreground font-normal">
                            Agendado em{' '}
                            {new Date(item.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="bg-emerald-500/10 p-2 rounded-lg shrink-0">
                          <DollarSign className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="flex flex-col">
                          <span>{item.name}</span>
                          <span className="text-xs text-muted-foreground font-normal">
                            Produto/Avulso
                          </span>
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
                      item.interval !== null && item.interval !== undefined ? (
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
                          Primeira vez
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
