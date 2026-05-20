import { useState } from 'react'
import { useQuery } from '@/hooks/use-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'
import { usePasskey } from '@/contexts/PasskeyContext'
import { toast } from 'sonner'
import { Loader2, Plus, CalendarOff, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'

export default function AgendaBlockersPage() {
  const { company } = usePasskey()
  const {
    data: blockers,
    loading,
    refetch,
  } = useQuery<any>('agenda_blockers', { match: { company_id: company?.id, is_active: true } })
  const { data: professionals } = useQuery<any>('profiles', {
    match: { company_id: company?.id, is_active: true },
  })

  const attendants = professionals?.filter((p: any) => p.is_attendant) || []

  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    professional_id: '',
    type: 'single_date', // or interval
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    reason: '',
    days_of_week: [] as string[],
  })

  const WEEK_DAYS = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM']

  const handleSave = async () => {
    if (!form.professional_id) return toast.error('Selecione um profissional.')
    if (!form.start_date) return toast.error('Data de início é obrigatória.')

    setSaving(true)
    const { error } = await supabase.from('agenda_blockers').insert([
      {
        company_id: company?.id,
        professional_id: form.professional_id,
        type: form.type,
        start_date: form.start_date,
        end_date: form.type === 'interval' ? form.end_date : null,
        start_time: form.start_time || null,
        end_time: form.end_time || null,
        days_of_week: form.type === 'interval' ? form.days_of_week : null,
        reason: form.reason,
      },
    ])
    setSaving(false)

    if (error) return toast.error(error.message)
    toast.success('Bloqueio criado com sucesso.')
    setOpen(false)
    refetch()
    setForm({
      professional_id: '',
      type: 'single_date',
      start_date: '',
      end_date: '',
      start_time: '',
      end_time: '',
      reason: '',
      days_of_week: [],
    })
  }

  const handleRemove = async (id: string) => {
    if (!window.confirm('Remover este bloqueio?')) return
    await supabase.from('agenda_blockers').update({ is_active: false }).eq('id', id)
    toast.success('Bloqueio removido.')
    refetch()
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bloqueios de Agenda</h1>
          <p className="text-muted-foreground">Impeça agendamentos em horários específicos.</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Novo Bloqueio
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bloqueios Ativos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : blockers?.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhum bloqueio ativo.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {blockers?.map((b: any) => {
                const prof = attendants.find((p: any) => p.id === b.professional_id)
                return (
                  <div
                    key={b.id}
                    className="p-4 border rounded-xl bg-card shadow-sm flex flex-col gap-2 relative"
                  >
                    <div className="flex justify-between">
                      <span className="font-bold flex items-center gap-2">
                        <CalendarOff className="w-4 h-4 text-destructive" /> {prof?.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive absolute top-2 right-2"
                        onClick={() => handleRemove(b.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {b.type === 'single_date' ? (
                        <p>
                          Data: {new Date(b.start_date + 'T12:00:00').toLocaleDateString('pt-BR')}
                        </p>
                      ) : (
                        <p>
                          De {new Date(b.start_date + 'T12:00:00').toLocaleDateString('pt-BR')} até{' '}
                          {b.end_date
                            ? new Date(b.end_date + 'T12:00:00').toLocaleDateString('pt-BR')
                            : 'indeterminado'}
                        </p>
                      )}
                      {(b.start_time || b.end_time) && (
                        <p>
                          Horário: {b.start_time?.slice(0, 5) || 'Início'} às{' '}
                          {b.end_time?.slice(0, 5) || 'Fim'}
                        </p>
                      )}
                      {b.days_of_week && b.days_of_week.length > 0 && (
                        <p>Dias: {b.days_of_week.join(', ')}</p>
                      )}
                    </div>
                    {b.reason && (
                      <Badge variant="secondary" className="w-fit">
                        {b.reason}
                      </Badge>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Bloqueio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Profissional (Atendente)</label>
              <Select
                value={form.professional_id}
                onValueChange={(v) => setForm({ ...form, professional_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {attendants.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Bloqueio</label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single_date">Data Única</SelectItem>
                  <SelectItem value="interval">Período / Recorrente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Data Início</label>
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                />
              </div>
              {form.type === 'interval' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data Fim (Opcional)</label>
                  <Input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  />
                </div>
              )}
            </div>

            {form.type === 'interval' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Dias da Semana</label>
                <div className="flex flex-wrap gap-2">
                  {WEEK_DAYS.map((day) => (
                    <Button
                      key={day}
                      variant={form.days_of_week.includes(day) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setForm((f) => ({
                          ...f,
                          days_of_week: f.days_of_week.includes(day)
                            ? f.days_of_week.filter((d) => d !== day)
                            : [...f.days_of_week, day],
                        }))
                      }}
                    >
                      {day}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Hora Início (Opcional)</label>
                <Input
                  type="time"
                  value={form.start_time}
                  onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Hora Fim (Opcional)</label>
                <Input
                  type="time"
                  value={form.end_time}
                  onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Motivo (Opcional)</label>
              <Input
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="Férias, Médico..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button disabled={saving} onClick={handleSave} className="w-full">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Criar Bloqueio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
