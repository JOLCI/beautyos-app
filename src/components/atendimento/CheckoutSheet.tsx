import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { CheckCircle2, QrCode, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import { usePasskey } from '@/contexts/PasskeyContext'

export function CheckoutSheet({
  open,
  onOpenChange,
  total,
  items,
  professionalId,
  onComplete,
}: any) {
  const { company } = usePasskey()
  const [method, setMethod] = useState('pix')
  const [discount, setDiscount] = useState('0')
  const [status, setStatus] = useState<'idle' | 'waiting' | 'success'>('idle')
  const [pixPayload, setPixPayload] = useState('')

  const finalTotal = total - Number(discount || 0)

  const calculateCommissions = async (appointmentId?: string) => {
    if (!professionalId) return
    const { data: rules } = await supabase
      .from('commission_rules')
      .select('*')
      .eq('professional_id', professionalId)
    for (const item of items) {
      if (item.type === 'service') {
        const rule = rules?.find((r) => r.service_id === item.id)
        const pct = rule?.percentage || 0
        const amount = (item.price * pct) / 100
        if (amount > 0) {
          await supabase.from('commissions').insert([
            {
              company_id: company?.id,
              professional_id: professionalId,
              appointment_id: appointmentId || null,
              amount,
              status: 'pending',
            },
          ])
        }
      }
    }
  }

  const finalizeTransaction = async (methodUsed: string, isPending: boolean) => {
    const { data: tx } = await supabase
      .from('transactions')
      .insert([
        {
          company_id: company?.id,
          type: 'entrada',
          amount: finalTotal,
          description: `Checkout PDV - ${items.length} itens`,
          payment_method: methodUsed,
          status: isPending ? 'pending' : 'completed',
        },
      ])
      .select()
      .single()

    if (isPending) {
      await supabase.from('financial_accounts').insert([
        {
          company_id: company?.id,
          type: 'receivable',
          description: `Recebível - ${methodUsed}`,
          amount: finalTotal,
          due_date: new Date(Date.now() + 86400000).toISOString(),
          transaction_id: tx?.id,
          status: 'pending',
        },
      ])
    }

    for (const item of items) {
      if (item.type === 'product') {
        const { data: inv } = await supabase
          .from('inventory')
          .select('id, quantity')
          .eq('service_id', item.id)
          .single()
        if (inv) {
          if (inv.quantity < 1) toast.warning(`Estoque insuficiente para ${item.name}`)
          await supabase
            .from('inventory')
            .update({ quantity: inv.quantity - 1 })
            .eq('id', inv.id)
          await supabase.from('inventory_movements').insert([
            {
              company_id: company?.id,
              inventory_id: inv.id,
              type: 'out',
              quantity: 1,
              reason: 'Venda PDV',
            },
          ])
        }
      }
    }

    await calculateCommissions()
    setStatus('success')
    toast.success('Atendimento Finalizado')
    if (onComplete) onComplete()
  }

  const handleFinish = async () => {
    setStatus('waiting')
    if (method === 'pix') {
      const { data } = await supabase.functions.invoke('generate-pix', {
        body: { amount: finalTotal },
      })
      if (data?.success) {
        setPixPayload(data.payload)
        // Simulate PIX validation after 3s
        setTimeout(async () => {
          const { data: checkData } = await supabase.functions.invoke('check-pix-status', {
            body: { transactionId: 'test' },
          })
          if (checkData?.status === 'paid') {
            await finalizeTransaction(method, false)
          } else {
            toast.error('Pagamento PIX não confirmado')
            setStatus('idle')
            setPixPayload('')
          }
        }, 3000)
      } else {
        toast.error('Erro ao gerar PIX')
        setStatus('idle')
      }
    } else {
      const isPending = method === 'pix_agendado' || method === 'convenio'
      await finalizeTransaction(method, isPending)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[560px] w-full flex flex-col h-full p-0">
        <div className="p-6 pb-2 border-b">
          <SheetHeader>
            <SheetTitle>Finalizar Cobrança</SheetTitle>
          </SheetHeader>
        </div>
        {status === 'success' ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <CheckCircle2 className="w-16 h-16 text-green-600 mb-4 animate-in zoom-in" />
            <h3 className="text-2xl font-bold">Tudo Certo!</h3>
            <Button className="mt-8 rounded-full px-8" onClick={() => onOpenChange(false)}>
              Concluir
            </Button>
          </div>
        ) : status === 'waiting' && method === 'pix' && pixPayload ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold">Aguardando Pagamento PIX</h3>
              <p className="text-muted-foreground">Valor: R$ {finalTotal.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-white rounded-xl shadow-sm border">
              <QrCode className="w-48 h-48 text-black" />
            </div>
            <div className="bg-muted p-3 w-full rounded-lg text-center font-mono text-xs break-all border">
              {pixPayload}
            </div>
            <div className="flex items-center gap-2 text-primary font-medium">
              <Loader2 className="w-5 h-5 animate-spin" /> Verificando status...
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="bg-muted p-4 rounded-xl">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-muted-foreground">Desconto (R$)</span>
                <Input
                  type="number"
                  className="w-24 h-8 text-right"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                />
              </div>
              <Separator className="my-3" />
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-primary">R$ {finalTotal.toFixed(2)}</span>
              </div>
            </div>
            <RadioGroup value={method} onValueChange={setMethod} className="grid grid-cols-2 gap-3">
              {[
                { id: 'pix', l: 'PIX' },
                { id: 'credit', l: 'Crédito' },
                { id: 'debit', l: 'Débito' },
                { id: 'cash', l: 'Dinheiro' },
                { id: 'pix_agendado', l: 'PIX Agendado' },
                { id: 'convenio', l: 'Convênio' },
              ].map((o) => (
                <div
                  key={o.id}
                  className={cn(
                    'border-2 rounded-xl p-3 text-center cursor-pointer transition-colors',
                    method === o.id
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'hover:border-muted-foreground/30',
                  )}
                  onClick={() => setMethod(o.id)}
                >
                  <RadioGroupItem value={o.id} id={o.id} className="sr-only" />
                  <Label className="cursor-pointer font-medium">{o.l}</Label>
                </div>
              ))}
            </RadioGroup>
            <Button
              onClick={handleFinish}
              disabled={status === 'waiting'}
              className="w-full h-14 text-lg rounded-full mt-4"
            >
              {status === 'waiting' ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                'Confirmar Pagamento'
              )}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
