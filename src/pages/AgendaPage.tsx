import { useState } from 'react'
import { useQuery } from '@/hooks/use-query'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarIcon, Plus, XCircle, Loader2 } from 'lucide-react'
import { NovoAgendamentoSheet } from '@/components/agenda/NovoAgendamentoSheet'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function AgendaPage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [sheetOpen, setSheetOpen] = useState(false)
  const {
    data: appointments,
    loading,
    refetch,
  } = useQuery<any>('appointments', { match: { date } })
  const { data: clients } = useQuery<any>('clients')
  const { data: services } = useQuery<any>('services')

  const handleCancel = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    await supabase.from('appointments').update({ status: 'cancelado' }).eq('id', id)
    toast.success('Agendamento Cancelado')
    supabase.functions.invoke('send-whatsapp', { body: { template: 'cancelamento' } })
    refetch()
  }

  const hours = Array.from({ length: 12 }, (_, i) => i + 8)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
          <p className="text-muted-foreground">Gerencie os compromissos diários.</p>
        </div>
        <Button onClick={() => setSheetOpen(true)} className="rounded-full shadow-md">
          <Plus className="w-4 h-4 mr-2" /> Novo
        </Button>
      </div>

      <Card className="p-4 shadow-sm border-border">
        <div className="flex items-center gap-4 mb-6 border-b pb-4">
          <CalendarIcon className="w-5 h-5 text-primary" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-transparent font-medium outline-none border-none cursor-pointer"
          />
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-1">
            {hours.map((h) => {
              const timeStr = `${String(h).padStart(2, '0')}:00:00`
              const apps = appointments.filter(
                (a: any) =>
                  a.start_time.startsWith(String(h).padStart(2, '0')) && a.status !== 'cancelado',
              )

              return (
                <div
                  key={h}
                  className="flex border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors min-h-[4rem]"
                >
                  <div className="w-20 py-3 px-2 text-sm text-muted-foreground font-medium">
                    {String(h).padStart(2, '0')}:00
                  </div>
                  <div className="flex-1 p-2 flex flex-col gap-2">
                    {apps.length === 0 ? (
                      <div
                        className="flex items-center text-xs text-muted-foreground/30 px-2 cursor-pointer h-full"
                        onClick={() => setSheetOpen(true)}
                      >
                        Livre
                      </div>
                    ) : (
                      apps.map((a: any) => {
                        const cli = clients.find((c: any) => c.id === a.client_id)
                        const srv = services.find((s: any) => s.id === a.service_id)
                        return (
                          <div
                            key={a.id}
                            className="bg-card border shadow-sm rounded-lg p-3 relative group"
                          >
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-lg"></div>
                            <div className="pl-2 flex justify-between items-start">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-sm">{cli?.name}</span>
                                  <Badge variant="outline" className="text-[10px] uppercase">
                                    {a.status}
                                  </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {srv?.name} • {a.start_time.slice(0, 5)} -{' '}
                                  {a.end_time.slice(0, 5)}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Cancelar Agendamento"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive"
                                onClick={(e) => handleCancel(e, a.id)}
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
        )}
      </Card>
      <NovoAgendamentoSheet open={sheetOpen} onOpenChange={setSheetOpen} onSuccess={refetch} />
    </div>
  )
}
