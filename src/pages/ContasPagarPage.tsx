import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Undo2, CheckCircle2, Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { usePasskey } from '@/contexts/PasskeyContext'
import { formatFinancialDescription } from '@/lib/financial'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function ContasPagarPage() {
  const { company } = usePasskey()
  const { data: payables, refetch } = useQuery<any>('financial_accounts', {
    match: { type: 'payable' },
    select: '*, suppliers(name)',
  })
  const { data: suppliers } = useQuery<any>('suppliers', { match: { is_active: true } })

  const [searchParams, setSearchParams] = useSearchParams()
  const filterParam = searchParams.get('filter')

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({
    description: '',
    amount: '',
    due_date: new Date().toISOString().split('T')[0],
    notes: '',
    supplier_id: 'none',
  })

  const openSheet = (p: any = null) => {
    if (p) {
      setEditing(p)
      setForm({
        description: p.description,
        amount: p.amount.toString(),
        due_date: p.due_date,
        notes: p.notes || '',
        supplier_id: p.supplier_id || 'none',
      })
    } else {
      setEditing(null)
      setForm({
        description: '',
        amount: '',
        due_date: new Date().toISOString().split('T')[0],
        notes: '',
        supplier_id: 'none',
      })
    }
    setSheetOpen(true)
  }

  const handleSave = async () => {
    const payload = {
      description: form.description,
      amount: Number(form.amount),
      due_date: form.due_date,
      notes: form.notes,
      supplier_id: form.supplier_id !== 'none' ? form.supplier_id : null,
    }
    if (editing) await supabase.from('financial_accounts').update(payload).eq('id', editing.id)
    else
      await supabase.from('financial_accounts').insert([
        {
          ...payload,
          company_id: company?.id,
          type: 'payable',
          status: 'pending',
          origin: 'manual',
        },
      ])
    toast.success('Salvo com sucesso')
    setSheetOpen(false)
    refetch()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este registro?')) return
    await supabase.from('financial_accounts').delete().eq('id', id)
    toast.success('Excluído')
    refetch()
  }

  const pay = async (p: any) => {
    let entityName = p.description
    if (p.suppliers && p.suppliers.name) {
      entityName = p.suppliers.name
    }

    const txDesc = formatFinancialDescription('OUTROS', `Pgto: ${entityName}`, false)
    const { data: tx } = await supabase
      .from('transactions')
      .insert([
        {
          company_id: company?.id,
          type: 'saida',
          amount: p.amount,
          description: txDesc,
          status: 'completed',
          payment_method: 'OUTROS',
          supplier_id: p.supplier_id,
          settled_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    await supabase
      .from('financial_accounts')
      .update({ status: 'paid', transaction_id: tx?.id, settled_at: new Date().toISOString() })
      .eq('id', p.id)
    toast.success('Conta Paga')
    refetch()
  }

  const undo = async (p: any) => {
    await supabase
      .from('financial_accounts')
      .update({ status: 'pending', transaction_id: null, settled_at: null })
      .eq('id', p.id)
    if (p.transaction_id)
      await supabase.from('transactions').update({ status: 'cancelled' }).eq('id', p.transaction_id)
    toast.info('Pagamento Desfeito')
    refetch()
  }

  const filteredPayables = payables.filter((p) => {
    if (filterParam === 'overdue') {
      const today = new Date().toISOString().split('T')[0]
      return p.status === 'pending' && p.due_date < today
    }
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Contas a Pagar</h1>
        <Button onClick={() => openSheet()} className="rounded-full shadow-md">
          <Plus className="w-4 h-4 mr-2" /> Novo Registro
        </Button>
      </div>

      {filterParam === 'overdue' && (
        <div className="flex justify-between items-center bg-amber-500/10 text-amber-700 p-3 rounded-lg border border-amber-500/20 mb-4 animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4" />
            Exibindo apenas contas vencidas.
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSearchParams({})}
            className="bg-transparent border-amber-500/50 hover:bg-amber-500/20 text-amber-700"
          >
            Limpar Filtro
          </Button>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição / Fornecedor</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayables.map((p) => {
                const supName = Array.isArray(p.suppliers)
                  ? p.suppliers[0]?.name
                  : p.suppliers?.name
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="font-medium">{p.description}</div>
                      {supName && <div className="text-xs text-muted-foreground">{supName}</div>}
                    </TableCell>
                    <TableCell className="uppercase text-xs text-muted-foreground">
                      {p.origin || 'manual'}
                    </TableCell>
                    <TableCell>{new Date(p.due_date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-bold">R$ {p.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      {p.status === 'paid' ? (
                        <Badge className="bg-green-500">Pago</Badge>
                      ) : (
                        <Badge variant="outline">Pendente</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      {p.status !== 'paid' ? (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => openSheet(p)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => handleDelete(p.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600"
                            onClick={() => pay(p)}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Pagar
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-amber-500"
                          onClick={() => undo(p)}
                        >
                          <Undo2 className="w-4 h-4 mr-2" /> Desfazer
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
              {filteredPayables.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum registro encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{editing ? 'Editar Conta' : 'Nova Conta a Pagar'}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Ex: Compra de Tinturas"
              />
            </div>
            <div className="space-y-2">
              <Label>Fornecedor (Opcional)</Label>
              <Select
                value={form.supplier_id}
                onValueChange={(v) => setForm({ ...form, supplier_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {suppliers.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Vencimento</Label>
              <Input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Input
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
            <Button onClick={handleSave} className="w-full h-12 mt-4">
              Salvar
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
