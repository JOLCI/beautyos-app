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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { mockClients, mockServices, mockProfessionals, mockAppointments } from '@/lib/mock'
import { AlertTriangle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
  initialTime?: string
  initialDate?: string
}

export function NovoAgendamentoSheet({ open, onOpenChange, initialTime, initialDate }: Props) {
  const [clientId, setClientId] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [profId, setProfId] = useState('')
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0])
  const [startTime, setStartTime] = useState(initialTime || '09:00')

  const endTime = useMemo(() => {
    if (!startTime || !serviceId) return ''
    const srv = mockServices.find((s) => s.id === serviceId)
    if (!srv) return ''
    const [h, m] = startTime.split(':').map(Number)
    const total = h * 60 + m + srv.duration
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
  }, [startTime, serviceId])

  const hasConflict = useMemo(() => {
    if (!profId || !date || !startTime || !endTime) return false
    return mockAppointments.some((a) => {
      if (a.professionalId !== profId || a.date !== date || a.status === 'cancelado') return false
      return (
        (startTime >= a.startTime && startTime < a.endTime) ||
        (endTime > a.startTime && endTime <= a.endTime)
      )
    })
  }, [profId, date, startTime, endTime])

  const handleSave = () => {
    toast({ title: 'Sucesso', description: 'Agendamento salvo com sucesso.' })
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Novo Agendamento</SheetTitle>
          <SheetDescription>Preencha os detalhes do serviço a ser agendado.</SheetDescription>
        </SheetHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Cliente</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {mockClients.map((c) => (
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
                {mockServices.map((s) => (
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
                {mockProfessionals.map((p) => (
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
            <Input type="time" value={endTime} readOnly disabled className="bg-muted" />
          </div>

          {hasConflict && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Atenção</AlertTitle>
              <AlertDescription>
                O profissional já possui um agendamento conflitante neste horário.
              </AlertDescription>
            </Alert>
          )}
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
