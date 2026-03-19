import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { usePasskey } from '@/contexts/PasskeyContext'
import { Loader2 } from 'lucide-react'

export function TitlePaymentDialog({ open, onOpenChange, title, onComplete }: any) {
  const { company } = usePasskey()
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('PIX')
  const [loading, setLoading] = useState(false)

  const currentOpenAmount = title?.open_amount ?? title?.original_amount - title?.paid_amount

  useEffect(() => {
    if (title && open) {
      setAmount(currentOpenAmount.toString())
      setMethod('PIX')
    }
  }, [title, open])

  const handlePay = async () => {
    if (!title || !amount) return
    const payValue = Number(amount)

    if (payValue <= 0 || payValue > currentOpenAmount) {
      return toast.error('Valor inválido. Deve ser maior que 0 e menor/igual ao saldo devedor.')
    }

    setLoading(true)

    const { error: txError } = await supabase.from('transactions').insert([
      {
        company_id: company?.id,
        type: title.type === 'receivable' ? 'inflow' : 'outflow',
        origin: title.type === 'receivable' ? 'receivable_settlement' : 'payable_settlement',
        amount: payValue,
        status: 'confirmed',
        payment_method: method,
        client_id: title.client_id,
        supplier_id: title.supplier_id,
        financial_title_id: title.id,
        description: `Baixa ${payValue < currentOpenAmount ? 'parcial' : 'integral'} de título`,
        confirmed_at: new Date().toISOString(),
      },
    ])

    if (txError) {
      setLoading(false)
      return toast.error('Erro ao registrar pagamento')
    }

    const newPaidAmount = Number(title.paid_amount) + payValue
    const newOpenAmount = title.original_amount - newPaidAmount
    const newStatus = newPaidAmount >= title.original_amount ? 'paid' : 'partial'

    await supabase
      .from('financial_titles')
      .update({
        paid_amount: newPaidAmount,
        open_amount: newOpenAmount,
        status: newStatus,
      })
      .eq('id', title.id)

    setLoading(false)
    toast.success('Pagamento registrado no caixa com sucesso')
    if (onComplete) onComplete()
    onOpenChange(false)
  }

  if (!title) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Liquidação de Título</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="bg-muted p-3 rounded-lg text-sm mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-muted-foreground">Valor Original:</span>
              <span className="font-medium">R$ {title.original_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Saldo Devedor Atual:</span>
              <span className="font-bold text-primary">R$ {currentOpenAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Valor a ser pago (R$)</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              max={currentOpenAmount}
            />
            {Number(amount) < currentOpenAmount && Number(amount) > 0 && (
              <p className="text-xs text-amber-600 font-medium">
                Liquidação parcial. O título permanecerá aberto com o saldo restante de R${' '}
                {(currentOpenAmount - Number(amount)).toFixed(2)}.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Forma de Pagamento</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PIX">PIX</SelectItem>
                <SelectItem value="DINHEIRO">Dinheiro</SelectItem>
                <SelectItem value="DEBITO">Débito</SelectItem>
                <SelectItem value="CREDITO">Crédito</SelectItem>
                <SelectItem value="OUTROS">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handlePay} disabled={loading} className="w-full mt-4 h-12 text-lg">
            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            Confirmar Recebimento
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
