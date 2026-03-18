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
import { Badge } from '@/components/ui/badge'
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
import { Loader2, X, Clock } from 'lucide-react'

export function NovoAgendamentoSheet({ open, onOpenChange, onSuccess, appointment }: any) {
  const { company } = usePasskey()
  const { data: clients } = useQuery<any>('clients', { match: { is_active: true } })
  const { data: services } = useQuery<any>('services', { match: { is_active: true } })
  const { data: professionals } = useQuery<any>('profiles')
  const { data: appointments } = useQuery<any>('appointments')

  const [clientId, setClientId] = useState('')
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [profId, setProfId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('09:30')
  const [saving, setSaving] = useState(false)
  const [manualOverride, setManualOverride] = useState(false)

  const availableProfessionals = useMemo(() => {
    return professionals?.filter((p: any) => p.role !== 'root') || []
  }, [professionals])

  useEffect(() => {
    if (appointment && open) {
      setClientId(appointment.client_id)
      setSelectedServices(
        appointment.service_ids?.length
          ? appointment.service_ids
          : appointment.service_id
            ? [appointment.service_id]
            : [],
      )
      setProfId(appointment.professional_id)
      setDate(appointment.date)
      setStartTime(appointment.start_time.slice(0, 5))
      setEndTime(appointment.end_time.slice(0, 5))
      setManualOverride(true)
    } else if (open) {
      setClientId('')
      setSelectedServices([])
      setProfId('')
      setDate(new Date().toISOString().split('T')[0])
      setStartTime('09:00')
      setEndTime('09:30')
      setManualOverride(false)
    }
  }, [appointment, open])

  useEffect(() => {
    if (!manualOverride && profId && date && !appointment) {
      const profApps =
        appointments?.filter(
          (a: any) => a.professional_id === profId && a.date === date && a.status !== 'cancelado',
        ) || []
      if (profApps.length > 0) {
        const latest = profApps.reduce(
          (max: string, a: any) => (a.end_time > max ? a.end_time : max),
          '00:00',
        )
        const [h, m] = latest.split(':').map(Number)
        const totalM = h * 60 + m + 15
        setStartTime(
          `${String(Math.floor(totalM / 60)).padStart(2, '0')}:${String(totalM % 60).padStart(2, '0')}`,
        )
      }
    }
  }, [profId, date, appointments, appointment, manualOverride])

  const totalDuration = useMemo(() => {
    return selectedServices.reduce((acc, id) => {
      const s = services.find((x: any) => x.id === id)
      return acc + (s?.duration || 0)
    }, 0)
  }, [selectedServices, services])

  useEffect(() => {
    if (!manualOverride && selectedServices.length > 0 && startTime) {
      const [h, m] = startTime.split(':').map(Number)
      const totalM = h * 60 + m + totalDuration
      setEndTime(
        `${String(Math.floor(totalM / 60)).padStart(2, '0')}:${String(totalM % 60).padStart(2, '0')}`,
      )
    }
  }, [selectedServices, startTime, totalDuration, manualOverride])

  const handleServiceSelect = (id: string) => {
    if (!selectedServices.includes(id)) {
      setSelectedServices([...selectedServices, id])
      setManualOverride(false)
    }
  }

  const removeService = (id: string) => {
    setSelectedServices(selectedServices.filter((x) => x !== id))
    setManualOverride(false)
  }

  const checkConflicts = () => {
    if (!profId || !date || !startTime || !endTime) return false
    const existing = appointments.filter(
      (a: any) =>
        a.professional_id === profId &&
        a.date === date &&
        a.status !== 'cancelado' &&
        a.id !== appointment?.id,
    )

    for (const a of existing) {
      const s1 = startTime
      const e1 = endTime
      const s2 = a.start_time.slice(0, 5)
      const e2 = a.end_time.slice(0, 5)

      if ((s1 >= s2 && s1 < e2) || (e1 > s2 && e1 <= e2) || (s1 <= s2 && e1 >= e2)) {
        return true
      }
    }
    return false
  }

  const handleSave = async (forceSave = false) => {
    if (!forceSave && checkConflicts()) {
      toast('Conflito de Horário', {
        description: 'Já existe um agendamento nessa data/horário para este profissional.',
        action: {
          label: 'Confirmar mesmo assim',
          onClick: () => handleSave(true),
        },
        duration: 8000,
      })
      return
    }

    setSaving(true)
    const payload = {
      company_id: company?.id,
      client_id: clientId,
      service_id: selectedServices[0] || null,
      service_ids: selectedServices,
      professional_id: profId,
      date,
      start_time: startTime + ':00',
      end_time: endTime + ':00',
      duration_minutes: totalDuration,
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
    if (err) return toast.error('Erro ao salvar agendamento')

    toast.success(appointment ? 'Agendamento Atualizado' : 'Horário Reservado')
    supabase.functions.invoke('google-calendar-sync')

    if (onSuccess) onSuccess()
    onOpenChange(false)
  }

  const handleCancel = async () => {
    if (!appointment) return
    if (!confirm('Deseja cancelar este agendamento?')) return
    await supabase.from('appointments').update({ status: 'cancelado' }).eq('id', appointment.id)
    toast.success('Agendamento Cancelado')
    supabase.functions.invoke('google-calendar-sync')
    if (onSuccess) onSuccess()
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md overflow-y-auto max-h-screen">
        <SheetHeader className="mb-6">
          <SheetTitle>{appointment ? 'Editar Agendamento' : 'Novo Agendamento'}</SheetTitle>
          <SheetDescription>Reserve múltiplos serviços em um único horário.</SheetDescription>
        </SheetHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Cliente</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o cliente" />
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
            <Label>Profissional</Label>
            <Select value={profId} onValueChange={setProfId}>
              <SelectTrigger>
                <SelectValue placeholder="Quem vai atender?" />
              </SelectTrigger>
              <SelectContent>
                {availableProfessionals.map((p: any) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 p-3 bg-muted/30 rounded-xl border">
            <Label>Adicionar Serviço</Label>
            <Select value="" onValueChange={handleServiceSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione serviços..." />
              </SelectTrigger>
              <SelectContent>
                {services
                  .filter((s: any) => s.type === 'service')
                  .map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.duration}m)
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2 pt-2">
              {selectedServices.map((id) => {
                const s = services.find((x: any) => x.id === id)
                if (!s) return null
                return (
                  <Badge key={id} variant="secondary" className="flex items-center gap-1 py-1">
                    <span className="truncate max-w-[120px]">{s.name}</span>
                    <span className="text-[10px] opacity-70">({s.duration}m)</span>
                    <button
                      onClick={() => removeService(id)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value)
                  setManualOverride(true)
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Duração Total</Label>
              <div className="flex h-10 w-full items-center rounded-md border bg-muted px-3 text-sm font-medium">
                <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                {totalDuration} min
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Início</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value)
                  setManualOverride(true)
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Término</Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value)
                  setManualOverride(true)
                }}
              />
            </div>
          </div>
        </div>
        <SheetFooter className="mt-8 flex flex-col gap-2 sm:flex-col">
          <Button
            onClick={() => handleSave(false)}
            disabled={!clientId || selectedServices.length === 0 || !profId || saving}
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
