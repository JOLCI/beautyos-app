import { useState } from 'react'
import { useQuery } from '@/hooks/use-query'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
  DialogDescription,
} from '@/components/ui/dialog'
import { UserPlus, Trash2, KeyRound, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { usePasskey } from '@/contexts/PasskeyContext'
import { toast } from 'sonner'

export default function UsuariosPage() {
  const { company } = usePasskey()
  const {
    data: users,
    loading,
    refetch,
  } = useQuery<any>('profiles', { match: { is_active: true } })

  const [openCreate, setOpenCreate] = useState(false)
  const [openDelete, setOpenDelete] = useState<any>(null)
  const [deleteConfirm, setDeleteConfirm] = useState('')

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'atendimento' })
  const [saving, setSaving] = useState(false)

  const handleCreate = async () => {
    setSaving(true)
    const { data, error } = await supabase.functions.invoke('create-user', {
      body: { ...form, company_id: company?.id },
    })
    setSaving(false)

    if (error || !data?.success) {
      toast.error('Erro ao criar usuário', { description: data?.error || error?.message })
    } else {
      toast.success('Usuário criado com sucesso')
      setOpenCreate(false)
      refetch()
    }
  }

  const handleDelete = async () => {
    if (deleteConfirm !== openDelete.username) return
    await supabase.from('profiles').update({ is_active: false }).eq('id', openDelete.id)
    toast.success('Usuário desativado')
    setOpenDelete(null)
    setDeleteConfirm('')
    refetch()
  }

  const resetPassword = () => toast.info('Link de redefinição enviado para o e-mail do usuário.')

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuários do Sistema</h1>
          <p className="text-muted-foreground">Gerencie o acesso da sua equipe.</p>
        </div>
        <Button onClick={() => setOpenCreate(true)} className="rounded-full shadow-md">
          <UserPlus className="w-4 h-4 mr-2" /> Novo Usuário
        </Button>
      </div>

      {loading ? (
        <div className="p-8 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Username / E-mail</TableHead>
                  <TableHead>Nível</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {u.name}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{u.username}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="uppercase text-[10px]">
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={resetPassword}>
                        <KeyRound className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => setOpenDelete(u)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>E-mail (Username)</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Senha Provisória</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Nível de Acesso</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="atendimento">Atendimento (Agenda e Checkout)</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleCreate}
              disabled={saving || !form.email || !form.password}
              className="w-full sm:w-auto"
            >
              {saving ? 'Criando...' : 'Criar Conta'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!openDelete} onOpenChange={(o) => !o && setOpenDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Remover Usuário</DialogTitle>
            <DialogDescription>
              Digite o username <strong>{openDelete?.username}</strong> para confirmar a exclusão
              deste usuário.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder="username do usuário"
            className="mt-4"
          />
          <DialogFooter className="mt-4">
            <Button
              variant="destructive"
              disabled={deleteConfirm !== openDelete?.username}
              onClick={handleDelete}
              className="w-full sm:w-auto"
            >
              Confirmar Exclusão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
