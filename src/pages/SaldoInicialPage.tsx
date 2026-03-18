import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import { usePasskey } from '@/contexts/PasskeyContext'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Wallet, Info } from 'lucide-react'

export default function SaldoInicialPage() {
  const { company } = usePasskey()
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('inflow')
  const [notes, setNotes] = useState('')

  const handleSave = async () => {
    if (!amount || Number(amount) <= 0) {
      return toast.error('Informe um valor válido.')
    }

    const payload = {
      company_id: company?.id,
      type: type,
      origin: 'adjustment',
      amount: Number(amount),
      status: 'confirmed',
      payment_method: 'OUTROS',
      description: `Ajuste de Saldo / Caixa Inicial${notes ? ` - ${notes}` : ''}`,
      transaction_date: new Date().toISOString().split('T')[0],
      confirmed_at: new Date().toISOString(),
    }

    const { error } = await supabase.from('transactions').insert([payload])

    if (error) {
      toast.error('Erro ao ajustar saldo.')
      console.error(error)
    } else {
      toast.success('Ajuste de saldo lançado com sucesso.')
      setAmount('')
      setNotes('')
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto mt-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ajuste de Saldo</h1>
        <p className="text-muted-foreground">
          Registre o saldo inicial ou faça aportes manuais no caixa.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Lançamento de Ajuste
          </CardTitle>
          <CardDescription>
            Este valor será somado ou subtraído do fluxo de caixa atual como uma transação
            confirmada do tipo "Ajuste".
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Ajuste</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inflow">Entrada (+)</SelectItem>
                  <SelectItem value="outflow">Saída (-)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Justificativa / Observação</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Saldo em gaveta do dia anterior"
            />
          </div>

          <div className="bg-muted p-4 rounded-lg flex items-start gap-3 text-sm text-muted-foreground">
            <Info className="w-5 h-5 shrink-0 text-primary" />
            <p>
              Ajustes de saldo não exigem vínculo com cliente ou fornecedor e entrarão diretamente
              nos relatórios financeiros como origem <strong>"Ajuste"</strong>, garantindo total
              rastreabilidade na auditoria do sistema.
            </p>
          </div>

          <Button onClick={handleSave} className="w-full h-12 text-base font-semibold">
            Confirmar Lançamento
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
