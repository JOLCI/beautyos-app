import { useState } from 'react'
import { mockAppointments, mockClients, mockServices } from '@/lib/mock'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar as CalendarIcon, Plus, XCircle } from 'lucide-react'
import { NovoAgendamentoSheet } from '@/components/agenda/NovoAgendamentoSheet'
import { toast } from 'sonner'

export default function AgendaPage() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedTime, setSelectedTime] = useState('')

  const hours = Array.from({ length: 11 }, (_, i) => i + 8)

  const handleCancel = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    toast.success('Agendamento Cancelado')
    // Simulate WhatsApp trigger asynchronously
    setTimeout(() => {
      toast.info('Mensagem de cancelamento enviada via WhatsApp.')
    }, 1000)
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
                  className="w-full sm:w-20 py-3 px-2 text-sm text-muted-foreground font-medium cursor-pointer"
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
                          className="flex-1 bg-card border shadow-sm rounded-lg p-3 relative overflow-hidden group"
                        >
                          <div className={`absolute left-0 top-0 bottom-0 w-1 bg-primary`}></div>
                          <div className="pl-2 flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-sm">{cli?.name}</span>
                                <Badge variant="outline" className="text-[10px] uppercase">
                                  {a.status}
                                </Badge>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {srv?.name} • {a.startTime} - {a.endTime}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive"
                              onClick={(e) => handleCancel(e, a.id)}
                              aria-label="Cancelar agendamento"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
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
