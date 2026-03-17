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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Undo2, CheckCircle2, Plus, Edit2, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { usePasskey } from '@/contexts/PasskeyContext'

export default function ContasReceberPage() {
  const { company } = usePasskey()
  const { data: receivables, refetch } = useQuery<any>('financial_accounts', {
    match: { type: 'receivable' },
  })

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({
    description: '',
    amount: '',
    due_date: new Date().toISOString().split('T')[0],
    notes: '',
  })

  const openSheet = (p: any = null) => {
    if (p) {
      setEditing(p)
      setForm({
        description: p.description,
        amount: p.amount.toString(),
        due_date: p.due_date,
        notes: p.notes || '',
      })
    } else {
      setEditing(null)
      setForm({
        description: '',
        amount: '',
        due_date: new Date().toISOString().split('T')[0],
        notes: '',
      })
    }
    setSheetOpen(true)
  }

  const handleSave = async () => {
    const payload = { ...form, amount: Number(form.amount) }
    if (editing) await supabase.from('financial_accounts').update(payload).eq('id', editing.id)
    else
      await supabase
        .from('financial_accounts')
        .insert([
          {
            ...payload,
            company_id: company?.id,
            type: 'receivable',
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

  const receive = async (p: any) => {
    await supabase
      .from('financial_accounts')
      .update({ status: 'paid', settled_at: new Date().toISOString() })
      .eq('id', p.id)
    if (p.transaction_id)
      await supabase.from('transactions').update({ status: 'completed' }).eq('id', p.transaction_id)
    toast.success('Valor Recebido')
    refetch()
  }

  const undo = async (p: any) => {
    await supabase
      .from('financial_accounts')
      .update({ status: 'pending', settled_at: null })
      .eq('id', p.id)
    if (p.transaction_id)
      await supabase.from('transactions').update({ status: 'pending' }).eq('id', p.transaction_id)
    toast.info('Recebimento Desfeito')
    refetch()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Contas a Receber</h1>
        <Button onClick={() => openSheet()} className="rounded-full shadow-md">
          <Plus className="w-4 h-4 mr-2" /> Novo Registro
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receivables.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.description}</TableCell>
                  <TableCell className="uppercase text-xs text-muted-foreground">
                    {p.origin || 'manual'}
                  </TableCell>
                  <TableCell>{new Date(p.due_date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-bold text-primary">R$ {p.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    {p.status === 'paid' ? (
                      <Badge className="bg-green-500">Recebido</Badge>
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
                          onClick={() => receive(p)}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" /> Receber
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{editing ? 'Editar Conta' : 'Nova Conta a Receber'}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
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
