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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Plus, Loader2, Trash2, Edit2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { usePasskey } from '@/contexts/PasskeyContext'

export default function ServicosPage() {
  const { company } = usePasskey()
  const {
    data: services,
    loading,
    refetch,
  } = useQuery<any>('services', { match: { is_active: true } })

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)

  const [form, setForm] = useState({
    name: '',
    price: '',
    type: 'service',
    duration: '60',
    cost_price: '',
    is_composite: false,
  })

  const openSheet = (s: any = null) => {
    if (s) {
      setEditing(s)
      setForm({
        name: s.name,
        price: s.price.toString(),
        type: s.type,
        duration: s.duration.toString(),
        cost_price: s.cost_price?.toString() || '',
        is_composite: s.is_composite,
      })
    } else {
      setEditing(null)
      setForm({
        name: '',
        price: '',
        type: 'service',
        duration: '60',
        cost_price: '',
        is_composite: false,
      })
    }
    setSheetOpen(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.price) return toast.error('Nome e preço são obrigatórios')

    const payload = {
      name: form.name,
      price: Number(form.price),
      type: form.type,
      duration: Number(form.duration),
      cost_price: form.cost_price ? Number(form.cost_price) : null,
      is_composite: form.is_composite,
    }

    if (editing) {
      const { error } = await supabase.from('services').update(payload).eq('id', editing.id)
      if (error) return toast.error(error.message)
      toast.success('Atualizado')
    } else {
      const code = `${form.type === 'product' ? 'PRD' : 'SRV'}-${Date.now().toString().slice(-4)}`
      const { error } = await supabase
        .from('services')
        .insert([{ ...payload, code, company_id: company?.id }])
      if (error) return toast.error(error.message)
      toast.success('Adicionado')
    }
    setSheetOpen(false)
    refetch()
  }

  const removeService = async (id: string) => {
    if (!confirm('Deseja realmente remover?')) return
    await supabase.from('services').update({ is_active: false }).eq('id', id)
    toast.success('Removido')
    refetch()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Serviços & Produtos</h1>
          <p className="text-muted-foreground">Catálogo para agendamentos e vendas.</p>
        </div>
        <Button onClick={() => openSheet()} className="rounded-full shadow-md">
          <Plus className="w-4 h-4 mr-2" /> Novo
        </Button>
      </div>

      {loading ? (
        <div className="p-8 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {s.code}
                    </TableCell>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {s.type === 'product' ? 'Produto' : 'Serviço'}
                      </Badge>
                      {s.is_composite && (
                        <Badge variant="secondary" className="ml-2 text-[10px]">
                          Composto
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {s.type === 'service' ? `${s.duration} min` : '-'}
                    </TableCell>
                    <TableCell className="font-semibold text-primary">
                      R$ {s.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => openSheet(s)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeService(s.id)}
                        className="text-destructive"
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
            <SheetTitle>{editing ? 'Editar Item' : 'Novo Item'}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preço Venda (R$)</Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Custo (Opcional)</Label>
                <Input
                  type="number"
                  value={form.cost_price}
                  onChange={(e) => setForm({ ...form, cost_price: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="service">Serviço</SelectItem>
                  <SelectItem value="product">Produto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.type === 'service' && (
              <>
                <div className="space-y-2">
                  <Label>Duração Estimada (min)</Label>
                  <Input
                    type="number"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  />
                </div>
                <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg border">
                  <div>
                    <Label className="text-sm font-semibold">Serviço Composto</Label>
                    <p className="text-xs text-muted-foreground">
                      Ex: Pacote Noiva (Múltiplas etapas)
                    </p>
                  </div>
                  <Switch
                    checked={form.is_composite}
                    onCheckedChange={(v) => setForm({ ...form, is_composite: v })}
                  />
                </div>
              </>
            )}
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
