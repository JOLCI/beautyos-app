import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@/hooks/use-query'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Calendar as CalendarIcon,
  Plus,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock,
} from 'lucide-react'
import { NovoAgendamentoSheet } from '@/components/agenda/NovoAgendamentoSheet'
import { translateStatus } from '@/lib/utils'

export default function AgendaPage() {
  const navigate = useNavigate()
  const { passkey } = useParams()
  const searchParams = new URLSearchParams(window.location.search)
  const initialDate = searchParams.get('date') || new Date().toISOString().split('T')[0]

  const [date, setDate] = useState(initialDate)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingApp, setEditingApp] = useState<any>(null)

  const {
    data: appointments,
    loading,
    refetch,
  } = useQuery<any>('appointments', { match: { date } })
  const { data: clients } = useQuery<any>('clients')
  const { data: services } = useQuery<any>('services')

  const openSheet = (app: any = null) => {
    setEditingApp(app)
    setSheetOpen(true)
  }

  const hours = Array.from({ length: 12 }, (_, i) => i + 8)

  const getTodayStr = () => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }
  const todayStr = getTodayStr()

  const changeDate = (days: number) => {
    const d = new Date(date + 'T12:00:00')
    d.setDate(d.getDate() + days)
    setDate(d.toISOString().split('T')[0])
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agenda Interativa</h1>
          <p className="text-muted-foreground">Clique num horário para criar ou editar.</p>
        </div>
        <Button onClick={() => openSheet()} className="rounded-full shadow-md">
          <Plus className="w-4 h-4 mr-2" /> Novo Agendamento
        </Button>
      </div>

      <Card className="p-4 shadow-sm border-border overflow-x-auto min-w-[600px]">
        <div className="flex items-center justify-between mb-6 border-b pb-4">
          <div className="flex items-center gap-4">
            <CalendarIcon className="w-5 h-5 text-primary" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent font-medium outline-none border-none cursor-pointer text-lg"
            />
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={() => changeDate(-1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={() => setDate(getTodayStr())}>
              Hoje
            </Button>
            <Button variant="outline" size="icon" onClick={() => changeDate(1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-1 relative">
            {hours.map((h) => {
              const apps = appointments.filter((a: any) =>
                a.start_time.startsWith(String(h).padStart(2, '0')),
              )
              return (
                <div key={h} className="flex border-b border-border/50 last:border-0 min-h-[5rem]">
                  <div className="w-20 py-3 px-2 text-sm text-muted-foreground font-medium">
                    {String(h).padStart(2, '0')}:00
                  </div>
                  <div className="flex-1 p-2 flex gap-2 relative">
                    {apps.length === 0 ? (
                      <div
                        className="flex-1 border-2 border-dashed border-transparent hover:border-muted rounded-lg cursor-pointer flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                        onClick={() => openSheet()}
                      >
                        <span className="text-xs font-medium text-muted-foreground">
                          <Plus className="inline w-3 h-3" /> Agendar
                        </span>
                      </div>
                    ) : (
                      apps.map((a: any) => {
                        const cli = clients.find((c: any) => c.id === a.client_id)
                        const srvs = services.filter(
                          (s: any) => a.service_ids?.includes(s.id) || a.service_id === s.id,
                        )
                        const srvNames = srvs.map((s: any) => s.name).join(', ')

                        const isOverdue =
                          a.date < todayStr &&
                          a.status !== 'finalizado' &&
                          a.status !== 'cancelado' &&
                          a.status !== 'provisional'
                        const isCanceled = a.status === 'cancelado'
                        const isProvisional = a.status === 'provisional'

                        let cardClass = 'border-l-primary bg-card hover:-translate-y-1'
                        if (isCanceled)
                          cardClass =
                            'border-l-muted bg-muted/40 opacity-70 line-through text-muted-foreground'
                        else if (isProvisional)
                          cardClass =
                            'border-dashed border-2 border-primary/50 bg-primary/5 shadow-none'
                        else if (isOverdue)
                          cardClass =
                            'border-l-destructive bg-destructive/10 border-destructive shadow-sm'

                        return (
                          <div
                            key={a.id}
                            onClick={() => openSheet(a)}
                            className={`flex-1 flex flex-col justify-between border shadow-sm rounded-lg p-3 cursor-pointer transition-all hover:shadow-md border-l-4 ${cardClass}`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="font-semibold text-sm flex items-center gap-2">
                                  {cli?.name}
                                  {isOverdue && (
                                    <AlertTriangle className="w-3 h-3 text-destructive" />
                                  )}
                                  {isProvisional && <Clock className="w-3 h-3 text-primary" />}
                                </span>
                                <Badge
                                  variant={
                                    isCanceled
                                      ? 'secondary'
                                      : isOverdue
                                        ? 'destructive'
                                        : isProvisional
                                          ? 'outline'
                                          : 'default'
                                  }
                                  className={`text-[10px] uppercase ${isProvisional ? 'text-primary border-primary' : ''}`}
                                >
                                  {isOverdue ? 'Atrasado' : translateStatus(a.status)}
                                </Badge>
                              </div>
                              <div className="text-xs text-muted-foreground line-clamp-2">
                                {srvNames || 'Serviço'} • {a.start_time.slice(0, 5)} -{' '}
                                {a.end_time.slice(0, 5)}
                              </div>
                            </div>
                            {!isCanceled && !isProvisional && a.status !== 'finalizado' && (
                              <div className="mt-3 flex justify-end">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="h-7 text-xs bg-green-500/10 text-green-700 hover:bg-green-500/20 rounded-md"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    navigate(`/${passkey}/atendimento/novo?appointmentId=${a.id}`)
                                  }}
                                >
                                  <CheckCircle2 className="w-3 h-3 mr-1" /> Checkout
                                </Button>
                              </div>
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
      <NovoAgendamentoSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSuccess={refetch}
        appointment={editingApp}
      />
    </div>
  )
}
