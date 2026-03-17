import { useState, useMemo } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useQuery } from '@/hooks/use-query'
import { supabase } from '@/lib/supabase/client'
import { usePasskey } from '@/contexts/PasskeyContext'
import { toast } from 'sonner'

export function NovoAgendamentoSheet({ open, onOpenChange, onSuccess }: any) {
  const { company } = usePasskey()
  const { data: clients } = useQuery<any>('clients', { match: { is_active: true } })
  const { data: services } = useQuery<any>('services', { match: { is_active: true } })
  const { data: professionals } = useQuery<any>('profiles')

  const [clientId, setClientId] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [profId, setProfId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [startTime, setStartTime] = useState('09:00')

  const endTime = useMemo(() => {
    if (!startTime || !serviceId) return ''
    const srv = services.find((s: any) => s.id === serviceId)
    if (!srv) return ''
    const [h, m] = startTime.split(':').map(Number)
    const total = h * 60 + m + srv.duration
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}:00`
  }, [startTime, serviceId, services])

  const handleSave = async () => {
    const { error } = await supabase.from('appointments').insert([
      {
        company_id: company?.id,
        client_id: clientId,
        service_id: serviceId,
        professional_id: profId,
        date,
        start_time: startTime + ':00',
        end_time: endTime,
        status: 'agendado',
      },
    ])

    if (error) {
      toast.error('Erro ao agendar')
    } else {
      toast.success('Agendamento confirmado')

      const client = clients.find((c: any) => c.id === clientId)
      if (client?.phone) {
        supabase.functions.invoke('send-whatsapp', {
          body: { template: 'confirmacao', to: client.phone },
        })
      }

      if (onSuccess) onSuccess()
      onOpenChange(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto max-h-screen">
        <SheetHeader className="mb-6">
          <SheetTitle>Novo Agendamento</SheetTitle>
          <SheetDescription>Reserve um horário na agenda.</SheetDescription>
        </SheetHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Cliente</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Serviço</Label>
            <Select value={serviceId} onValueChange={setServiceId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {services
                  .filter((s: any) => s.type === 'service')
                  .map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.duration}min)
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Profissional</Label>
            <Select value={profId} onValueChange={setProfId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {professionals.map((p: any) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Início</Label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Término Estimado</Label>
            <Input type="time" value={endTime.slice(0, 5)} readOnly disabled className="bg-muted" />
          </div>
        </div>
        <SheetFooter className="mt-8">
          <Button
            onClick={handleSave}
            className="w-full rounded-full"
            disabled={!clientId || !serviceId || !profId}
          >
            Confirmar Agendamento
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
