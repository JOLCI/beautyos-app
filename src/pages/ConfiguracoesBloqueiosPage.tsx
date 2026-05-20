import { useState } from 'react'
import { useQuery } from '@/hooks/use-query'
import { usePasskey } from '@/contexts/PasskeyContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, Plus, Trash2, CalendarOff } from 'lucide-react'

export default function ConfiguracoesBloqueiosPage() {
  const { company } = usePasskey()
  const {
    data: bloqueios,
    loading,
    refetch,
  } = useQuery<any>('agenda_blockers', { match: { company_id: company?.id } })
  const { data: professionals } = useQuery<any>('profiles', { match: { is_attendant: true } })
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    professional_id: '',
    start_date: '',
    end_date: '',
    start_time: '00:00',
    end_time: '23:59',
    reason: '',
    type: 'single_date',
  })

  const handleSave = async () => {
    if (!form.professional_id || !form.start_date)
      return toast.error('Profissional e data são obrigatórios')
    setSaving(true)
    const { error } = await supabase.from('agenda_blockers').insert([
      {
        ...form,
        company_id: company?.id,
        is_active: true,
      },
    ])
    setSaving(false)
    if (error) return toast.error(error.message)
    toast.success('Bloqueio registrado')
    setOpen(false)
    refetch()
  }

  const handleDelete = async (id: string) => {
    await supabase.from('agenda_blockers').delete().eq('id', id)
    refetch()
    toast.success('Bloqueio removido')
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bloqueios de Agenda</h1>
          <p className="text-muted-foreground">Gerencie indisponibilidades dos profissionais.</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Novo Bloqueio
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <div className="divide-y">
              {bloqueios?.map((b: any) => {
                const prof = professionals?.find((p: any) => p.id === b.professional_id)
                return (
                  <div
                    key={b.id}
                    className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <CalendarOff className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{prof?.name || 'Profissional'}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(b.start_date + 'T12:00:00').toLocaleDateString('pt-BR')}
                          {b.end_date && b.end_date !== b.start_date
                            ? ` a ${new Date(b.end_date + 'T12:00:00').toLocaleDateString('pt-BR')}`
                            : ''}
                          {' • '}
                          {b.start_time.slice(0, 5)} às {b.end_time.slice(0, 5)}
                        </p>
                        {b.reason && (
                          <p className="text-xs text-amber-600 mt-1 font-medium bg-amber-50 inline-block px-1.5 rounded">
                            {b.reason}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleDelete(b.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )
              })}
              {bloqueios?.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">Nenhum bloqueio ativo.</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Indisponibilidade</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Atendente</Label>
              <Select
                value={form.professional_id}
                onValueChange={(v) => setForm({ ...form, professional_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {professionals?.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data de Início</Label>
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Data de Fim (Opcional)</Label>
                <Input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Horário Inicial</Label>
                <Input
                  type="time"
                  value={form.start_time}
                  onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Horário Final</Label>
                <Input
                  type="time"
                  value={form.end_time}
                  onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Motivo</Label>
              <Input
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="Ex: Férias, Médico..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button disabled={saving} onClick={handleSave} className="w-full">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Salvar Bloqueio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
