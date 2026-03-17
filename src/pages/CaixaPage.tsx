import { useState, useMemo } from 'react'
import { useQuery } from '@/hooks/use-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Wallet, Loader2, Undo2, Edit2, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { usePasskey } from '@/contexts/PasskeyContext'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'

export default function CaixaPage() {
  const { company } = usePasskey()
  const { profile } = useAuth()
  const {
    data: txs,
    loading,
    refetch,
  } = useQuery<any>('transactions', { order: { column: 'created_at', ascending: false } })

  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0])
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingTx, setEditingTx] = useState<any>(null)
  const [form, setForm] = useState({ description: '', amount: '' })

  const filtered = useMemo(() => {
    return txs.filter((t: any) => t.created_at.startsWith(dateFilter))
  }, [txs, dateFilter])

  const saldo = filtered.reduce(
    (acc: number, t: any) =>
      t.status === 'completed' ? (t.type === 'entrada' ? acc + t.amount : acc - t.amount) : acc,
    0,
  )

  const handleEstorno = async (t: any) => {
    if (!confirm('Confirmar estorno desta transação?')) return
    await supabase.from('transactions').insert([
      {
        company_id: company?.id,
        type: t.type === 'entrada' ? 'saida' : 'entrada',
        amount: t.amount,
        description: `Estorno: ${t.description}`,
        payment_method: t.payment_method,
        status: 'completed',
        user_id: profile?.id,
      },
    ])
    await supabase.from('transactions').update({ status: 'cancelled' }).eq('id', t.id)
    toast.success('Estorno realizado e auditado')
    refetch()
  }

  const canEdit = (t: any) => {
    if (profile?.role === 'admin' || profile?.role === 'root') return true
    const today = new Date().toISOString().split('T')[0]
    return (
      profile?.role === 'atendimento' && t.user_id === profile?.id && t.created_at.startsWith(today)
    )
  }

  const openEdit = (t: any) => {
    setEditingTx(t)
    setForm({ description: t.description, amount: t.amount.toString() })
    setSheetOpen(true)
  }

  const handleSaveEdit = async () => {
    await supabase
      .from('transactions')
      .update({ amount: Number(form.amount), description: form.description })
      .eq('id', editingTx.id)
    toast.success('Transação atualizada')
    setSheetOpen(false)
    refetch()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Caixa Diário</h1>
          <p className="text-muted-foreground">Consulta de movimentações por período.</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-auto font-medium"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-primary mb-2">
              <Wallet className="w-4 h-4" /> Saldo do Dia Selecionado
            </div>
            <div className="text-3xl font-bold">R$ {saldo.toFixed(2)}</div>
          </CardContent>
        </Card>
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
                  <TableHead>Hora</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t: any) => (
                  <TableRow
                    key={t.id}
                    className={t.status === 'cancelled' ? 'opacity-50 line-through' : ''}
                  >
                    <TableCell className="text-muted-foreground">
                      {new Date(t.created_at).toLocaleTimeString()}
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate" title={t.description}>
                      {t.description}
                    </TableCell>
                    <TableCell className="uppercase text-xs">{t.payment_method || '-'}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={t.type === 'entrada' ? 'text-green-600' : 'text-destructive'}
                      >
                        {t.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{t.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold">R$ {t.amount.toFixed(2)}</TableCell>
                    <TableCell className="text-right space-x-1">
                      {t.status === 'completed' && !t.description.startsWith('Estorno') && (
                        <>
                          {canEdit(t) && (
                            <Button variant="ghost" size="icon" onClick={() => openEdit(t)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          )}
                          {profile?.role !== 'atendimento' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-amber-600"
                              onClick={() => handleEstorno(t)}
                            >
                              <Undo2 className="w-4 h-4" />
                            </Button>
                          )}
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhuma transação neste dia.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Editar Lançamento</SheetTitle>
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
            <Button onClick={handleSaveEdit} className="w-full">
              Salvar Alteração
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-4">
              Esta edição ficará registrada no log de auditoria financeiro.
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
