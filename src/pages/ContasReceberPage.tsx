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
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Undo2, CheckCircle2, Plus, Edit2, Trash2, Info } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { usePasskey } from '@/contexts/PasskeyContext'

const PAYMENT_METHODS = [
  'PIX',
  'PIX AGENDADO',
  'DINHEIRO',
  'DEBITO',
  'CREDITO',
  'CONVENIO',
  'TRANSFERENCIA',
  'BOLETO',
  'OUTROS',
]

export default function ContasReceberPage() {
  const { company } = usePasskey()
  const { data: receivables, refetch } = useQuery<any>('financial_accounts', {
    match: { type: 'receivable' },
  })
  const { data: clients } = useQuery<any>('clients', { match: { is_active: true } })

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)

  // Standardized Form State
  const [clientMode, setClientMode] = useState<'registered' | 'custom'>('registered')
  const [selectedClientId, setSelectedClientId] = useState('none')
  const [customClientName, setCustomClientName] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('DINHEIRO')

  const [form, setForm] = useState({
    amount: '',
    due_date: new Date().toISOString().split('T')[0],
    notes: '',
  })

  const generatedDescription = useMemo(() => {
    let cName = customClientName
    if (clientMode === 'registered' && selectedClientId !== 'none') {
      const c = clients?.find((client: any) => client.id === selectedClientId)
      if (c) cName = c.name
    }
    return `(${paymentMethod}) - ${cName || 'Sem Nome'} (MANUAL)`
  }, [clientMode, selectedClientId, customClientName, paymentMethod, clients])

  const openSheet = (p: any = null) => {
    if (p) {
      setEditing(p)
      // Try to parse standard description (FORMAT) - NAME (ORIGIN)
      const match = p.description?.match(/^\((.*?)\) - (.*?) \((MANUAL|AUTOMATICO)\)$/)

      if (match) {
        setPaymentMethod(match[1])
        const parsedName = match[2]
        const foundClient = clients?.find((c: any) => c.name === parsedName)

        if (foundClient) {
          setClientMode('registered')
          setSelectedClientId(foundClient.id)
          setCustomClientName('')
        } else {
          setClientMode('custom')
          setSelectedClientId('none')
          setCustomClientName(parsedName)
        }
      } else {
        // Fallback for old unformatted records
        setPaymentMethod('OUTROS')
        setClientMode('custom')
        setCustomClientName(p.description)
        setSelectedClientId('none')
      }

      setForm({
        amount: p.amount.toString(),
        due_date: p.due_date,
        notes: p.notes || '',
      })
    } else {
      setEditing(null)
      setClientMode('registered')
      setSelectedClientId('none')
      setCustomClientName('')
      setPaymentMethod('DINHEIRO')
      setForm({
        amount: '',
        due_date: new Date().toISOString().split('T')[0],
        notes: '',
      })
    }
    setSheetOpen(true)
  }

  const handleSave = async () => {
    const payload = { ...form, amount: Number(form.amount), description: generatedDescription }

    if (editing) {
      await supabase.from('financial_accounts').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('financial_accounts').insert([
        {
          ...payload,
          company_id: company?.id,
          type: 'receivable',
          status: 'pending',
          origin: 'manual',
        },
      ])
    }
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

    // Log received amount into transactions if it wasn't linked (manual receipt)
    if (!p.transaction_id) {
      // Parse method from description if possible
      const match = p.description?.match(/^\((.*?)\)/)
      const method = match ? match[1] : 'OUTROS'

      await supabase.from('transactions').insert([
        {
          company_id: company?.id,
          type: 'entrada',
          amount: p.amount,
          description: p.description, // Re-use the exact standardized description
          payment_method: method,
          status: 'completed',
          settled_at: new Date().toISOString(),
        },
      ])
    }
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contas a Receber</h1>
          <p className="text-muted-foreground">Gerencie seus recebíveis e pagamentos pendentes.</p>
        </div>
        <Button onClick={() => openSheet()} className="rounded-full shadow-md">
          <Plus className="w-4 h-4 mr-2" /> Novo Registro
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição (Padronizada)</TableHead>
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
                  <TableCell className="font-medium font-mono text-xs">{p.description}</TableCell>
                  <TableCell className="uppercase text-[10px] tracking-wider font-semibold text-muted-foreground">
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
                        <Button size="icon" variant="ghost" onClick={() => openSheet(p)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
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
                          <CheckCircle2 className="w-4 h-4 mr-2" /> Baixar
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
              {receivables.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhuma conta a receber pendente.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-[480px]">
          <SheetHeader>
            <SheetTitle>{editing ? 'Editar Conta a Receber' : 'Nova Conta a Receber'}</SheetTitle>
          </SheetHeader>
          <div className="space-y-5 mt-6 overflow-y-auto pb-6">
            <div className="space-y-4 p-4 bg-muted/30 border rounded-xl">
              <div className="flex items-center gap-2 text-primary text-sm font-semibold mb-2">
                <Info className="w-4 h-4" />
                Descrição Automática
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>Método de Pagamento</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3 col-span-2">
                  <Label>Vínculo do Cliente / Entidade</Label>
                  <RadioGroup
                    value={clientMode}
                    onValueChange={(v: any) => setClientMode(v)}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="registered" id="r-reg" />
                      <Label htmlFor="r-reg" className="cursor-pointer">
                        Cliente Cadastrado
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="custom" id="r-cust" />
                      <Label htmlFor="r-cust" className="cursor-pointer">
                        Outro / Avulso
                      </Label>
                    </div>
                  </RadioGroup>

                  {clientMode === 'registered' ? (
                    <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o cliente..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Selecione...</SelectItem>
                        {clients?.map((c: any) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={customClientName}
                      onChange={(e) => setCustomClientName(e.target.value)}
                      placeholder="Ex: Fornecedor, Convenio X, Maria..."
                    />
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Prévia da Descrição
                </Label>
                <div className="font-mono text-sm font-medium mt-1 bg-background p-2 rounded border break-all">
                  {generatedDescription}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Data de Vencimento</Label>
                <Input
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Observações Extras (Opcional)</Label>
              <Input
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Detalhes adicionais..."
              />
            </div>

            <Button onClick={handleSave} className="w-full h-12 mt-4 rounded-full">
              {editing ? 'Salvar Alterações' : 'Criar Registro Manual'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
