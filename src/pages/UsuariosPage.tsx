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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { UserPlus, Trash2, KeyRound, Loader2, Edit, Check, Camera } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
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
    is_attendant: true,
    avatar_url: '',
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

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
            email: '',
            username: u.username,
            password: '',
            role: u.role,
            company_id: u.company_id || '',
            is_attendant: u.is_attendant ?? true,
            avatar_url: u.avatar_url || '',
          }
        : {
            name: '',
            email: '',
            username: '',
            password: '',
            role: 'atendimento',
            company_id: company?.id || '',
            is_attendant: true,
            avatar_url: '',
          },
    )
    setSheetOpen(true)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${company?.id}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('avatars').upload(path, file)
    if (error) {
      toast.error('Erro ao subir foto')
      setUploading(false)
      return
    }
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
    setForm({ ...form, avatar_url: urlData.publicUrl })
    setUploading(false)
    toast.success('Foto carregada com sucesso')
  }

  const handleSave = async () => {
    setSaving(true)

    const targetCompanyId = isRoot ? form.company_id : company?.id

    if (editing) {
      const payload: any = {
        user_id: editing.id,
        name: form.name,
        role: form.role,
        company_id: targetCompanyId,
        is_attendant: form.is_attendant,
      }

      if (form.username && form.username !== editing.username) payload.username = form.username
      if (form.email) payload.email = form.email
      if (form.password) payload.password = form.password

      const { data, error } = await supabase.functions.invoke('update-user', {
        body: payload,
      })

      if (error || !data?.success) {
        toast.error('Erro ao atualizar usuário', { description: data?.error || error?.message })
      } else {
        if (form.avatar_url !== editing.avatar_url) {
          await supabase
            .from('profiles')
            .update({ avatar_url: form.avatar_url })
            .eq('id', editing.id)
        }
        toast.success('Usuário atualizado com sucesso')
        setSheetOpen(false)
        refetch()
      }
    } else {
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: { ...form, company_id: targetCompanyId },
      })
      if (error || !data?.success) {
        toast.error('Erro ao criar usuário', { description: data?.error || error?.message })
      } else {
        if (form.avatar_url && data.user?.id) {
          await supabase
            .from('profiles')
            .update({ avatar_url: form.avatar_url })
            .eq('id', data.user.id)
        }
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
    uploading ||
    !form.name ||
    !form.username ||
    (editing ? false : !form.email) ||
    emailError ||
    (editing ? passwordLengthError : form.password.length < 6)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
                  <TableHead>Atendente</TableHead>
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
                          {u.avatar_url && <AvatarImage src={u.avatar_url} />}
                          <AvatarFallback className="bg-muted text-muted-foreground">
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="w-1/2 h-1/2 opacity-60"
                            >
                              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                          </AvatarFallback>
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
                    <TableCell>
                      {u.is_attendant ? (
                        <Badge
                          variant="outline"
                          className="text-green-600 border-green-200 bg-green-50"
                        >
                          <Check className="w-3 h-3 mr-1" /> Sim
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          Não
                        </Badge>
                      )}
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
            <div className="flex justify-center mb-6">
              <div className="relative group">
                <Avatar className="h-24 w-24 border-2 border-background shadow-md">
                  {form.avatar_url && <AvatarImage src={form.avatar_url} />}
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-1/2 h-1/2 opacity-60"
                    >
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </AvatarFallback>
                </Avatar>
                <Label
                  htmlFor="avatar-upload-user"
                  className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  {uploading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6" />
                  )}
                </Label>
                <input
                  id="avatar-upload-user"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploading || saving}
                />
              </div>
            </div>

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
            <div className="flex items-center justify-between border p-3 rounded-lg bg-background shadow-sm">
              <Label className="cursor-pointer font-medium" htmlFor="is-attendant">
                Atendente (Exibe na agenda)
              </Label>
              <Switch
                id="is-attendant"
                checked={form.is_attendant}
                onCheckedChange={(v) => setForm({ ...form, is_attendant: v })}
              />
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
