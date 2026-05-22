import { useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@/hooks/use-query'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  Calendar as CalendarIcon,
  Plus,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  LayoutGrid,
  CalendarRange,
  Clock,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { NovoAgendamentoSheet } from '@/components/agenda/NovoAgendamentoSheet'
import { translateStatus, cn } from '@/lib/utils'
import { usePasskey } from '@/contexts/PasskeyContext'
import { useSidebar } from '@/components/ui/sidebar'

const ClientAvatar = ({ client, className }: { client?: any; className?: string }) => {
  return (
    <Avatar className={className}>
      {client?.avatar_url && (
        <AvatarImage src={client.avatar_url} alt={client?.name || 'Cliente'} />
      )}
      <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
        {client?.name?.substring(0, 2).toUpperCase() || 'CL'}
      </AvatarFallback>
    </Avatar>
  )
}

export default function AgendaPage() {
  const navigate = useNavigate()
  const { passkey } = useParams()
  const { company } = usePasskey()
  const { isMobile } = useSidebar()
  const searchParams = new URLSearchParams(window.location.search)
  const initialDate = searchParams.get('date') || new Date().toISOString().split('T')[0]

  const [date, setDate] = useState(initialDate)
  const [view, setView] = useState<'day' | 'fullWeek' | 'month'>('fullWeek')
  const [zoom, setZoom] = useState<'sm' | 'md' | 'lg'>('md')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingApp, setEditingApp] = useState<any>(null)
  const [selectedTimeForNew, setSelectedTimeForNew] = useState<{
    date: string
    time: string
  } | null>(null)

  const { data: appointments, loading, refetch } = useQuery<any>('appointments')
  const { data: clients } = useQuery<any>('clients')
  const { data: services } = useQuery<any>('services')
  const { data: professionals } = useQuery<any>('profiles')
  const { data: blockers } = useQuery<any>('agenda_blockers', {
    match: { company_id: company?.id, is_active: true },
  })

  const translateStatusBR = (s: string) => {
    const map: any = {
      pending: 'Pendente',
      agendado: 'Agendado',
      confirmed: 'Confirmado',
      completed: 'Finalizado',
      finalizado: 'Finalizado',
      cancelled: 'Cancelado',
      cancelado: 'Cancelado',
      provisional: 'Provisório',
    }
    return map[s?.toLowerCase()] || s
  }

  const openSheet = (app: any = null, timeInfo?: { date: string; time: string }) => {
    setEditingApp(app)
    setSelectedTimeForNew(timeInfo || null)
    setSheetOpen(true)
  }

  const getTodayStr = () => new Date().toISOString().split('T')[0]
  const todayStr = getTodayStr()

  const changeDate = (days: number) => {
    const d = new Date(date + 'T12:00:00')
    if (view === 'month') d.setMonth(d.getMonth() + (days > 0 ? 1 : -1))
    else d.setDate(d.getDate() + days)
    setDate(d.toISOString().split('T')[0])
  }

  const businessHours = company?.settings?.business_hours || {}
  const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

  const getDayConfig = (dStr: string) => {
    const d = new Date(dStr + 'T12:00:00')
    const dayName = daysOfWeek[d.getDay()]
    return businessHours[dayName] || { open: true, start: '08:00', end: '20:00' }
  }

  const calcularOcupacao = (apps: any[], config: any) => {
    if (!config.open || !config.start || !config.end) return 0
    const startH = parseInt(config.start.split(':')[0])
    const endH = parseInt(config.end.split(':')[0])
    const totalMinutosAbertos = (endH - startH) * 60
    if (totalMinutosAbertos <= 0) return 0

    let minutosUsados = 0
    apps.forEach((a) => {
      if (a.status !== 'cancelado' && a.status !== 'provisional') {
        const sh = parseInt(a.start_time.split(':')[0] || '0')
        const sm = parseInt(a.start_time.split(':')[1] || '0')
        const eh = parseInt(a.end_time.split(':')[0] || '0')
        const em = parseInt(a.end_time.split(':')[1] || '0')
        minutosUsados += eh * 60 + em - (sh * 60 + sm)
      }
    })
    return Math.min(100, Math.round((minutosUsados / totalMinutosAbertos) * 100))
  }

  const zoomClass = zoom === 'sm' ? 'min-h-[4rem]' : zoom === 'md' ? 'min-h-[6rem]' : 'min-h-[8rem]'

  const isBlocked = (dateStr: string, timeStr: string) => {
    if (!blockers) return false
    return blockers.some((b: any) => {
      if (b.type === 'interval' && b.start_date && b.end_date) {
        if (dateStr >= b.start_date && dateStr <= b.end_date) {
          if (!b.start_time || !b.end_time) return true
          return timeStr >= b.start_time && timeStr < b.end_time
        }
      } else if (b.start_date === dateStr) {
        if (!b.start_time || !b.end_time) return true
        return timeStr >= b.start_time && timeStr < b.end_time
      }
      return false
    })
  }

  const renderDayColumn = (currentDateStr: string) => {
    const config = getDayConfig(currentDateStr)
    const dayApps = appointments?.filter((a: any) => a.date === currentDateStr) || []

    const dataFormatada = new Date(currentDateStr + 'T12:00:00').toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
    })

    if (!config.open) {
      return (
        <div
          key={currentDateStr}
          className="flex-1 min-w-[120px] p-4 text-center text-muted-foreground bg-muted/20 border-r last:border-r-0 flex flex-col items-center"
        >
          <div className="font-medium mb-4 capitalize">{dataFormatada}</div>
          <span className="text-xs font-semibold bg-muted px-2 py-1 rounded-md">Fechado</span>
        </div>
      )
    }

    const startH = parseInt(config.start.split(':')[0])
    const endH = parseInt(config.end.split(':')[0])
    const hours = Array.from({ length: endH - startH + 1 }, (_, i) => i + startH)
    const ocupacao = calcularOcupacao(dayApps, config)

    return (
      <div
        key={currentDateStr}
        className={cn(
          'flex-1 border-r last:border-r-0 flex flex-col',
          view === 'fullWeek' ? 'min-w-[150px]' : 'min-w-[250px]',
        )}
      >
        <div className="p-2 text-center border-b font-medium bg-muted/30 sticky top-0 z-10 backdrop-blur-sm flex flex-col items-center gap-1">
          <span className="capitalize text-sm">{dataFormatada}</span>
          <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full ${ocupacao > 80 ? 'bg-destructive' : ocupacao > 50 ? 'bg-amber-500' : 'bg-primary'}`}
              style={{ width: `${ocupacao}%` }}
            />
          </div>
          <span className="text-[9px] text-muted-foreground">{ocupacao}% Ocupado</span>
        </div>
        <div className="relative flex-1">
          {hours.map((h) => {
            const timeStr = `${String(h).padStart(2, '0')}:00`
            const apps = dayApps.filter((a: any) =>
              a.start_time.startsWith(String(h).padStart(2, '0')),
            )
            const blocked = isBlocked(currentDateStr, timeStr)

            return (
              <div
                key={h}
                className={cn(
                  'flex border-b border-border/50 h-auto group items-stretch',
                  zoomClass,
                )}
              >
                <div className="w-12 py-2 px-1 text-[10px] text-muted-foreground font-medium text-center border-r border-border/50 bg-muted/10 shrink-0 flex items-center justify-center">
                  {timeStr}
                </div>
                <div
                  className={cn(
                    'flex-1 p-1.5 flex flex-col gap-1.5 relative transition-colors min-w-0',
                    blocked
                      ? 'bg-gray-200/50 cursor-not-allowed'
                      : 'bg-background hover:bg-muted/10 cursor-pointer',
                  )}
                  onClick={(e) => {
                    if (!blocked && e.target === e.currentTarget) {
                      openSheet(null, { date: currentDateStr, time: timeStr })
                    }
                  }}
                >
                  {blocked && apps.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-100 px-2 py-1 rounded">
                        Indisponível
                      </span>
                    </div>
                  )}
                  {/* Render Blockers */}
                  {blockers
                    ?.filter(
                      (b: any) =>
                        b.start_date <= currentDateStr &&
                        (!b.end_date || b.end_date >= currentDateStr) &&
                        b.start_time.startsWith(String(h).padStart(2, '0')),
                    )
                    .map((b: any, idx: number) => {
                      const prof = professionals?.find((p: any) => p.id === b.professional_id)
                      return (
                        <div
                          key={`block-${b.id}-${idx}`}
                          className="flex flex-col border shadow-sm rounded-lg p-2.5 transition-all border-l-4 border-l-gray-600 bg-gray-100 text-gray-500 w-full min-h-[5.5rem] opacity-80 cursor-not-allowed"
                        >
                          <div className="font-bold text-xs">Indisponível</div>
                          <div className="text-[10px]">{prof?.name?.split(' ')[0]}</div>
                          <div className="text-[10px] mt-auto truncate">
                            {b.reason || 'Bloqueio de Agenda'}
                          </div>
                        </div>
                      )
                    })}
                  {/* Render Apps */}
                  {apps.map((a: any) => {
                    const cli = clients?.find((c: any) => c.id === a.client_id)
                    const prof = professionals?.find((p: any) => p.id === a.professional_id)
                    const srvs =
                      services?.filter(
                        (s: any) => a.service_ids?.includes(s.id) || a.service_id === s.id,
                      ) || []

                    const isOverdue =
                      a.date < todayStr &&
                      !['finalizado', 'cancelado', 'provisional'].includes(a.status)
                    const isCanceled = a.status === 'cancelado'
                    const isProvisional = a.status === 'provisional'

                    let cardClass =
                      'border-l-amber-500 bg-amber-500/10 border-amber-500 hover:-translate-y-0.5'
                    if (isCanceled)
                      cardClass =
                        'border-l-destructive bg-destructive/10 opacity-70 line-through text-destructive'
                    else if (isProvisional)
                      cardClass =
                        'border-dashed border-2 border-primary/50 bg-primary/5 shadow-none'
                    else if (isOverdue)
                      cardClass = 'border-l-destructive bg-destructive/10 border-destructive'
                    else if (a.status === 'finalizado')
                      cardClass = 'border-l-green-500 bg-green-500/10 border-green-500'

                    return (
                      <div
                        key={a.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          openSheet(a)
                        }}
                        className={`flex flex-col border shadow-sm rounded-lg p-2 cursor-pointer transition-all hover:shadow-md border-l-4 ${cardClass} w-full min-h-[4.5rem]`}
                      >
                        <div className="flex items-start gap-1.5 mb-1 flex-1">
                          <ClientAvatar
                            client={cli}
                            className="w-6 h-6 border shadow-sm shrink-0"
                          />
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="font-bold text-[11px] leading-tight truncate">
                              {cli?.nome_preferido || cli?.name || 'Cliente'}
                            </span>
                            <div className="text-[9px] text-muted-foreground leading-snug line-clamp-1 mt-0.5">
                              {srvs.map((s: any) => s.name).join(', ') || 'Serviço'}
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-auto">
                          <Badge
                            variant="outline"
                            className={`w-fit text-[8px] px-1 py-0 h-3 uppercase bg-background/50 ${isProvisional ? 'text-primary' : ''}`}
                          >
                            {translateStatusBR(a.status)}
                          </Badge>
                          <span className="text-[9px] font-semibold text-primary/80 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" /> {a.start_time.slice(0, 5)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                  {!blocked && apps.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                      <span className="text-xs font-semibold text-muted-foreground bg-background/90 px-3 py-1.5 rounded-full shadow-sm border border-border">
                        <Plus className="inline w-3 h-3 mr-1" /> Agendar
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderMobileList = () => {
    const dayApps =
      appointments
        ?.filter((a: any) => a.date === date)
        .sort((a: any, b: any) => a.start_time.localeCompare(b.start_time)) || []
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {dayApps.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            Nenhum agendamento para este dia.
          </div>
        ) : (
          dayApps.map((a: any) => {
            const cli = clients?.find((c: any) => c.id === a.client_id)
            const srvs =
              services?.filter(
                (s: any) => a.service_ids?.includes(s.id) || a.service_id === s.id,
              ) || []
            return (
              <div
                key={a.id}
                onClick={() => openSheet(a)}
                className="flex items-center gap-4 p-4 border rounded-xl shadow-sm bg-card hover:border-primary/50"
              >
                <div className="flex flex-col items-center justify-center w-14 shrink-0 border-r pr-4">
                  <span className="font-bold text-lg">{a.start_time.slice(0, 5)}</span>
                  <Badge variant="outline" className="text-[9px] mt-1 uppercase">
                    {translateStatusBR(a.status)}
                  </Badge>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold truncate">{cli?.nome_preferido || cli?.name}</h4>
                  <p className="text-xs text-muted-foreground truncate">
                    {srvs.map((s: any) => s.name).join(', ')}
                  </p>
                </div>
                <ClientAvatar client={cli} className="w-10 h-10" />
              </div>
            )
          })
        )}
      </div>
    )
  }

  const renderMonthGrid = () => {
    const d = new Date(date + 'T12:00:00')
    const year = d.getFullYear()
    const month = d.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - startDate.getDay())

    const weeks = []
    let current = new Date(startDate)
    while (current <= lastDay || current.getDay() !== 0) {
      const week = []
      for (let i = 0; i < 7; i++) {
        week.push(new Date(current))
        current.setDate(current.getDate() + 1)
      }
      weeks.push(week)
    }

    return (
      <div className="flex flex-col h-full bg-muted/10">
        <div className="grid grid-cols-7 border-b bg-muted/30 shrink-0">
          {daysOfWeek.map((day) => (
            <div key={day} className="p-2 text-center text-sm font-semibold">
              {day.slice(0, 3)}
            </div>
          ))}
        </div>
        <div className="flex-1 flex flex-col min-h-0">
          {weeks.map((week, wIdx) => (
            <div
              key={wIdx}
              className="flex-1 grid grid-cols-7 border-b last:border-b-0 min-h-[100px]"
            >
              {week.map((day, dIdx) => {
                const dayStr = day.toISOString().split('T')[0]
                const isCurrentMonth = day.getMonth() === month
                const isToday = dayStr === todayStr
                const dayName = daysOfWeek[day.getDay()]
                const config = businessHours[dayName] || { open: true }
                const dayApps = appointments?.filter((a: any) => a.date === dayStr) || []

                return (
                  <div
                    key={dIdx}
                    className={`border-r last:border-r-0 p-1 md:p-2 cursor-pointer hover:bg-muted/30 transition-colors flex flex-col ${!isCurrentMonth || !config.open ? 'opacity-40 bg-muted/20' : 'bg-background'}`}
                    onClick={() => {
                      setDate(dayStr)
                      setView('day')
                    }}
                  >
                    <div className="flex justify-between items-center mb-1 md:mb-2">
                      <span
                        className={`text-xs md:text-sm font-semibold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-primary text-primary-foreground' : ''}`}
                      >
                        {day.getDate()}
                      </span>
                      {dayApps.length > 0 && (
                        <span className="text-[10px] font-bold text-muted-foreground">
                          {dayApps.length}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-1 pr-1">
                      {dayApps.slice(0, 4).map((a: any, i: number) => (
                        <div
                          key={i}
                          className="text-[9px] md:text-[10px] truncate px-1 py-0.5 rounded bg-primary/10 text-primary font-medium border border-primary/20"
                        >
                          {a.start_time.slice(0, 5)} -{' '}
                          {clients?.find((c: any) => c.id === a.client_id)?.name?.split(' ')[0]}
                        </div>
                      ))}
                      {dayApps.length > 4 && (
                        <div className="text-[9px] text-muted-foreground text-center font-bold">
                          +{dayApps.length - 4} mais
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const datesToRender = useMemo(() => {
    if (view === 'day') return [date]
    if (view === 'month') return []
    const curr = new Date(date + 'T12:00:00')
    const day = curr.getDay()
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1) // Start week on Monday
    const startOfWeek = new Date(curr.setDate(diff))

    const allDays = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(startOfWeek)
      d.setDate(d.getDate() + i)
      return d.toISOString().split('T')[0]
    })
    return allDays
  }, [date, view])

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-100px)] animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
          <p className="text-muted-foreground">Gerencie os atendimentos do salão.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto items-center">
          {view !== 'month' && !isMobile && (
            <div className="flex gap-1 bg-muted p-1 rounded-lg border mr-2">
              <Button
                variant="ghost"
                size="icon"
                className={cn('h-8 w-8', zoom === 'sm' && 'bg-background shadow-sm')}
                onClick={() => setZoom('sm')}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn('h-8 w-8', zoom === 'md' && 'bg-background shadow-sm')}
                onClick={() => setZoom('md')}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn('h-8 w-8', zoom === 'lg' && 'bg-background shadow-sm')}
                onClick={() => setZoom('lg')}
              >
                <ZoomIn className="w-5 h-5" />
              </Button>
            </div>
          )}
          <div className="flex bg-muted/50 p-1 rounded-lg border">
            <Button
              variant={view === 'day' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('day')}
              className="h-8"
            >
              <CalendarDays className="w-4 h-4 mr-2 hidden sm:inline" /> Dia
            </Button>
            <Button
              variant={view === 'fullWeek' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('fullWeek')}
              className="h-8"
            >
              <LayoutGrid className="w-4 h-4 mr-2 hidden sm:inline" /> Semana
            </Button>
            <Button
              variant={view === 'month' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('month')}
              className="h-8"
            >
              <CalendarRange className="w-4 h-4 mr-2 hidden sm:inline" /> Mês
            </Button>
          </div>
          <Button onClick={() => openSheet()} className="rounded-full shadow-md ml-auto sm:ml-0">
            <Plus className="w-4 h-4 sm:mr-2" />{' '}
            <span className="hidden sm:inline">Novo Agendamento</span>
          </Button>
        </div>
      </div>

      <Card className="flex flex-col flex-1 overflow-hidden shadow-sm border-border">
        <div className="flex items-center justify-between p-4 border-b shrink-0 bg-muted/10">
          <div className="flex items-center gap-4">
            <CalendarIcon className="w-5 h-5 text-primary" />
            {view === 'month' ? (
              <span className="font-bold text-lg capitalize">
                {new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', {
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            ) : (
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent font-medium outline-none border-none cursor-pointer text-lg"
              />
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => changeDate(view === 'fullWeek' ? -7 : -1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={() => setDate(getTodayStr())}>
              Hoje
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => changeDate(view === 'fullWeek' ? 7 : 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : view === 'month' ? (
          renderMonthGrid()
        ) : isMobile && view !== 'fullWeek' ? (
          renderMobileList()
        ) : (
          <div className="flex-1 overflow-auto bg-muted/5 relative">
            <div className="flex min-w-max w-full">
              {datesToRender.map((dStr) => renderDayColumn(dStr))}
            </div>
          </div>
        )}
      </Card>

      <NovoAgendamentoSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSuccess={refetch}
        appointment={editingApp}
        initialTime={selectedTimeForNew}
      />
    </div>
  )
}
