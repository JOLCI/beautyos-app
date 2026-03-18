import { useState } from 'react'
import { useQuery } from '@/hooks/use-query'
import { useAuth } from '@/hooks/use-auth'
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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { UserPlus, Trash2, KeyRound, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { usePasskey } from '@/contexts/PasskeyContext'
import { toast } from 'sonner'

export default function UsuariosPage() {
  const { company } = usePasskey()
  const { profile } = useAuth()
  const {
    data: users,
    loading,
    refetch,
  } = useQuery<any>('profiles', { match: { is_active: true } })

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'atendimento' })
  const [saving, setSaving] = useState(false)

  // Hide root users from non-root profiles
  const filteredUsers = profile?.role === 'root' ? users : users.filter((u) => u.role !== 'root')

  const openSheet = (u: any = null) => {
    setEditing(u)
    setForm(
      u
        ? { name: u.name, email: u.username, password: '', role: u.role }
        : { name: '', email: '', password: '', role: 'atendimento' },
    )
    setSheetOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    if (editing) {
      await supabase
        .from('profiles')
        .update({ name: form.name, role: form.role })
        .eq('id', editing.id)
      toast.success('Usuário atualizado')
      setSheetOpen(false)
      refetch()
    } else {
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: { ...form, company_id: company?.id },
      })
      if (error || !data?.success) {
        toast.error('Erro ao criar usuário', { description: data?.error || error?.message })
      } else {
        toast.success('Usuário criado com sucesso')
        setSheetOpen(false)
        refetch()
      }
    }
    setSaving(false)
  }

  const handleDelete = async (u: any) => {
    if (!confirm(`Remover permanentemente o usuário ${u.username}?`)) return
    const { data } = await supabase.functions.invoke('delete-user', { body: { user_id: u.id } })
    if (data?.success) {
      toast.success('Usuário removido')
      refetch()
    } else {
      toast.error('Erro ao remover')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Equipe e Acessos</h1>
          <p className="text-muted-foreground">Gerencie o acesso da sua equipe.</p>
        </div>
        <Button onClick={() => openSheet()} className="rounded-full shadow-md">
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
                {filteredUsers.map((u) => (
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
                      <Button variant="ghost" size="icon" onClick={() => openSheet(u)}>
                        <KeyRound className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDelete(u)}
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

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          className="sm:max-w-[480px] overflow-y-auto max-h-screen flex flex-col"
        >
          <SheetHeader className="mb-6">
            <SheetTitle>{editing ? 'Editar Usuário' : 'Novo Usuário'}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 flex-1">
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
                disabled={!!editing}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            {!editing && (
              <div className="space-y-2">
                <Label>Senha Inicial</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Nível de Acesso</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="atendimento">Atendimento (PDV/Agenda)</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  {profile?.role === 'root' && (
                    <SelectItem value="root">Root (Super Admin)</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-8 border-t pt-4 sticky bottom-0 bg-background">
            <Button onClick={handleSave} disabled={saving} className="w-full h-12">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editing ? 'Salvar Alterações' : 'Criar Conta'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
