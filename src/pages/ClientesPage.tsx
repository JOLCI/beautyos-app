import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@/hooks/use-query'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import { Search, UserPlus, Loader2, Edit2, Trash2, Camera, Check, X } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { formatPhoneForDisplay, formatPhoneForStorage } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { usePasskey } from '@/contexts/PasskeyContext'
import { ClientAvatar } from '@/components/clients/ClientAvatar'

export default function ClientesPage() {
  const { passkey } = useParams()
  const { company } = usePasskey()
  const navigate = useNavigate()
  const { data: allClients, loading, refetch } = useQuery<any>('clients')

  const [search, setSearch] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [uploading, setUploading] = useState(false)
  const [showInactive, setShowInactive] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    birthday: '',
    gender: 'female',
    avatar_url: '',
    is_active: true,
  })

  const filtered = (allClients || [])
    .filter((c: any) => {
      if (!showInactive && c.is_active === false) return false
      return c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
    })
    .sort((a: any, b: any) => a.name.localeCompare(b.name))

  const openSheet = (c: any = null) => {
    if (c) {
      setEditing(c)
      setForm({
        name: c.name,
        phone: formatPhoneForDisplay(c.phone),
        email: c.email || '',
        birthday: c.birthday || '',
        gender: c.gender || 'female',
        avatar_url: c.avatar_url || '',
        is_active: c.is_active !== false,
      })
    } else {
      setEditing(null)
      setForm({
        name: '',
        phone: '',
        email: '',
        birthday: '',
        gender: 'female',
        avatar_url: '',
        is_active: true,
      })
    }
    setSheetOpen(true)
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${company?.id}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('client-photos').upload(path, file)
    if (error) {
      toast.error('Erro ao subir foto')
      setUploading(false)
      return
    }
    const { data: urlData } = supabase.storage.from('client-photos').getPublicUrl(path)
    setForm({ ...form, avatar_url: urlData.publicUrl })
    setUploading(false)
  }

  const handleSave = async () => {
    if (!form.name || !form.phone) return toast.error('Nome e telefone são obrigatórios')
    setSaving(true)

    const payload = {
      ...form,
      phone: formatPhoneForStorage(form.phone),
      birthday: form.birthday || null,
    }

    if (editing) {
      const { error } = await supabase.from('clients').update(payload).eq('id', editing.id)
      if (error) {
        toast.error(error.message)
        setSaving(false)
        return
      }
      toast.success('Cliente atualizado')
    } else {
      // Check for exact duplicate name and phone in the same company
      const { data: existing } = await supabase
        .from('clients')
        .select('id')
        .eq('company_id', company?.id)
        .eq('name', payload.name)
        .eq('phone', payload.phone)
        .single()

      if (existing) {
        toast.error('Já existe um cliente com este nome e telefone.')
        setSaving(false)
        return
      }

      const { error } = await supabase
        .from('clients')
        .insert([{ ...payload, company_id: company?.id }])
      if (error) {
        toast.error(error.message)
        setSaving(false)
        return
      }
      toast.success('Cliente cadastrado')
    }
    setSaving(false)
    setSheetOpen(false)
    refetch()
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Deseja realmente remover este cliente?')) return
    const { error } = await supabase.from('clients').update({ is_active: false }).eq('id', id)
    if (!error) {
      toast.success('Cliente removido')
      refetch()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">Gerencie a base de clientes do salão.</p>
        </div>
        <Button onClick={() => openSheet()} className="rounded-full shadow-md w-full sm:w-auto">
          <UserPlus className="w-4 h-4 mr-2" /> Novo Cliente
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b border-border bg-muted/20">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou celular..."
              className="pl-9 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 ml-4 mt-3 sm:mt-0">
            <Switch
              id="show-inactive-clients"
              checked={showInactive}
              onCheckedChange={setShowInactive}
            />
            <Label htmlFor="show-inactive-clients" className="cursor-pointer text-sm">
              Exibir Inativos
            </Label>
          </div>
        </div>

        {loading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Aniversário</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c: any) => (
                  <TableRow
                    key={c.id}
                    className={`cursor-pointer hover:bg-muted/50 ${c.is_active === false ? 'opacity-60' : ''}`}
                    onClick={() => navigate(`/${passkey}/clientes/${c.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <ClientAvatar client={c} className="h-9 w-9 border" />
                        <span className="font-medium">{c.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatPhoneForDisplay(c.phone)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{c.email || '-'}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.birthday
                        ? new Date(c.birthday + 'T12:00:00').toLocaleDateString('pt-BR')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {c.is_active === false ? (
                        <span className="text-[10px] uppercase font-bold text-destructive flex items-center gap-1">
                          <X className="w-3 h-3" /> Inativo
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase font-bold text-green-600 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Ativo
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          openSheet(c)
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      {c.is_active !== false && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={(e) => handleDelete(c.id, e)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        )}
      </Card>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="overflow-y-auto max-h-screen">
          <SheetHeader className="mb-6">
            <SheetTitle>{editing ? 'Editar Cliente' : 'Novo Cliente'}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <ClientAvatar
                  client={{ ...form, id: editing?.id }}
                  className="h-24 w-24 border-2 border-border shadow-sm"
                />
                <Label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-md"
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </Label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Telefone / WhatsApp</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: formatPhoneForDisplay(e.target.value) })}
                placeholder="(00) 00000-0000"
                maxLength={15}
              />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data de Nascimento</Label>
                <Input
                  type="date"
                  value={form.birthday}
                  onChange={(e) => setForm({ ...form, birthday: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Gênero</Label>
                <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female">Feminino</SelectItem>
                    <SelectItem value="male">Masculino</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between border p-3 rounded-lg bg-background shadow-sm mt-4">
              <Label className="cursor-pointer font-medium" htmlFor="is-active-client">
                Ativo
              </Label>
              <Switch
                id="is-active-client"
                checked={form.is_active}
                onCheckedChange={(v) => setForm({ ...form, is_active: v })}
              />
            </div>
          </div>
          <SheetFooter className="mt-8">
            <Button className="w-full" onClick={handleSave} disabled={uploading || saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Salvar Cliente
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
