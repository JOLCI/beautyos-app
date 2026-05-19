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
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
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
import { Loader2, X, Clock, AlertCircle } from 'lucide-react'
import { resolveAndScheduleWhatsApp } from '@/lib/whatsapp'

export function NovoAgendamentoSheet({
  open,
  onOpenChange,
  onSuccess,
  appointment,
  initialTime,
}: any) {
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
  const [endTime, setEndTime] = useState('')
  const [saving, setSaving] = useState(false)
  const [manualOverride, setManualOverride] = useState(false)

  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [canceledByClient, setCanceledByClient] = useState(false)

  const availableProfessionals = useMemo(() => {
    return professionals?.filter((p: any) => p.role !== 'root' && p.is_attendant) || []
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
      setShowCancelConfirm(false)
      setCancelReason('')
      setCanceledByClient(false)
    } else if (open) {
      setClientId('')
      setSelectedServices([])
      setProfId('')
      setDate(initialTime?.date || new Date().toISOString().split('T')[0])
      setStartTime(initialTime?.time || '09:00')
      setEndTime('')
      setManualOverride(!!initialTime)
      setShowCancelConfirm(false)
      setCancelReason('')
      setCanceledByClient(false)
    }
  }, [appointment, open, initialTime])

  const totalDuration = useMemo(() => {
    return selectedServices.reduce((acc, id) => {
      const s = services?.find((x: any) => x.id === id)
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
    if (!selectedServices.includes(id) && id) {
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
    const existing =
      appointments?.filter(
        (a: any) =>
          a.professional_id === profId &&
          a.date === date &&
          a.status !== 'cancelado' &&
          a.id !== appointment?.id,
      ) || []

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

  // Função responsável por salvar ou atualizar o agendamento
  const handleSave = async (forceSave = false, overrideStatus?: string) => {
    if (!endTime) return toast.error('A hora de término é obrigatória.')
    if (endTime <= startTime)
      return toast.error('A hora de término deve ser posterior à hora de início.')

    // Validação de conflito de horários com alerta bloqueante
    if (!forceSave && checkConflicts()) {
      const confirmacao = window.confirm(
        '🚨 CONFLITO DE HORÁRIO 🚨\n\nJá existe um agendamento neste dia e horário para o atendente selecionado.\n\nDeseja salvar mesmo assim e sobrepor o horário?',
      )
      if (confirmacao) {
        return handleSave(true, overrideStatus)
      } else {
        return
      }
    }

    setSaving(true)
    const targetStatus = overrideStatus || appointment?.status || 'agendado'

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
      status: targetStatus,
    }

    let err = null
    if (appointment) {
      const { error } = await supabase.from('appointments').update(payload).eq('id', appointment.id)
      err = error
    } else {
      const { error } = await supabase.from('appointments').insert([payload])
      err = error
    }

    if (err) {
      setSaving(false)
      return toast.error('Erro ao salvar agendamento')
    }

    if (company?.id && clientId && clients) {
      const client = clients.find((c: any) => c.id === clientId)
      if (client?.phone) {
        const startDt = new Date(`${date}T${startTime}:00`)
        const reminder24h = new Date(startDt.getTime() - 24 * 60 * 60 * 1000).toISOString()
        const reminder1h = new Date(startDt.getTime() - 60 * 60 * 1000).toISOString()

        const parts = date.split('-')
        const dtString = `${parts[2]}/${parts[1]}/${parts[0]}`

        const contextData = {
          clientName: client.name,
          date: dtString,
          dateTime: `${dtString} às ${startTime}`,
          services: selectedServices
            .map((id) => services?.find((s: any) => s.id === id)?.name)
            .join(', '),
        }

        if (targetStatus === 'agendado' && (!appointment || appointment.status === 'provisional')) {
          resolveAndScheduleWhatsApp(
            company.id,
            clientId,
            client.phone,
            'lembrete_24h',
            reminder24h,
            contextData,
          )
          resolveAndScheduleWhatsApp(
            company.id,
            clientId,
            client.phone,
            'lembrete_1h',
            reminder1h,
            contextData,
          )
        } else if (targetStatus === 'provisional' && !appointment) {
          const reminder7d = new Date(`${date}T08:00:00`)
          reminder7d.setDate(reminder7d.getDate() - 7)
          resolveAndScheduleWhatsApp(
            company.id,
            clientId,
            client.phone,
            'recorrencia',
            reminder7d.toISOString(),
            contextData,
          )
        }
      }
    }

    setSaving(false)
    toast.success(appointment ? 'Agendamento Atualizado' : 'Horário Reservado')
    supabase.functions.invoke('google-calendar-sync')

    if (onSuccess) onSuccess()
    onOpenChange(false)
  }

  const handleConfirmCancel = async () => {
    if (!appointment) return
    setSaving(true)
    await supabase
      .from('appointments')
      .update({
        status: 'cancelado',
        cancellation_reason: cancelReason,
        canceled_by_client: canceledByClient,
      })
      .eq('id', appointment.id)
    setSaving(false)
    toast.success('Agendamento Cancelado')
    supabase.functions.invoke('google-calendar-sync')
    if (onSuccess) onSuccess()
    onOpenChange(false)
  }

  const isNewClient = useMemo(() => {
    if (!clientId || !appointments) return false
    const past = appointments.filter(
      (a: any) => a.client_id === clientId && a.status === 'finalizado' && a.id !== appointment?.id,
    )
    return past.length === 0
  }, [clientId, appointments, appointment])

  const newServices = useMemo(() => {
    if (!clientId || !appointments || selectedServices.length === 0) return []
    const past = appointments.filter(
      (a: any) => a.client_id === clientId && a.status === 'finalizado' && a.id !== appointment?.id,
    )
    const pastServiceIds = new Set(
      past.flatMap((a: any) =>
        a.service_ids?.length ? a.service_ids : a.service_id ? [a.service_id] : [],
      ),
    )

    return selectedServices
      .filter((id: string) => !pastServiceIds.has(id))
      .map((id: string) => services?.find((s: any) => s.id === id)?.name)
      .filter(Boolean)
  }, [clientId, selectedServices, appointments, services, appointment])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md overflow-y-auto max-h-screen">
        <SheetHeader className="mb-6">
          <SheetTitle>{appointment ? 'Editar Agendamento' : 'Novo Agendamento'}</SheetTitle>
          <SheetDescription>Reserve múltiplos serviços em um único horário.</SheetDescription>
        </SheetHeader>

        <div className={`space-y-4 ${showCancelConfirm ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="space-y-2">
            <Label>Cliente</Label>
            <Select value={clientId || undefined} onValueChange={setClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients?.map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isNewClient && clientId && (
              <Badge
                variant="default"
                className="bg-amber-500 hover:bg-amber-600 mt-1 animate-in fade-in"
              >
                ✨ Cliente Primeira Vez
              </Badge>
            )}
            {!isNewClient && newServices.length > 0 && (
              <Badge
                variant="secondary"
                className="mt-1 animate-in fade-in border-purple-200 bg-purple-50 text-purple-700"
              >
                ✨ Primeiro agendamento para: {newServices.join(', ')}
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <Label>Profissional (Atendente)</Label>
            <Select value={profId || undefined} onValueChange={setProfId}>
              <SelectTrigger>
                <SelectValue placeholder="Quem vai atender?" />
              </SelectTrigger>
              <SelectContent>
                {availableProfessionals.map((p: any) => (
                  <SelectItem key={p.id} value={p.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-5 h-5 border">
                        <AvatarImage src={p.avatar_url} />
                        <AvatarFallback className="text-[10px]">{p.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {p.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 p-3 bg-muted/30 rounded-xl border">
            <Label>Adicionar Serviço</Label>
            <Select onValueChange={handleServiceSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione serviços..." />
              </SelectTrigger>
              <SelectContent>
                {services
                  ?.filter((s: any) => s.type === 'service')
                  .map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.duration}m)
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2 pt-2">
              {selectedServices.map((id) => {
                const s = services?.find((x: any) => x.id === id)
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
              <Label>Hora Início</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value)
                  setManualOverride(false)
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Hora Fim</Label>
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

        {appointment?.status === 'cancelado' && (
          <div className="mt-6 p-4 border border-destructive/30 bg-destructive/10 rounded-xl space-y-2">
            <h4 className="font-bold text-destructive flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> Agendamento Cancelado
            </h4>
            <p className="text-sm">
              <strong>Cancelado pelo cliente:</strong>{' '}
              {appointment.canceled_by_client ? 'Sim' : 'Não'}
            </p>
            <p className="text-sm">
              <strong>Motivo:</strong> {appointment.cancellation_reason || 'Não informado'}
            </p>
          </div>
        )}

        {showCancelConfirm && (
          <div className="mt-6 p-4 border border-destructive/30 bg-destructive/5 rounded-xl space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-2 text-destructive font-bold">
              <AlertCircle className="w-5 h-5" /> Confirmar Cancelamento
            </div>
            <div className="space-y-2">
              <Label>Motivo (opcional)</Label>
              <Input
                placeholder="Ex: Imprevisto pessoal..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between border p-3 rounded-lg bg-background">
              <Label className="cursor-pointer" htmlFor="canceledByClient">
                Cancelado pelo cliente?
              </Label>
              <Switch
                id="canceledByClient"
                checked={canceledByClient}
                onCheckedChange={setCanceledByClient}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1"
                disabled={saving}
              >
                Voltar
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmCancel}
                className="flex-1"
                disabled={saving}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Confirmar
              </Button>
            </div>
          </div>
        )}

        {!showCancelConfirm && (
          <SheetFooter className="mt-8 flex flex-col gap-2 sm:flex-col">
            {appointment?.status === 'provisional' ? (
              <Button
                onClick={() => handleSave(false, 'agendado')}
                disabled={
                  !clientId || selectedServices.length === 0 || !profId || !endTime || saving
                }
                className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md text-lg h-12"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Confirmar
                Agendamento
              </Button>
            ) : (
              <Button
                onClick={() => handleSave(false)}
                disabled={
                  !clientId || selectedServices.length === 0 || !profId || !endTime || saving
                }
                className="w-full"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Salvar
              </Button>
            )}

            {appointment &&
              appointment.status !== 'cancelado' &&
              appointment.status !== 'finalizado' && (
                <Button
                  variant="destructive"
                  onClick={() => setShowCancelConfirm(true)}
                  className="w-full"
                >
                  Cancelar Agendamento
                </Button>
              )}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
