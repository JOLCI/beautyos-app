import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, DollarSign, FileText, Send } from 'lucide-react'
import { translateStatus } from '@/lib/utils'

export const formatStatus = (status: string) => {
  const s = status?.toLowerCase() || ''
  if (['completed', 'finalizado', 'paid', 'pago', 'sent'].includes(s)) return 'Finalizado'
  if (['cancelled', 'cancelado', 'failed'].includes(s)) return 'Cancelado'
  return 'Aberto'
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

  const timeline = useMemo(() => {
    const events: any[] = []
    appointments?.forEach((a: any) =>
      events.push({
        type: 'appointment',
        date: a.created_at,
        data: a,
        icon: Calendar,
        color: 'text-blue-500',
      }),
    )
    transactions?.forEach((t: any) =>
      events.push({
        type: 'transaction',
        date: t.created_at,
        data: t,
        icon: DollarSign,
        color: 'text-green-500',
      }),
    )
    titles?.forEach((t: any) =>
      events.push({
        type: 'title',
        date: t.created_at,
        data: t,
        icon: FileText,
        color: 'text-amber-500',
      }),
    )
    waSchedules?.forEach((w: any) =>
      events.push({
        type: 'whatsapp',
        date: w.created_at,
        data: w,
        icon: Send,
        color: 'text-emerald-500',
      }),
    )
    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [appointments, transactions, titles, waSchedules])

  return (
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
              const href =
                ev.type === 'appointment'
                  ? `/${passkey}/agenda?date=${ev.data.date}`
                  : ev.type === 'transaction'
                    ? `/${passkey}/financeiro/caixa`
                    : ev.type === 'title'
                      ? `/${passkey}/financeiro/contas-receber`
                      : '#'

              return (
                <div
                  key={idx}
                  className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
                >
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-card shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm ${ev.color} z-10`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <Link
                    to={href}
                    className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border bg-card shadow-sm space-y-1 block hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {ev.type === 'appointment'
                          ? 'Agendamento'
                          : ev.type === 'transaction'
                            ? 'Transação'
                            : ev.type === 'title'
                              ? 'Título'
                              : 'WhatsApp'}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(ev.date).toLocaleString('pt-BR')}
                      </span>
                    </div>

                    {ev.type === 'appointment' && (
                      <div>
                        <p className="font-medium text-foreground">
                          {new Date(ev.data.date).toLocaleDateString('pt-BR')} às{' '}
                          {ev.data.start_time.slice(0, 5)}
                        </p>
                        <Badge
                          variant={
                            formatStatus(ev.data.status) === 'Finalizado'
                              ? 'default'
                              : formatStatus(ev.data.status) === 'Cancelado'
                                ? 'destructive'
                                : 'secondary'
                          }
                          className="text-[10px] mt-1 uppercase"
                        >
                          {formatStatus(ev.data.status)}
                        </Badge>
                      </div>
                    )}

                    {ev.type === 'transaction' && (
                      <div>
                        <p className="font-medium text-foreground">
                          R$ {ev.data.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {ev.data.payment_method} • {translateStatus(ev.data.status)}
                        </p>
                      </div>
                    )}

                    {ev.type === 'title' && (
                      <div>
                        <p className="font-medium text-foreground">
                          R$ {ev.data.original_amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Venc.: {new Date(ev.data.due_date).toLocaleDateString('pt-BR')} •{' '}
                          {translateStatus(ev.data.status)}
                        </p>
                      </div>
                    )}

                    {ev.type === 'whatsapp' && (
                      <div>
                        <p className="text-sm italic line-clamp-2 text-muted-foreground">
                          "{ev.data.rendered_message}"
                        </p>
                        <Badge variant="secondary" className="text-[10px] mt-2 uppercase">
                          {translateStatus(ev.data.status)}
                        </Badge>
                      </div>
                    )}
                  </Link>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">Nenhum evento registrado.</p>
        )}
      </CardContent>
    </Card>
  )
}
