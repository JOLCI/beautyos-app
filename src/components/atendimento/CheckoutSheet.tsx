import { useState, useMemo } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CheckCircle2, QrCode, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import { usePasskey } from '@/contexts/PasskeyContext'
import { useQuery } from '@/hooks/use-query'

export function CheckoutSheet({
  open,
  onOpenChange,
  total: initialTotal,
  items,
  professionalId,
  onComplete,
}: any) {
  const { company } = usePasskey()
  const { data: clients } = useQuery<any>('clients', { match: { is_active: true } })
  const [clientId, setClientId] = useState('')
  const [method, setMethod] = useState('pix')
  const [discount, setDiscount] = useState('0')
  const [status, setStatus] = useState<'idle' | 'waiting' | 'success'>('idle')
  const [pixPayload, setPixPayload] = useState('')

  const activeClient = useMemo(
    () => clients.find((c: any) => c.id === clientId),
    [clientId, clients],
  )

  const pricedItems = useMemo(() => {
    return items.map((it: any) => {
      const customPrice = activeClient?.special_prices?.[it.id]
      return {
        ...it,
        finalPrice: customPrice !== undefined ? customPrice : it.price,
        hasCustomPrice: customPrice !== undefined,
      }
    })
  }, [items, activeClient])

  const total = pricedItems.reduce((acc: any, i: any) => acc + i.finalPrice, 0)
  const finalTotal = total - Number(discount || 0)

  const deductStock = async (serviceId: string, quantity: number) => {
    const { data: inv } = await supabase
      .from('inventory')
      .select('id, quantity')
      .eq('service_id', serviceId)
      .single()
    if (inv) {
      if (inv.quantity < quantity) toast.warning(`Estoque baixo para item.`)
      await supabase
        .from('inventory')
        .update({ quantity: inv.quantity - quantity })
        .eq('id', inv.id)
      await supabase.from('inventory_movements').insert([
        {
          company_id: company?.id,
          inventory_id: inv.id,
          type: 'out',
          quantity,
          reason: 'Venda PDV',
        },
      ])
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

    for (const item of pricedItems) {
      if (item.type === 'product') {
        await deductStock(item.id, 1)
      } else if (item.is_composite && item.composite_items) {
        for (const child of item.composite_items) {
          await deductStock(child.id, child.quantity || 1)
        }
      }
    }

    if (professionalId) {
      const { data: rules } = await supabase
        .from('commission_rules')
        .select('*')
        .eq('professional_id', professionalId)
      for (const item of pricedItems) {
        if (item.type === 'service') {
          const rule = rules?.find((r) => r.service_id === item.id)
          const pct = rule?.percentage || 0
          const amount = (item.finalPrice * pct) / 100
          if (amount > 0) {
            await supabase
              .from('commissions')
              .insert([
                {
                  company_id: company?.id,
                  professional_id: professionalId,
                  amount,
                  status: 'pending',
                },
              ])
          }
        }
      }
    }

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
        setTimeout(async () => {
          const { data: checkData } = await supabase.functions.invoke('check-pix-status', {
            body: { transactionId: 'test' },
          })
          if (checkData?.status === 'paid') await finalizeTransaction(method, false)
          else {
            toast.error('PIX não confirmado')
            setStatus('idle')
            setPixPayload('')
          }
        }, 3000)
      } else {
        toast.error('Erro PIX')
        setStatus('idle')
      }
    } else {
      await finalizeTransaction(method, method === 'pix_agendado' || method === 'convenio')
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-[560px] w-full flex flex-col h-full p-0">
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
          <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
            <h3 className="text-xl font-bold">Aguardando PIX</h3>
            <div className="p-4 bg-white rounded-xl shadow-sm border">
              <QrCode className="w-48 h-48 text-black" />
            </div>
            <div className="bg-muted p-3 w-full rounded-lg text-center font-mono text-xs break-all">
              {pixPayload}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="space-y-2">
              <Label>Vincular a um Cliente</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="bg-muted p-4 rounded-xl">
              <div className="space-y-2 mb-4">
                {pricedItems.map((it: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <span>
                      {it.name}{' '}
                      {it.hasCustomPrice && (
                        <Badge className="ml-2 bg-amber-500 text-[10px]">Preço Especial</Badge>
                      )}
                    </span>
                    <span>R$ {it.finalPrice.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <Separator className="my-3" />
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
                    'border-2 rounded-xl p-3 text-center cursor-pointer',
                    method === o.id ? 'border-primary bg-primary/5 text-primary' : '',
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
              className="w-full h-14 text-lg rounded-full"
            >
              Confirmar Pagamento
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
