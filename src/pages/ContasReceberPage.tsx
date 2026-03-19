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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { CheckCircle2, Plus, AlertTriangle, User } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { usePasskey } from '@/contexts/PasskeyContext'
import { TitlePaymentDialog } from '@/components/financeiro/TitlePaymentDialog'
import { TitleDetailSheet } from '@/components/financeiro/TitleDetailSheet'

export default function ContasReceberPage() {
  const { company } = usePasskey()
  const { data: titles, refetch } = useQuery<any>('financial_titles', {
    match: { type: 'receivable' },
    select: '*, clients(name)',
  })
  const { data: clients } = useQuery<any>('clients', { match: { is_active: true } })

  const [searchParams, setSearchParams] = useSearchParams()
  const filterParam = searchParams.get('filter')

  const [sheetOpen, setSheetOpen] = useState(false)
  const [paymentTitle, setPaymentTitle] = useState<any>(null)
  const [detailTitle, setDetailTitle] = useState<any>(null)

  const [form, setForm] = useState({
    client_id: '',
    amount: '',
    due_date: new Date().toISOString().split('T')[0],
    notes: '',
  })

  const openSheet = () => {
    setForm({
      client_id: '',
      amount: '',
      due_date: new Date().toISOString().split('T')[0],
      notes: '',
    })
    setSheetOpen(true)
  }

  const handleSave = async () => {
    if (!form.client_id || !form.amount) return toast.error('Preencha cliente e valor.')

    await supabase.from('financial_titles').insert([
      {
        company_id: company?.id,
        type: 'receivable',
        status: 'open',
        original_amount: Number(form.amount),
        due_date: form.due_date,
        description: form.notes,
        client_id: form.client_id,
      },
    ])

    toast.success('Título criado com sucesso')
    setSheetOpen(false)
    refetch()
  }

  const today = new Date().toISOString().split('T')[0]
  const filteredTitles = titles.filter((t: any) => {
    if (filterParam === 'overdue')
      return ['open', 'partial'].includes(t.status) && t.due_date < today
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Títulos a Receber</h1>
          <p className="text-muted-foreground">Gestão rigorosa de contas a receber e clientes.</p>
        </div>
        <Button onClick={openSheet} className="rounded-full shadow-md">
          <Plus className="w-4 h-4 mr-2" /> Novo Título
        </Button>
      </div>

      {filterParam === 'overdue' && (
        <div className="flex justify-between items-center bg-destructive/10 text-destructive p-3 rounded-lg border border-destructive/20 mb-4">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4" /> Exibindo títulos vencidos.
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSearchParams({})}
            className="bg-transparent border-destructive/50 text-destructive"
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
                <TableHead>Cliente</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Valor Original</TableHead>
                <TableHead>Aberto</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTitles.map((t: any) => (
                <TableRow
                  key={t.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setDetailTitle(t)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      {t.clients?.name || 'Cliente Removido'}
                    </div>
                    {t.description && (
                      <div className="text-xs text-muted-foreground mt-1">{t.description}</div>
                    )}
                  </TableCell>
                  <TableCell>{new Date(t.due_date).toLocaleDateString()}</TableCell>
                  <TableCell>R$ {t.original_amount.toFixed(2)}</TableCell>
                  <TableCell className="font-bold text-primary">
                    R$ {(t.open_amount ?? t.original_amount - t.paid_amount).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {t.status === 'paid' ? (
                      <Badge className="bg-green-500">Pago</Badge>
                    ) : (
                      <Badge variant="outline">{t.status}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {['open', 'partial'].includes(t.status) && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 relative z-10"
                        onClick={(e) => {
                          e.stopPropagation()
                          setPaymentTitle(t)
                        }}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Baixar
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
            <SheetTitle>Novo Título a Receber</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label>Cliente (Obrigatório)</Label>
              <Select
                value={form.client_id || undefined}
                onValueChange={(v) => setForm({ ...form, client_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente..." />
                </SelectTrigger>
                <SelectContent>
                  {clients
                    ?.filter((c: any) => c && c.id && c.id.trim() !== '')
                    .map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
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
              <Label>Observações Adicionais</Label>
              <Input
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
            <Button onClick={handleSave} className="w-full mt-4">
              Criar Título
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <TitlePaymentDialog
        open={!!paymentTitle}
        onOpenChange={(o: boolean) => !o && setPaymentTitle(null)}
        title={paymentTitle}
        onComplete={refetch}
      />
      <TitleDetailSheet
        open={!!detailTitle}
        onOpenChange={(o: boolean) => !o && setDetailTitle(null)}
        title={detailTitle}
        onUpdate={() => {
          refetch()
          setDetailTitle(null)
        }}
      />
    </div>
  )
}
