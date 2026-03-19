import { useState, useMemo } from 'react'
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
import { UserPlus, Trash2, KeyRound, Loader2, Edit } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { usePasskey } from '@/contexts/PasskeyContext'
import { toast } from 'sonner'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function UsuariosPage() {
  const { company } = usePasskey()
  const { profile } = useAuth()
  const isRoot = profile?.role === 'root'

  const {
    data: users,
    loading,
    refetch,
  } = useQuery<any>('profiles', { match: { is_active: true } })

  const { data: companies } = useQuery<any>('companies', { enabled: isRoot })

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    role: 'atendimento',
    company_id: '',
  })
  const [saving, setSaving] = useState(false)

  // Filter out root users from company-level user management if not root
  const filteredUsers = useMemo(() => {
    if (isRoot) return users
    return users.filter((u) => u.role !== 'root')
  }, [users, isRoot])

  const openSheet = (u: any = null) => {
    setEditing(u)
    setForm(
      u
        ? {
            name: u.name,
            email: '', // Not fetched in profiles, leave blank to not update
            username: u.username,
            password: '',
            role: u.role,
            company_id: u.company_id || '',
          }
        : {
            name: '',
            email: '',
            username: '',
            password: '',
            role: 'atendimento',
            company_id: company?.id || '',
          },
    )
    setSheetOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)

    // Only allow setting company_id for root, else enforce current company
    const targetCompanyId = isRoot ? form.company_id : company?.id

    if (editing) {
      const payload: any = {
        user_id: editing.id,
        name: form.name,
        role: form.role,
        company_id: targetCompanyId,
      }

      if (form.username && form.username !== editing.username) payload.username = form.username
      if (form.email) payload.email = form.email
      if (form.password) payload.password = form.password

      const { data, error } = await supabase.functions.invoke('update-user', {
        body: payload,
      })

      if (error || !data?.success) {
        const errorMsg = data?.error || error?.message || ''
        let displayError = errorMsg

        if (
          errorMsg.toLowerCase().includes('password should be at least') ||
          errorMsg.toLowerCase().includes('weak_password') ||
          errorMsg.toLowerCase().includes('senha')
        ) {
          displayError = 'A senha deve ter pelo menos 6 caracteres.'
        } else if (
          errorMsg.toLowerCase().includes('unable to validate email address') ||
          errorMsg.toLowerCase().includes('invalid format') ||
          errorMsg.toLowerCase().includes('invalid email')
        ) {
          displayError = 'Formato de e-mail inválido.'
        } else if (
          errorMsg.toLowerCase().includes('already registered') ||
          errorMsg.toLowerCase().includes('unique constraint') ||
          errorMsg.toLowerCase().includes('already in use')
        ) {
          displayError = 'Este e-mail ou nome de usuário já está em uso.'
        }

        toast.error('Erro ao atualizar usuário', { description: displayError })
      } else {
        toast.success('Usuário atualizado com sucesso')
        setSheetOpen(false)
        refetch()
      }
    } else {
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: { ...form, company_id: targetCompanyId },
      })
      if (error || !data?.success) {
        const errorMsg = data?.error || error?.message || ''
        let displayError = errorMsg

        if (
          errorMsg.toLowerCase().includes('password should be at least') ||
          errorMsg.toLowerCase().includes('weak_password') ||
          errorMsg.toLowerCase().includes('senha')
        ) {
          displayError = 'A senha deve ter pelo menos 6 caracteres.'
        } else if (
          errorMsg.toLowerCase().includes('unable to validate email address') ||
          errorMsg.toLowerCase().includes('invalid format') ||
          errorMsg.toLowerCase().includes('invalid email')
        ) {
          displayError = 'Formato de e-mail inválido.'
        } else if (
          errorMsg.toLowerCase().includes('already registered') ||
          errorMsg.toLowerCase().includes('unique constraint') ||
          errorMsg.toLowerCase().includes('already in use')
        ) {
          displayError = 'Este e-mail ou nome de usuário já está em uso.'
        }

        toast.error('Erro ao criar usuário', { description: displayError })
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
      toast.success('Usuário removido com sucesso')
      refetch()
    } else {
      toast.error('Erro ao remover usuário')
    }
  }

  const passwordLengthError = form.password.length > 0 && form.password.length < 6
  const emailError = form.email.length > 0 && !emailRegex.test(form.email)

  const isSubmitDisabled =
    saving ||
    !form.name ||
    !form.username ||
    (editing ? false : !form.email) ||
    emailError ||
    (editing ? passwordLengthError : form.password.length < 6)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Equipe e Acessos</h1>
          <p className="text-muted-foreground">Gerencie o acesso da sua equipe ao sistema.</p>
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
                  <TableHead>Usuário</TableHead>
                  <TableHead>Nível</TableHead>
                  {isRoot && <TableHead>Unidade</TableHead>}
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
                        <span className="font-medium">{u.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{u.username}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="uppercase text-[10px] font-semibold tracking-wider"
                      >
                        {u.role === 'root' ? 'Admin Global' : u.role}
                      </Badge>
                    </TableCell>
                    {isRoot && (
                      <TableCell className="text-xs text-muted-foreground truncate max-w-[120px]">
                        {companies?.find((c: any) => c.id === u.company_id)?.name || 'N/A'}
                      </TableCell>
                    )}
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => openSheet(u)}>
                        <Edit className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(u)}
                        disabled={u.id === profile?.id}
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
        <SheetContent side="right" className="sm:max-w-[480px] overflow-y-auto flex flex-col">
          <SheetHeader className="mb-6">
            <SheetTitle>{editing ? 'Editar Usuário' : 'Novo Usuário'}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 flex-1">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: João da Silva"
              />
            </div>
            <div className="space-y-2">
              <Label>Nome de Usuário (Login)</Label>
              <Input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase() })}
                placeholder="ex: joao.silva"
              />
            </div>
            <div className="space-y-2">
              <Label>{editing ? 'Novo E-mail (opcional)' : 'E-mail'}</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder={editing ? 'Deixe em branco para não alterar' : 'joao@salao.com'}
                className={emailError ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {emailError && (
                <p className="text-sm font-medium text-destructive">Formato de e-mail inválido.</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>{editing ? 'Nova Senha (opcional)' : 'Senha Inicial'}</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={editing ? 'Deixe em branco para não alterar' : 'Mínimo 6 caracteres'}
                className={
                  passwordLengthError ? 'border-destructive focus-visible:ring-destructive' : ''
                }
              />
              {passwordLengthError && (
                <p className="text-sm font-medium text-destructive">
                  A senha deve ter pelo menos 6 caracteres.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Nível de Acesso</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="atendimento">Atendimento (Agenda e PDV)</SelectItem>
                  <SelectItem value="admin">Administrador (Relatórios e Configs)</SelectItem>
                  {isRoot && <SelectItem value="root">Root (Gestor Multilojas)</SelectItem>}
                </SelectContent>
              </Select>
            </div>
            {isRoot && form.role !== 'root' && (
              <div className="space-y-2">
                <Label>Unidade / Salão</Label>
                <Select
                  value={form.company_id}
                  onValueChange={(v) => setForm({ ...form, company_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a unidade..." />
                  </SelectTrigger>
                  <SelectContent>
                    {companies?.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <div className="mt-8 pt-4 sticky bottom-0 bg-background border-t">
            <Button onClick={handleSave} disabled={isSubmitDisabled} className="w-full h-12">
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <KeyRound className="w-4 h-4 mr-2" />
              )}
              {editing ? 'Salvar Alterações' : 'Criar Conta'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
