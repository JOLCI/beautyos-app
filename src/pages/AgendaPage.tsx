import { useState } from 'react'
import { mockAppointments, mockClients, mockProfessionals, mockServices } from '@/lib/mock'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar as CalendarIcon, Plus } from 'lucide-react'
import { NovoAgendamentoSheet } from '@/components/agenda/NovoAgendamentoSheet'

export default function AgendaPage() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedTime, setSelectedTime] = useState('')

  const hours = Array.from({ length: 11 }, (_, i) => i + 8) // 8 to 18

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado':
      case 'finalizado':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'em_atendimento':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
      case 'cancelado':
      case 'faltou':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    }
  }

  const openSheet = (time: string) => {
    setSelectedTime(time)
    setSheetOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
          <p className="text-muted-foreground">Gerencie os compromissos do salão.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Tabs defaultValue="dia" className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="dia">Dia</TabsTrigger>
              <TabsTrigger value="semana">Semana</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={() => openSheet('09:00')} className="rounded-full shadow-md">
            <Plus className="w-4 h-4 mr-2" /> Novo
          </Button>
        </div>
      </div>

      <Card className="p-4 overflow-hidden border-border shadow-sm">
        <div className="flex items-center mb-6 gap-2 font-medium border-b border-border pb-4">
          <CalendarIcon className="w-5 h-5 text-primary" />
          <span>Hoje, {new Date().toLocaleDateString('pt-BR')}</span>
        </div>
        <div className="space-y-1">
          {hours.map((h) => {
            const timeStr = `${String(h).padStart(2, '0')}:00`
            const apps = mockAppointments.filter((a) =>
              a.startTime.startsWith(String(h).padStart(2, '0')),
            )

            return (
              <div
                key={h}
                className="flex flex-col sm:flex-row border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
              >
                <div
                  className="w-full sm:w-20 py-3 px-2 text-sm text-muted-foreground font-medium cursor-pointer hover:text-primary transition-colors"
                  onClick={() => openSheet(timeStr)}
                >
                  {timeStr}
                </div>
                <div className="flex-1 p-2 flex flex-col sm:flex-row gap-2 min-h-[4rem]">
                  {apps.length === 0 ? (
                    <div
                      className="hidden sm:flex items-center text-xs text-muted-foreground/30 px-2 cursor-pointer w-full h-full"
                      onClick={() => openSheet(timeStr)}
                    >
                      Livre
                    </div>
                  ) : (
                    apps.map((a) => {
                      const cli = mockClients.find((c) => c.id === a.clientId)
                      const srv = mockServices.find((s) => s.id === a.serviceId)
                      return (
                        <div
                          key={a.id}
                          className="flex-1 bg-card border border-border shadow-sm rounded-lg p-3 hover:shadow-md transition-all cursor-pointer relative overflow-hidden group"
                        >
                          <div
                            className={`absolute left-0 top-0 bottom-0 w-1 ${getStatusColor(a.status)}`}
                          ></div>
                          <div className="pl-2">
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-semibold text-sm">{cli?.name}</span>
                              <Badge
                                variant="outline"
                                className={`text-[10px] border-0 ${getStatusColor(a.status)}`}
                              >
                                {a.status}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground flex justify-between">
                              <span>{srv?.name}</span>
                              <span>
                                {a.startTime} - {a.endTime}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Card>
      <NovoAgendamentoSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        initialTime={selectedTime}
      />
    </div>
  )
}
