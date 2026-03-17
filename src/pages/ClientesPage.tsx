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
import { Search, UserPlus, Loader2, Edit2, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { usePasskey } from '@/contexts/PasskeyContext'

export default function ClientesPage() {
  const { passkey } = useParams()
  const { company } = usePasskey()
  const navigate = useNavigate()
  const {
    data: clients,
    loading,
    refetch,
  } = useQuery<any>('clients', { match: { is_active: true } })

  const [search, setSearch] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ name: '', phone: '', email: '' })

  const filtered = clients.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search),
  )

  const openSheet = (c: any = null) => {
    if (c) {
      setEditing(c)
      setForm({ name: c.name, phone: c.phone, email: c.email || '' })
    } else {
      setEditing(null)
      setForm({ name: '', phone: '', email: '' })
    }
    setSheetOpen(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.phone) return toast.error('Nome e telefone são obrigatórios')

    if (editing) {
      const { error } = await supabase.from('clients').update(form).eq('id', editing.id)
      if (error) return toast.error(error.message)
      toast.success('Cliente atualizado')
    } else {
      const { error } = await supabase
        .from('clients')
        .insert([{ ...form, company_id: company?.id }])
      if (error) return toast.error(error.message)
      toast.success('Cliente cadastrado')
    }
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
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow
                    key={c.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/${passkey}/clientes/${c.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage
                            src={`https://img.usecurling.com/ppl/thumbnail?seed=${c.id}`}
                          />
                          <AvatarFallback>{c.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{c.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{c.phone}</TableCell>
                    <TableCell className="text-muted-foreground">{c.email || '-'}</TableCell>
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
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={(e) => handleDelete(c.id, e)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
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
          </div>
          <SheetFooter className="mt-8">
            <Button className="w-full" onClick={handleSave}>
              Salvar Cliente
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
