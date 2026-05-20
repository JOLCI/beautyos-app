import { useState } from 'react'
import { useQuery } from '@/hooks/use-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase/client'
import { usePasskey } from '@/contexts/PasskeyContext'
import { toast } from 'sonner'
import { Loader2, Plus, Clock, Users } from 'lucide-react'
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
  })

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

                return (
                  <div
                    key={w.id}
                    className="flex items-center justify-between p-4 border rounded-xl bg-card shadow-sm hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <ClientAvatar client={cli} className="w-12 h-12" />
                      <div>
                        <h4 className="font-bold">{cli?.nome_preferido || cli?.name}</h4>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Badge variant="secondary" className="text-[10px] uppercase font-normal">
                            {svc?.name}
                          </Badge>
                          {prof && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" /> {prof.name}
                            </span>
                          )}
                          {(w.start_time || w.end_time) && (
                            <span className="flex items-center gap-1 text-xs">
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
                    <div className="flex flex-col gap-2">
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
        <DialogContent>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Horário a partir de</label>
                <Input
                  type="time"
                  value={form.start_time}
                  onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Até horário</label>
                <Input
                  type="time"
                  value={form.end_time}
                  onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Observações</label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Ex: Só pode nas terças de manhã..."
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
