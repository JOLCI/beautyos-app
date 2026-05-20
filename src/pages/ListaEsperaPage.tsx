import { useState } from 'react'
import { useQuery } from '@/hooks/use-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase/client'
import { usePasskey } from '@/contexts/PasskeyContext'
import { toast } from 'sonner'
import { Loader2, Plus, Clock, Users, CalendarDays } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { ClientAvatar } from '@/components/clients/ClientAvatar'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { cn } from '@/lib/utils'

const DAYS_OF_WEEK = [
  { id: 'SEG', label: 'Seg' },
  { id: 'TER', label: 'Ter' },
  { id: 'QUA', label: 'Qua' },
  { id: 'QUI', label: 'Qui' },
  { id: 'SEX', label: 'Sex' },
  { id: 'SAB', label: 'Sáb' },
  { id: 'DOM', label: 'Dom' },
]

export default function ListaEsperaPage() {
  const { company } = usePasskey()
  const {
    data: waitlist,
    loading,
    refetch,
  } = useQuery<any>('waitlist', {
    match: { is_active: true, company_id: company?.id },
    order: { column: 'created_at', ascending: true },
  })
  const { data: clients } = useQuery<any>('clients', { match: { is_active: true } })
  const { data: services } = useQuery<any>('services', {
    match: { is_active: true, type: 'service' },
  })
  const { data: professionals } = useQuery<any>('profiles')

  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    client_id: '',
    service_id: '',
    professional_id: 'any',
    notes: '',
    start_time: '',
    end_time: '',
    preferred_days: [] as string[],
  })

  const toggleDay = (dayId: string) => {
    setForm((prev) => {
      if (prev.preferred_days.includes(dayId)) {
        return { ...prev, preferred_days: prev.preferred_days.filter((d) => d !== dayId) }
      }
      return { ...prev, preferred_days: [...prev.preferred_days, dayId] }
    })
  }

  const handleSave = async () => {
    if (!form.client_id || !form.service_id)
      return toast.error('Cliente e Serviço são obrigatórios')
    setSaving(true)
    const { error } = await supabase.from('waitlist').insert([
      {
        ...form,
        professional_id: form.professional_id === 'any' ? null : form.professional_id,
        company_id: company?.id,
      },
    ])
    setSaving(false)
    if (error) return toast.error(error.message)
    toast.success('Adicionado à lista de espera')
    setOpen(false)
    refetch()
    setForm({
      client_id: '',
      service_id: '',
      professional_id: 'any',
      notes: '',
      start_time: '',
      end_time: '',
      preferred_days: [],
    })
  }

  const handleConvert = async (item: any) => {
    toast.info('Navegue para Agenda para encaixar este cliente.')
  }

  const handleRemove = async (id: string) => {
    await supabase.from('waitlist').update({ is_active: false }).eq('id', id)
    toast.success('Removido da lista de espera')
    refetch()
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lista de Espera</h1>
          <p className="text-muted-foreground">Clientes aguardando disponibilidade (Encaixe).</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Adicionar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aguardando Encaixe</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : waitlist?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum cliente na lista de espera.
            </p>
          ) : (
            <div className="space-y-3">
              {waitlist?.map((w: any) => {
                const cli = clients?.find((c: any) => c.id === w.client_id)
                const svc = services?.find((s: any) => s.id === w.service_id)
                const prof = professionals?.find((p: any) => p.id === w.professional_id)
                const days = (w.preferred_days as string[]) || []

                return (
                  <div
                    key={w.id}
                    className="flex items-center justify-between p-4 border rounded-xl bg-card shadow-sm hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <ClientAvatar client={cli} className="w-12 h-12" />
                      <div>
                        <h4 className="font-bold">{cli?.nome_preferido || cli?.name}</h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Badge variant="secondary" className="text-[10px] uppercase font-normal">
                            {svc?.name}
                          </Badge>
                          {prof && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" /> {prof.name}
                            </span>
                          )}
                          {days.length > 0 && (
                            <span className="flex items-center gap-1 text-xs text-primary/80 bg-primary/10 px-1.5 rounded-sm">
                              <CalendarDays className="w-3 h-3" /> {days.join(', ')}
                            </span>
                          )}
                          {(w.start_time || w.end_time) && (
                            <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-1.5 rounded-sm border border-amber-100">
                              <Clock className="w-3 h-3" />{' '}
                              {w.start_time?.slice(0, 5) || 'Qualquer'} -{' '}
                              {w.end_time?.slice(0, 5) || 'Qualquer'}
                            </span>
                          )}
                        </div>
                        {w.notes && (
                          <p className="text-xs text-muted-foreground mt-2 italic">"{w.notes}"</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0 ml-4">
                      <Button size="sm" onClick={() => handleConvert(w)}>
                        Agendar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleRemove(w.id)}
                      >
                        Remover
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Adicionar à Lista de Espera</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cliente</label>
              <SearchableSelect
                value={form.client_id}
                onChange={(v) => setForm({ ...form, client_id: v })}
                options={
                  clients?.map((c: any) => ({ label: c.nome_preferido || c.name, value: c.id })) ||
                  []
                }
                placeholder="Selecione o cliente"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Serviço Desejado</label>
              <SearchableSelect
                value={form.service_id}
                onChange={(v) => setForm({ ...form, service_id: v })}
                options={services?.map((s: any) => ({ label: s.name, value: s.id })) || []}
                placeholder="Selecione o serviço"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Preferência de Profissional</label>
              <Select
                value={form.professional_id}
                onValueChange={(v) => setForm({ ...form, professional_id: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Qualquer Profissional</SelectItem>
                  {professionals
                    ?.filter((p: any) => p.is_attendant)
                    .map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3 p-4 border rounded-xl bg-muted/20">
              <label className="text-sm font-semibold flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-primary" /> Dias e Horários de Preferência
              </label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <div
                    key={day.id}
                    className={cn(
                      'flex items-center justify-center px-3 py-1.5 rounded-md cursor-pointer border text-xs font-semibold transition-colors',
                      form.preferred_days.includes(day.id)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background hover:bg-muted',
                    )}
                    onClick={() => toggleDay(day.id)}
                  >
                    {day.label}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">A partir das</label>
                  <Input
                    type="time"
                    value={form.start_time}
                    onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Até às</label>
                  <Input
                    type="time"
                    value={form.end_time}
                    onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Observações</label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Ex: Pode na hora do almoço..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button disabled={saving} onClick={handleSave} className="w-full">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Adicionar à Fila
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
