import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, FileText, Send, Receipt } from 'lucide-react'
import { translateStatus } from '@/lib/utils'
import { TransactionTicketDialog } from '@/components/financeiro/TransactionTicketDialog'
import { NovoAgendamentoSheet } from '@/components/agenda/NovoAgendamentoSheet'
import { CheckoutSheet } from '@/components/atendimento/CheckoutSheet'
import { useQuery } from '@/hooks/use-query'

export const formatStatus = (status: string) => {
  const s = status?.toLowerCase() || ''
  if (['completed', 'finalizado', 'paid', 'pago', 'baixado'].includes(s)) return 'Finalizado'
  if (['confirmed', 'confirmado', 'sent'].includes(s)) return 'Confirmado'
  if (['cancelled', 'cancelado', 'failed', 'estornado'].includes(s)) return 'Cancelado'
  if (['pending', 'open', 'agendado', 'partial'].includes(s)) return 'Pendente'
  if (['vencido'].includes(s)) return 'Vencido'
  if (['provisional', 'provisório'].includes(s)) return 'Provisório'
  return 'Aberto'
}

const getStatusColor = (statusStr: string) => {
  if (statusStr === 'Finalizado') return 'bg-green-500 text-white border-green-600'
  if (statusStr === 'Confirmado') return 'bg-blue-500 text-white border-blue-600'
  if (statusStr === 'Cancelado') return 'bg-gray-400 text-white border-gray-500'
  if (statusStr === 'Vencido') return 'bg-destructive text-white border-destructive'
  return 'bg-amber-500 text-white border-amber-600'
}

interface ClientTimelineProps {
  clientId: string
  waSchedules: any[]
}

export function ClientTimeline({ clientId, waSchedules }: ClientTimelineProps) {
  const [selectedTx, setSelectedTx] = useState<any>(null)
  const [selectedApp, setSelectedApp] = useState<any>(null)
  const [checkoutApp, setCheckoutApp] = useState<any>(null)

  const { data: timelineData, refetch: refetchTimeline } = useQuery<any>('v_cliente_timeline_360', {
    match: { client_id: clientId },
  })
  const { data: appointments, refetch: refetchApps } = useQuery<any>('appointments', {
    match: { client_id: clientId },
  })
  const { data: transactions } = useQuery<any>('transactions', { match: { client_id: clientId } })
  const { data: services } = useQuery<any>('services')

  const handleRefetch = () => {
    refetchTimeline()
    refetchApps()
  }

  const timeline = useMemo(() => {
    const events: any[] = []

    timelineData?.forEach((item: any) => {
      let icon = Calendar
      let color = 'text-blue-500 bg-blue-50 border-blue-200'
      let dataObj = null

      if (item.tipo_evento === 'TRANSAÇÃO') {
        icon = Receipt
        color = 'text-green-600 bg-green-50 border-green-200'
        dataObj = transactions?.find((t: any) => t.id === item.id)
      } else if (item.tipo_evento === 'TÍTULO') {
        icon = FileText
        color = 'text-amber-600 bg-amber-50 border-amber-200'
      } else {
        dataObj = appointments?.find((a: any) => a.id === item.id)
      }

      const exactDate = item.data_ref || item.evento_datetime

      events.push({
        type: item.tipo_evento.toLowerCase(),
        date: item.data_ref || item.evento_datetime,
        data: dataObj || { ...item, status: item.status_evento },
        itemInfo: item,
        icon,
        color,
      })
    })

    waSchedules?.forEach((w: any) =>
      events.push({
        type: 'whatsapp',
        date: w.created_at,
        data: w,
        icon: Send,
        color: 'text-emerald-500 bg-emerald-50 border-emerald-200',
      }),
    )
    return events.sort((a, b) => {
      const timeA = new Date(a.date).getTime()
      const timeB = new Date(b.date).getTime()
      if (timeA !== timeB) return timeB - timeA

      const weight = (t: string, status: string) => {
        if (t === 'transação') return 4
        if (t === 'título') return 3
        if (t === 'agendamento' && (status === 'provisional' || status === 'provisório')) return 1
        if (t === 'agendamento') return 2
        return 0
      }

      return (
        weight(b.type, b.data?.status?.toLowerCase() || '') -
        weight(a.type, a.data?.status?.toLowerCase() || '')
      )
    })
  }, [timelineData, waSchedules, appointments, transactions])

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Eventos (360º)</CardTitle>
          <CardDescription>Rastreabilidade completa e interativa do cliente.</CardDescription>
        </CardHeader>
        <CardContent>
          {timeline.length > 0 ? (
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-border">
              {timeline.map((ev, idx) => {
                const Icon = ev.icon

                return (
                  <div
                    key={idx}
                    className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
                  >
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-4 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 ${ev.color}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div
                      onClick={() => {
                        if (ev.type === 'transação' && ev.data.ticket_id) setSelectedTx(ev.data)
                        if (ev.type === 'agendamento' && ev.data.start_time) setSelectedApp(ev.data)
                      }}
                      className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border bg-card shadow-sm space-y-1 block hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                          <Icon className="w-3 h-3" />
                          {ev.itemInfo?.tipo_evento || 'WhatsApp'}
                        </span>
                      </div>

                      {ev.type === 'agendamento' && (
                        <div
                          className={
                            formatStatus(ev.data.status) === 'Cancelado'
                              ? 'line-through opacity-70 text-muted-foreground'
                              : ''
                          }
                        >
                          <p className="font-medium text-foreground flex items-center gap-1.5">
                            {new Date(ev.data.date + 'T12:00:00').toLocaleDateString('pt-BR')} às{' '}
                            {ev.data.start_time?.slice(0, 5)}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            Agendado em {new Date(ev.date).toLocaleDateString('pt-BR')}
                          </p>
                          <div className="flex justify-between items-end mt-1">
                            <Badge
                              className={`text-[10px] uppercase no-underline ${getStatusColor(formatStatus(ev.data.status))}`}
                            >
                              {formatStatus(ev.data.status)}
                            </Badge>

                            {formatStatus(ev.data.status) !== 'Finalizado' &&
                              formatStatus(ev.data.status) !== 'Cancelado' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 text-[10px] px-2 py-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setCheckoutApp(ev.data)
                                  }}
                                >
                                  Finalizar Atendimento
                                </Button>
                              )}
                          </div>
                        </div>
                      )}

                      {ev.type === 'transação' && (
                        <div
                          className={
                            formatStatus(ev.data.status) === 'Cancelado'
                              ? 'line-through opacity-70 text-muted-foreground'
                              : ''
                          }
                        >
                          <p className="font-medium text-foreground">
                            R$ {ev.data.amount?.toFixed(2) || ev.itemInfo?.valor?.toFixed(2)}
                          </p>
                          <p className="text-[10px] text-muted-foreground mb-1">
                            Faturado em {new Date(ev.date).toLocaleDateString('pt-BR')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {ev.data.payment_method || '-'} • {ev.data.ticket_id || '-'}
                          </p>
                          <Badge
                            className={`text-[10px] mt-2 uppercase no-underline ${getStatusColor(formatStatus(ev.data.status))}`}
                          >
                            {formatStatus(ev.data.status)}
                          </Badge>
                        </div>
                      )}

                      {ev.type === 'título' && (
                        <div
                          className={
                            formatStatus(ev.data.status) === 'Cancelado'
                              ? 'line-through opacity-70 text-muted-foreground'
                              : ''
                          }
                        >
                          <p className="font-medium text-foreground">
                            R${' '}
                            {ev.itemInfo?.valor?.toFixed(2) || ev.data.original_amount?.toFixed(2)}
                          </p>
                          <p className="text-[10px] text-muted-foreground mb-1">
                            Lançado em {new Date(ev.date).toLocaleDateString('pt-BR')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Venc.:{' '}
                            {ev.data.due_date
                              ? new Date(ev.data.due_date + 'T12:00:00').toLocaleDateString('pt-BR')
                              : ev.itemInfo?.data_ref}
                          </p>
                          <Badge
                            className={`text-[10px] mt-1 uppercase no-underline ${getStatusColor(formatStatus(ev.data.status))}`}
                          >
                            {formatStatus(ev.data.status)}
                          </Badge>
                        </div>
                      )}

                      {ev.type === 'whatsapp' && (
                        <div>
                          <p className="text-[10px] text-muted-foreground mb-1">
                            Agendado para{' '}
                            {new Date(ev.data.scheduled_at_datetime).toLocaleDateString('pt-BR')}
                          </p>
                          <p className="text-sm italic line-clamp-2 text-muted-foreground">
                            "{ev.data.rendered_message}"
                          </p>
                          <Badge variant="secondary" className="text-[10px] mt-2 uppercase">
                            {formatStatus(ev.data.status)}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">Nenhum evento registrado.</p>
          )}
        </CardContent>
      </Card>

      <TransactionTicketDialog
        open={!!selectedTx}
        onOpenChange={(o: boolean) => !o && setSelectedTx(null)}
        transaction={selectedTx}
      />

      {selectedApp && (
        <NovoAgendamentoSheet
          open={!!selectedApp}
          onOpenChange={(o: boolean) => !o && setSelectedApp(null)}
          appointment={selectedApp}
        />
      )}

      {checkoutApp && (
        <CheckoutSheet
          open={!!checkoutApp}
          onOpenChange={(o: boolean) => !o && setCheckoutApp(null)}
          appointmentId={checkoutApp.id}
          initialClientId={checkoutApp.client_id}
          items={
            services?.filter(
              (s: any) =>
                checkoutApp.service_ids?.includes(s.id) || s.id === checkoutApp.service_id,
            ) || []
          }
          onComplete={() => {
            setCheckoutApp(null)
            handleRefetch()
          }}
        />
      )}
    </>
  )
}
