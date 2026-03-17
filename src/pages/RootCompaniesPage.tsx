import { useState } from 'react'
import { useQuery } from '@/hooks/use-query'
import { supabase } from '@/lib/supabase/client'
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
import { Plus, Edit2, Trash2, Loader2, Building2 } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { toast } from 'sonner'

export default function RootCompaniesPage() {
  const { data: companies, loading, refetch } = useQuery<any>('companies')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)

  const [form, setForm] = useState({ name: '', passkey: '', primary_color: '#e11d48' })

  const openSheet = (comp: any = null) => {
    if (comp) {
      setEditing(comp)
      setForm({
        name: comp.name,
        passkey: comp.passkey,
        primary_color: comp.primary_color || '#e11d48',
      })
    } else {
      setEditing(null)
      setForm({ name: '', passkey: '', primary_color: '#e11d48' })
    }
    setSheetOpen(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.passkey) return toast.error('Preencha os campos obrigatórios')

    if (editing) {
      const { error } = await supabase.from('companies').update(form).eq('id', editing.id)
      if (error) return toast.error(error.message)
      toast.success('Empresa atualizada')
    } else {
      const { error } = await supabase.from('companies').insert([form])
      if (error) return toast.error(error.message)
      toast.success('Empresa criada')
    }
    setSheetOpen(false)
    refetch()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Atenção: Isso removerá a empresa e TODOS os seus dados. Continuar?')) return
    const { error } = await supabase.from('companies').delete().eq('id', id)
    if (error) toast.error(error.message)
    else {
      toast.success('Empresa removida')
      refetch()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-6 rounded-2xl border">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Gestão de Empresas (Root)</h1>
            <p className="text-muted-foreground text-sm">
              Administração global de tenants do sistema.
            </p>
          </div>
        </div>
        <Button onClick={() => openSheet()} className="rounded-full shadow-md">
          <Plus className="w-4 h-4 mr-2" /> Nova Empresa
        </Button>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Passkey</TableHead>
                  <TableHead>Cor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-semibold">{c.name}</TableCell>
                    <TableCell className="font-mono">{c.passkey}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: c.primary_color }}
                        />
                        <span className="text-xs text-muted-foreground">{c.primary_color}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => openSheet(c)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDelete(c.id)}
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
        <SheetContent className="overflow-y-auto max-h-screen">
          <SheetHeader className="mb-6">
            <SheetTitle>{editing ? 'Editar Empresa' : 'Nova Empresa'}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome da Empresa</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Studio Beauty"
              />
            </div>
            <div className="space-y-2">
              <Label>Passkey (Identificador na URL)</Label>
              <Input
                value={form.passkey}
                onChange={(e) => setForm({ ...form, passkey: e.target.value.toUpperCase() })}
                placeholder="Ex: BEAUTY01"
                className="uppercase"
              />
            </div>
            <div className="space-y-2">
              <Label>Cor Primária</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={form.primary_color}
                  onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                  className="w-16 h-10 p-1"
                />
                <Input value={form.primary_color} readOnly className="font-mono flex-1" />
              </div>
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
