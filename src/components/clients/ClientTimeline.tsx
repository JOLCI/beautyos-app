import { useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, FileText, Send, Receipt } from 'lucide-react'
import { translateStatus } from '@/lib/utils'
import { TransactionTicketDialog } from '@/components/financeiro/TransactionTicketDialog'
import { NovoAgendamentoSheet } from '@/components/agenda/NovoAgendamentoSheet'

export const formatStatus = (status: string) => {
  const s = status?.toLowerCase() || ''
  if (['completed', 'finalizado', 'paid', 'pago', 'sent', 'confirmed'].includes(s))
    return 'Finalizado'
  if (['cancelled', 'cancelado', 'failed', 'estornado'].includes(s)) return 'Cancelado'
  if (['pending', 'open', 'agendado', 'partial'].includes(s)) return 'Pendente'
  return 'Aberto'
}

const getStatusColor = (statusStr: string) => {
  if (statusStr === 'Finalizado') return 'bg-green-500 text-white border-green-600'
  if (statusStr === 'Cancelado') return 'bg-destructive text-white border-destructive'
  return 'bg-amber-500 text-white border-amber-600'
}

interface ClientTimelineProps {
  appointments: any[]
  transactions: any[]
  titles: any[]
  waSchedules: any[]
}

export function ClientTimeline({
  appointments,
  transactions,
  titles,
  waSchedules,
}: ClientTimelineProps) {
  const { passkey } = useParams()

  const [selectedTx, setSelectedTx] = useState<any>(null)
  const [selectedApp, setSelectedApp] = useState<any>(null)

  const timeline = useMemo(() => {
    const events: any[] = []
    appointments?.forEach((a: any) =>
      events.push({
        type: 'appointment',
        date: `${a.date}T${a.start_time}`,
        data: a,
        icon: Calendar,
        color: 'text-blue-500 bg-blue-50 border-blue-200',
      }),
    )
    transactions?.forEach((t: any) =>
      events.push({
        type: 'transaction',
        date: t.transaction_date ? `${t.transaction_date}T12:00:00` : t.created_at,
        data: t,
        icon: Receipt,
        color: 'text-green-600 bg-green-50 border-green-200',
      }),
    )
    titles?.forEach((t: any) =>
      events.push({
        type: 'title',
        date: t.created_at,
        data: t,
        icon: FileText,
        color: 'text-amber-600 bg-amber-50 border-amber-200',
      }),
    )
    waSchedules?.forEach((w: any) =>
      events.push({
        type: 'whatsapp',
        date: w.created_at,
        data: w,
        icon: Send,
        color: 'text-emerald-500 bg-emerald-50 border-emerald-200',
      }),
    )
    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [appointments, transactions, titles, waSchedules])

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
                        if (ev.type === 'transaction') setSelectedTx(ev.data)
                        if (ev.type === 'appointment') setSelectedApp(ev.data)
                      }}
                      className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border bg-card shadow-sm space-y-1 block hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                          <Icon className="w-3 h-3" />
                          {ev.type === 'appointment'
                            ? 'Agendamento'
                            : ev.type === 'transaction'
                              ? 'Transação'
                              : ev.type === 'title'
                                ? 'Título'
                                : 'WhatsApp'}
                        </span>
                      </div>

                      {ev.type === 'appointment' && (
                        <div
                          className={
                            formatStatus(ev.data.status) === 'Cancelado'
                              ? 'line-through opacity-70 text-muted-foreground'
                              : ''
                          }
                        >
                          <p className="font-medium text-foreground flex items-center gap-1.5">
                            {new Date(ev.data.date + 'T12:00:00').toLocaleDateString('pt-BR')} às{' '}
                            {ev.data.start_time.slice(0, 5)}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            Agendado em {new Date(ev.data.created_at).toLocaleDateString('pt-BR')}
                          </p>
                          <Badge
                            className={`text-[10px] mt-1 uppercase no-underline ${getStatusColor(formatStatus(ev.data.status))}`}
                          >
                            {formatStatus(ev.data.status)}
                          </Badge>
                        </div>
                      )}

                      {ev.type === 'transaction' && (
                        <div
                          className={
                            formatStatus(ev.data.status) === 'Cancelado'
                              ? 'line-through opacity-70 text-muted-foreground'
                              : ''
                          }
                        >
                          <p className="font-medium text-foreground">
                            R$ {ev.data.amount.toFixed(2)}
                          </p>
                          <p className="text-[10px] text-muted-foreground mb-1">
                            Faturado em {new Date(ev.data.created_at).toLocaleDateString('pt-BR')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {ev.data.payment_method} • {ev.data.ticket_id}
                          </p>
                          <Badge
                            className={`text-[10px] mt-2 uppercase no-underline ${getStatusColor(formatStatus(ev.data.status))}`}
                          >
                            {formatStatus(ev.data.status)}
                          </Badge>
                        </div>
                      )}

                      {ev.type === 'title' && (
                        <div
                          className={
                            formatStatus(ev.data.status) === 'Cancelado'
                              ? 'line-through opacity-70 text-muted-foreground'
                              : ''
                          }
                        >
                          <p className="font-medium text-foreground">
                            R$ {ev.data.original_amount.toFixed(2)}
                          </p>
                          <p className="text-[10px] text-muted-foreground mb-1">
                            Lançado em {new Date(ev.data.created_at).toLocaleDateString('pt-BR')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Venc.:{' '}
                            {new Date(ev.data.due_date + 'T12:00:00').toLocaleDateString('pt-BR')}
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
                            {translateStatus(ev.data.status)}
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

      <NovoAgendamentoSheet
        open={!!selectedApp}
        onOpenChange={(o: boolean) => !o && setSelectedApp(null)}
        appointment={selectedApp}
      />
    </>
  )
}
