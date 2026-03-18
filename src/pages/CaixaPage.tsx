import { useState, useMemo } from 'react'
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
import { Wallet, Loader2, Undo2, Edit2, Check, X } from 'lucide-react'
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
  const [inlineEditing, setInlineEditing] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ description: '', amount: '' })

  const filtered = useMemo(() => {
    return txs.filter((t: any) => {
      const d = t.settled_at ? t.settled_at.split('T')[0] : t.created_at.split('T')[0]
      return d === dateFilter
    })
  }, [txs, dateFilter])

  const saldo = filtered.reduce(
    (acc: number, t: any) =>
      t.status === 'completed' ? (t.type === 'entrada' ? acc + t.amount : acc - t.amount) : acc,
    0,
  )

  const totalEntradas = filtered.reduce(
    (acc: number, t: any) =>
      t.status === 'completed' && t.type === 'entrada' ? acc + t.amount : acc,
    0,
  )

  const totalSaidas = filtered.reduce(
    (acc: number, t: any) =>
      t.status === 'completed' && t.type === 'saida' ? acc + t.amount : acc,
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
        settled_at: new Date().toISOString(),
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

  const startInlineEdit = (t: any) => {
    setInlineEditing(t.id)
    setEditForm({ description: t.description, amount: t.amount.toString() })
  }

  const saveInlineEdit = async (t: any) => {
    await supabase
      .from('transactions')
      .update({
        amount: Number(editForm.amount),
        description: editForm.description,
      })
      .eq('id', t.id)
    toast.success('Lançamento atualizado e auditado')
    setInlineEditing(null)
    refetch()
  }

  const isAdminOrRoot = profile?.role === 'admin' || profile?.role === 'root'

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Caixa Diário</h1>
          <p className="text-muted-foreground">Edição inline e auditoria avançada.</p>
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
              <Wallet className="w-4 h-4" /> Saldo Líquido do Dia
            </div>
            <div className="text-3xl font-bold">R$ {saldo.toFixed(2)}</div>
          </CardContent>
        </Card>

        {isAdminOrRoot && (
          <>
            <Card className="bg-green-500/5 border-green-500/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-green-700 mb-2">Entradas</div>
                <div className="text-3xl font-bold text-green-700">
                  R$ {totalEntradas.toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-destructive/5 border-destructive/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-destructive mb-2">Saídas</div>
                <div className="text-3xl font-bold text-destructive">
                  R$ {totalSaidas.toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </>
        )}
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
                {filtered.map((t: any) => {
                  const isEditing = inlineEditing === t.id
                  const time = t.settled_at ? new Date(t.settled_at) : new Date(t.created_at)
                  return (
                    <TableRow
                      key={t.id}
                      className={t.status === 'cancelled' ? 'opacity-50 line-through' : ''}
                    >
                      <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                        {time.toLocaleTimeString()}
                      </TableCell>
                      <TableCell className="font-medium max-w-[200px]">
                        {isEditing ? (
                          <Input
                            value={editForm.description}
                            onChange={(e) =>
                              setEditForm({ ...editForm, description: e.target.value })
                            }
                            className="h-8 text-sm"
                          />
                        ) : (
                          <div className="truncate" title={t.description}>
                            {t.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="uppercase text-[10px] tracking-wider font-semibold">
                        {t.payment_method || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            t.type === 'entrada'
                              ? 'text-green-600 border-green-600/30'
                              : 'text-destructive border-destructive/30'
                          }
                        >
                          {t.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[10px]">
                          {t.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {isEditing ? (
                          <Input
                            type="number"
                            value={editForm.amount}
                            onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                            className="h-8 w-24 text-right ml-auto"
                          />
                        ) : (
                          `R$ ${t.amount.toFixed(2)}`
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-1 whitespace-nowrap">
                        {isEditing ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-green-600 h-8 w-8"
                              onClick={() => saveInlineEdit(t)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive h-8 w-8"
                              onClick={() => setInlineEditing(null)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          t.status === 'completed' &&
                          !t.description.startsWith('Estorno') && (
                            <>
                              {canEdit(t) && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => startInlineEdit(t)}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                              )}
                              {isAdminOrRoot && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-amber-600 h-8 w-8"
                                  onClick={() => handleEstorno(t)}
                                >
                                  <Undo2 className="w-4 h-4" />
                                </Button>
                              )}
                            </>
                          )
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
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
    </div>
  )
}
