import { useState, useMemo, useEffect } from 'react'
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
import { Loader2 } from 'lucide-react'

export function NovoAgendamentoSheet({ open, onOpenChange, onSuccess, appointment }: any) {
  const { company } = usePasskey()
  const { data: clients } = useQuery<any>('clients', { match: { is_active: true } })
  const { data: services } = useQuery<any>('services', { match: { is_active: true } })
  const { data: professionals } = useQuery<any>('profiles')

  const [clientId, setClientId] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [profId, setProfId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [startTime, setStartTime] = useState('09:00')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (appointment) {
      setClientId(appointment.client_id)
      setServiceId(appointment.service_id)
      setProfId(appointment.professional_id)
      setDate(appointment.date)
      setStartTime(appointment.start_time.slice(0, 5))
    } else {
      setClientId('')
      setServiceId('')
      setProfId('')
      setDate(new Date().toISOString().split('T')[0])
      setStartTime('09:00')
    }
  }, [appointment, open])

  const endTime = useMemo(() => {
    if (!startTime || !serviceId) return ''
    const srv = services.find((s: any) => s.id === serviceId)
    if (!srv) return ''
    const [h, m] = startTime.split(':').map(Number)
    const total = h * 60 + m + srv.duration
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}:00`
  }, [startTime, serviceId, services])

  const handleSave = async () => {
    setSaving(true)
    const payload = {
      company_id: company?.id,
      client_id: clientId,
      service_id: serviceId,
      professional_id: profId,
      date,
      start_time: startTime + ':00',
      end_time: endTime,
    }

    let err = null
    if (appointment) {
      const { error } = await supabase.from('appointments').update(payload).eq('id', appointment.id)
      err = error
    } else {
      const { error } = await supabase
        .from('appointments')
        .insert([{ ...payload, status: 'agendado' }])
      err = error
    }

    setSaving(false)
    if (err) return toast.error('Erro ao salvar')

    toast.success(appointment ? 'Atualizado' : 'Agendado')
    supabase.functions.invoke('google-calendar-sync') // async trigger

    if (onSuccess) onSuccess()
    onOpenChange(false)
  }

  const handleCancel = async () => {
    if (!appointment) return
    if (!confirm('Cancelar este agendamento?')) return
    await supabase.from('appointments').update({ status: 'cancelado' }).eq('id', appointment.id)
    toast.success('Cancelado')
    supabase.functions.invoke('google-calendar-sync')
    if (onSuccess) onSuccess()
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md overflow-y-auto max-h-screen">
        <SheetHeader className="mb-6">
          <SheetTitle>{appointment ? 'Editar Agendamento' : 'Novo Agendamento'}</SheetTitle>
          <SheetDescription>Reserve ou edite um horário na agenda.</SheetDescription>
        </SheetHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Cliente</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger>
                <SelectValue />
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
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {services
                  .filter((s: any) => s.type === 'service')
                  .map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Profissional</Label>
            <Select value={profId} onValueChange={setProfId}>
              <SelectTrigger>
                <SelectValue />
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
            <Input type="time" value={endTime.slice(0, 5)} disabled className="bg-muted" />
          </div>
        </div>
        <SheetFooter className="mt-8 flex flex-col gap-2 sm:flex-col">
          <Button
            onClick={handleSave}
            disabled={!clientId || !serviceId || !profId || saving}
            className="w-full"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Salvar
          </Button>
          {appointment && appointment.status !== 'cancelado' && (
            <Button variant="destructive" onClick={handleCancel} className="w-full">
              Cancelar Agendamento
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
