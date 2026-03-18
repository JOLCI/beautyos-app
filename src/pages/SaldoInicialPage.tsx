import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { usePasskey } from '@/contexts/PasskeyContext'
import { formatFinancialDescription } from '@/lib/financial'

export default function SaldoInicialPage() {
  const { company } = usePasskey()
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [type, setType] = useState<'entrada' | 'saida'>('entrada')

  const handleAdjust = async () => {
    if (!amount || !reason) return toast.error('Preencha os campos obrigatórios.')

    const desc = formatFinancialDescription('OUTROS', `Ajuste: ${reason}`, false)

    await supabase.from('transactions').insert([
      {
        company_id: company?.id,
        type,
        amount: Number(amount),
        description: desc,
        status: 'completed',
        payment_method: 'OUTROS',
      },
    ])

    toast.success('Ajuste de caixa registrado com sucesso.')
    setAmount('')
    setReason('')
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="bg-destructive/10 text-destructive font-bold p-4 rounded-xl flex items-center gap-3 border border-destructive/20">
        <AlertTriangle className="w-6 h-6 shrink-0" />
        <p>Área Sensível. Operações aqui afetam o fluxo de caixa diretamente.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ajuste Manual de Caixa</CardTitle>
          <CardDescription>Insira saldos iniciais ou corrija diferenças de caixa.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={type === 'entrada' ? 'default' : 'outline'}
              onClick={() => setType('entrada')}
              className={type === 'entrada' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              <ArrowUpRight className="w-4 h-4 mr-2" /> Adicionar Saldo
            </Button>
            <Button
              variant={type === 'saida' ? 'destructive' : 'outline'}
              onClick={() => setType('saida')}
            >
              <ArrowDownRight className="w-4 h-4 mr-2" /> Subtrair Saldo
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Valor do Ajuste (R$)</Label>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Motivo / Observação</Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Saldo Inicial do Dia"
            />
          </div>

          <Button className="w-full h-12" onClick={handleAdjust}>
            Aplicar Ajuste no Caixa
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
