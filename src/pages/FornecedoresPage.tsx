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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Plus, Edit2, Trash2, Truck } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { usePasskey } from '@/contexts/PasskeyContext'

export default function FornecedoresPage() {
  const { company } = usePasskey()
  const { data: allSuppliers, refetch } = useQuery<any>('suppliers')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({
    name: '',
    document: '',
    phone: '',
    email: '',
    notes: '',
    is_active: true,
  })

  const suppliers = (allSuppliers || []).filter((s: any) => s.is_active !== false)

  const openSheet = (s: any = null) => {
    setEditing(s)
    setForm(
      s
        ? { ...s, is_active: s.is_active !== false }
        : { name: '', document: '', phone: '', email: '', notes: '', is_active: true },
    )
    setSheetOpen(true)
  }

  const handleSave = async () => {
    if (!form.name) return toast.error('Nome é obrigatório')
    if (editing) {
      await supabase.from('suppliers').update(form).eq('id', editing.id)
      toast.success('Fornecedor atualizado')
    } else {
      await supabase.from('suppliers').insert([{ ...form, company_id: company?.id }])
      toast.success('Fornecedor cadastrado')
    }
    setSheetOpen(false)
    refetch()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir fornecedor?')) return
    await supabase.from('suppliers').update({ is_active: false }).eq('id', id)
    toast.success('Removido')
    refetch()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fornecedores</h1>
          <p className="text-muted-foreground">Gestão de parceiros e fornecedores.</p>
        </div>
        <Button onClick={() => openSheet()} className="rounded-full shadow-md">
          <Plus className="w-4 h-4 mr-2" /> Novo
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <Truck className="w-4 h-4 text-muted-foreground" /> {s.name}
                  </TableCell>
                  <TableCell>{s.document || '-'}</TableCell>
                  <TableCell>
                    {s.phone} {s.email && ` / ${s.email}`}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => openSheet(s)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleDelete(s.id)}
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
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right">
          <SheetHeader className="mb-6">
            <SheetTitle>{editing ? 'Editar' : 'Novo Fornecedor'}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between border p-3 rounded-lg bg-background shadow-sm mb-4">
              <Label className="cursor-pointer font-medium" htmlFor="is-active-supplier">
                Status Ativo
              </Label>
              <Switch
                id="is-active-supplier"
                checked={form.is_active}
                onCheckedChange={(v) => setForm({ ...form, is_active: v })}
              />
            </div>
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>CNPJ/CPF</Label>
              <Input
                value={form.document}
                onChange={(e) => setForm({ ...form, document: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Observações Internas</Label>
              <Textarea
                value={form.notes || ''}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Ex: Entrega apenas às terças..."
              />
            </div>
          </div>
          <SheetFooter className="mt-8">
            <Button className="w-full" onClick={handleSave}>
              Salvar
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
