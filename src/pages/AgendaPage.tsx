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
} from 'lucide-react'
import { NovoAgendamentoSheet } from '@/components/agenda/NovoAgendamentoSheet'
import { translateStatus } from '@/lib/utils'
import { usePasskey } from '@/contexts/PasskeyContext'

export default function AgendaPage() {
  const navigate = useNavigate()
  const { passkey } = useParams()
  const { company } = usePasskey()
  const searchParams = new URLSearchParams(window.location.search)
  const initialDate = searchParams.get('date') || new Date().toISOString().split('T')[0]

  const [date, setDate] = useState(initialDate)
  const [view, setView] = useState<'day' | 'week' | 'month'>('week')
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
    return businessHours[dayName] || { open: true, start: '08:00', end: '19:00' }
  }

  const renderDayColumn = (currentDateStr: string) => {
    const config = getDayConfig(currentDateStr)
    const dayApps = appointments?.filter((a: any) => a.date === currentDateStr) || []

    if (!config.open) {
      return (
        <div
          key={currentDateStr}
          className="flex-1 min-w-[250px] p-4 text-center text-muted-foreground bg-muted/20 border-r last:border-r-0"
        >
          <div className="font-medium mb-4">
            {new Date(currentDateStr + 'T12:00:00').toLocaleDateString('pt-BR', {
              weekday: 'short',
              day: '2-digit',
              month: '2-digit',
            })}
          </div>
          Fechado
        </div>
      )
    }

    const startH = parseInt(config.start.split(':')[0])
    const endH = parseInt(config.end.split(':')[0])
    const hours = Array.from({ length: endH - startH + 1 }, (_, i) => i + startH)

    return (
      <div key={currentDateStr} className="flex-1 min-w-[250px] border-r last:border-r-0">
        <div className="p-3 text-center border-b font-medium bg-muted/30 sticky top-0 z-10 backdrop-blur-sm">
          {new Date(currentDateStr + 'T12:00:00').toLocaleDateString('pt-BR', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit',
          })}
        </div>
        <div className="relative">
          {hours.map((h) => {
            const timeStr = `${String(h).padStart(2, '0')}:00`
            const apps = dayApps.filter((a: any) =>
              a.start_time.startsWith(String(h).padStart(2, '0')),
            )

            return (
              <div key={h} className="flex border-b border-border/50 min-h-[5.5rem] group">
                <div className="w-14 py-2 px-1 text-[10px] text-muted-foreground font-medium text-center border-r border-border/50 bg-muted/10">
                  {timeStr}
                </div>
                <div
                  className="flex-1 p-1.5 flex flex-col gap-1.5 relative bg-background hover:bg-muted/10 cursor-pointer transition-colors"
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      openSheet(null, { date: currentDateStr, time: timeStr })
                    }
                  }}
                >
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

                    let cardClass = 'border-l-primary bg-card hover:-translate-y-0.5'
                    if (isCanceled)
                      cardClass =
                        'border-l-muted bg-muted/40 opacity-70 line-through text-muted-foreground'
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
                        className={`flex-1 flex flex-col border shadow-sm rounded-lg p-2.5 cursor-pointer transition-all hover:shadow-md border-l-4 ${cardClass} w-full`}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <Avatar className="w-6 h-6 border shadow-sm">
                            <AvatarImage
                              src={
                                cli?.avatar_url ||
                                `https://img.usecurling.com/ppl/thumbnail?seed=${cli?.id || 'a'}`
                              }
                            />
                            <AvatarFallback className="text-[10px]">
                              {cli?.name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-bold text-xs truncate flex-1 leading-tight">
                            {cli?.name || 'Cliente'}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-[9px] px-1.5 py-0 h-4 uppercase ${isProvisional ? 'text-primary' : ''}`}
                          >
                            {translateStatus(a.status)}
                          </Badge>
                        </div>
                        <div className="text-[11px] text-muted-foreground leading-tight line-clamp-1 mb-1.5">
                          {srvs.map((s: any) => s.name).join(', ') || 'Serviço'}
                        </div>
                        <div className="text-[10px] font-semibold flex justify-between items-center text-primary/80 mt-auto bg-muted/30 p-1 rounded">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {a.start_time.slice(0, 5)} -{' '}
                            {a.end_time.slice(0, 5)}
                          </span>
                          <span className="truncate max-w-[80px] text-right font-medium">
                            {prof?.name?.split(' ')[0]}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                  {apps.length === 0 && (
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
                const dayApps = appointments?.filter((a: any) => a.date === dayStr) || []

                return (
                  <div
                    key={dIdx}
                    className={`border-r last:border-r-0 p-1 md:p-2 cursor-pointer hover:bg-muted/30 transition-colors flex flex-col ${!isCurrentMonth ? 'opacity-40 bg-muted/20' : 'bg-background'}`}
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
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1)
    const startOfWeek = new Date(curr.setDate(diff))

    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(startOfWeek)
      d.setDate(d.getDate() + i)
      return d.toISOString().split('T')[0]
    })
  }, [date, view])

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-100px)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
          <p className="text-muted-foreground">Gerencie os atendimentos do salão.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
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
              variant={view === 'week' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('week')}
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
              onClick={() => changeDate(view === 'week' ? -7 : -1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={() => setDate(getTodayStr())}>
              Hoje
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => changeDate(view === 'week' ? 7 : 1)}
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
        ) : (
          <div className="flex-1 overflow-auto bg-muted/5">
            <div className="flex min-w-max">
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
