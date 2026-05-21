import { useState, useEffect } from 'react'
import { useQuery } from '@/hooks/use-query'
import { useAuth } from '@/hooks/use-auth'
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
import { Loader2, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

export default function TarefasPage() {
  const { profile } = useAuth()
  const { company } = usePasskey()
  const {
    data: tasks,
    loading,
    refetch,
  } = useQuery<any>('tasks', { match: { is_active: true, company_id: company?.id } })

  // Apenas atendentes
  const { data: professionals } = useQuery<any>('profiles', {
    match: { is_attendant: true, is_active: true },
  })

  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<any>(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    assigned_to: '',
    priority: 'medium',
    due_date: '',
  })

  const handleSave = async () => {
    if (!form.title) return toast.error('Título é obrigatório')
    setSaving(true)
    const { error } = await supabase.from('tasks').insert([
      {
        ...form,
        company_id: company?.id,
        created_by: profile?.id,
        status: 'pending',
      },
    ])
    setSaving(false)
    if (error) return toast.error(error.message)
    toast.success('Tarefa criada')
    setOpen(false)
    refetch()
    setForm({ title: '', description: '', assigned_to: '', priority: 'medium', due_date: '' })
  }

  const handleStatus = async (id: string, status: string) => {
    await supabase
      .from('tasks')
      .update({ status, completed_at: status === 'completed' ? new Date().toISOString() : null })
      .eq('id', id)
    refetch()
  }

  const confirmDelete = (task: any) => {
    if (task.status === 'completed') {
      toast.error('Tarefas concluídas não podem ser deletadas.')
      return
    }
    setTaskToDelete(task)
    setDeleteOpen(true)
  }

  const handleDelete = async () => {
    if (!taskToDelete) return
    setSaving(true)

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskToDelete.id)
      .eq('created_by', profile?.id)
      .neq('status', 'completed')

    if (error) {
      toast.error('Erro ao deletar: ' + error.message)
    } else {
      await supabase.from('financial_audit_logs').insert([
        {
          company_id: company?.id,
          user_id: profile?.id,
          action: 'delete',
          table_name: 'tasks',
          record_id: taskToDelete.id,
          old_values: taskToDelete,
        },
      ])
      toast.success('Tarefa deletada com sucesso')
      refetch()
    }

    setSaving(false)
    setDeleteOpen(false)
    setTaskToDelete(null)
  }

  const priorityLabels: any = { low: 'Baixa', medium: 'Média', high: 'Alta' }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tarefas</h1>
          <p className="text-muted-foreground">Gerencie atividades da equipe.</p>
        </div>
        <Button onClick={() => setOpen(true)}>+ Nova Tarefa</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quadro de Tarefas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : tasks?.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">
              Nenhuma tarefa encontrada.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {/* Pendentes */}
              <div className="space-y-4">
                <h3 className="font-semibold text-muted-foreground uppercase text-xs tracking-wider">
                  Pendente
                </h3>
                {tasks
                  ?.filter((t: any) => t.status === 'pending')
                  .map((t: any) => (
                    <div
                      key={t.id}
                      className="p-4 border rounded-xl bg-card shadow-sm space-y-3 relative group"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-semibold text-sm pr-6">{t.title}</h4>
                          <Badge
                            variant={t.priority === 'high' ? 'destructive' : 'secondary'}
                            className="text-[10px] uppercase"
                          >
                            {priorityLabels[t.priority] || t.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {t.description}
                        </p>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-[10px] text-muted-foreground">
                          {t.due_date
                            ? new Date(t.due_date + 'T12:00:00').toLocaleDateString('pt-BR')
                            : 'Sem prazo'}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => handleStatus(t.id, 'in_progress')}
                        >
                          Iniciar
                        </Button>
                      </div>
                      {t.created_by === profile?.id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-destructive h-6 w-6"
                          onClick={() => confirmDelete(t)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  ))}
              </div>

              {/* Em Andamento */}
              <div className="space-y-4">
                <h3 className="font-semibold text-blue-600 uppercase text-xs tracking-wider">
                  Em Andamento
                </h3>
                {tasks
                  ?.filter((t: any) => t.status === 'in_progress')
                  .map((t: any) => (
                    <div
                      key={t.id}
                      className="p-4 border border-blue-200 bg-blue-50/50 rounded-xl shadow-sm space-y-3 relative group"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-semibold text-sm pr-6">{t.title}</h4>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {t.description}
                        </p>
                      </div>
                      <div className="flex gap-2 pt-2 border-t border-blue-100">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs flex-1"
                          onClick={() => handleStatus(t.id, 'pending')}
                        >
                          Pausar
                        </Button>
                        <Button
                          size="sm"
                          className="h-7 text-xs flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => handleStatus(t.id, 'completed')}
                        >
                          Concluir
                        </Button>
                      </div>
                      {t.created_by === profile?.id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-destructive h-6 w-6"
                          onClick={() => confirmDelete(t)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  ))}
              </div>

              {/* Concluídas */}
              <div className="space-y-4">
                <h3 className="font-semibold text-green-600 uppercase text-xs tracking-wider">
                  Concluída
                </h3>
                {tasks
                  ?.filter((t: any) => t.status === 'completed')
                  .map((t: any) => (
                    <div
                      key={t.id}
                      className="p-4 border border-green-200 bg-green-50/50 rounded-xl shadow-sm space-y-3 opacity-70 relative group"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-semibold text-sm line-through">{t.title}</h4>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-green-100">
                        <p className="text-[10px] text-green-700">
                          Concluída em: {new Date(t.completed_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Tarefa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Título</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Prioridade</label>
                <Select
                  value={form.priority}
                  onValueChange={(v) => setForm({ ...form, priority: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Data Limite</label>
                <Input
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Atribuir para (Atendentes)</label>
              <Select
                value={form.assigned_to}
                onValueChange={(v) => setForm({ ...form, assigned_to: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um atendente..." />
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
          </div>
          <DialogFooter>
            <Button disabled={saving} onClick={handleSave} className="w-full">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Salvar Tarefa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Tem certeza que deseja deletar a tarefa <strong>{taskToDelete?.title}</strong>? Esta
              ação não pode ser desfeita.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" disabled={saving} onClick={handleDelete}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Deletar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
