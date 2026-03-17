import { useState, useMemo, useEffect } from 'react'
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
import { CheckCircle2, QrCode, Loader2, Copy } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import { usePasskey } from '@/contexts/PasskeyContext'
import { useQuery } from '@/hooks/use-query'

export function CheckoutSheet({
  open,
  onOpenChange,
  items,
  professionalId,
  initialClientId,
  appointmentId,
  onComplete,
}: any) {
  const { company } = usePasskey()
  const { data: clients } = useQuery<any>('clients', { match: { is_active: true } })
  const { data: gateways } = useQuery<any>('pix_gateways', { match: { is_active: true } })

  const [clientId, setClientId] = useState('')
  const [method, setMethod] = useState('pix')
  const [discount, setDiscount] = useState('0')
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  })

  const [status, setStatus] = useState<'idle' | 'waiting' | 'success'>('idle')
  const [pixPayload, setPixPayload] = useState('')

  useEffect(() => {
    if (initialClientId && open && !clientId) setClientId(initialClientId)
  }, [initialClientId, open])

  const activeClient = useMemo(
    () => clients.find((c: any) => c.id === clientId),
    [clientId, clients],
  )

  const pricedItems = useMemo(() => {
    return items.map((it: any) => {
      const customPrice = activeClient?.special_prices?.[it.id]
      return {
        ...it,
        originalPrice: it.price,
        finalPrice: customPrice !== undefined ? customPrice : it.price,
        hasCustomPrice: customPrice !== undefined,
      }
    })
  }, [items, activeClient])

  const totalOriginal = pricedItems.reduce((acc: any, i: any) => acc + i.originalPrice, 0)
  const total = pricedItems.reduce((acc: any, i: any) => acc + i.finalPrice, 0)
  const finalTotal = total - Number(discount || 0)
  const totalDiscount = totalOriginal - total + Number(discount || 0)

  const deductStock = async (serviceId: string, quantity: number) => {
    const { data: inv } = await supabase
      .from('inventory')
      .select('id, quantity')
      .eq('service_id', serviceId)
      .single()
    if (inv) {
      if (inv.quantity < quantity) toast.warning(`Atenção: Estoque ficará negativo.`)
      await supabase
        .from('inventory')
        .update({ quantity: inv.quantity - quantity })
        .eq('id', inv.id)
      await supabase
        .from('inventory_movements')
        .insert([
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
          user_id: (await supabase.auth.getUser()).data.user?.id,
        },
      ])
      .select()
      .single()

    if (isPending) {
      await supabase.from('financial_accounts').insert([
        {
          company_id: company?.id,
          type: 'receivable',
          origin: 'pdv',
          description: `Recebível Automático (${methodUsed.toUpperCase()})`,
          amount: finalTotal,
          due_date: dueDate,
          transaction_id: tx?.id,
          status: 'pending',
        },
      ])
    }

    if (appointmentId) {
      await supabase.from('appointments').update({ status: 'finalizado' }).eq('id', appointmentId)
    }

    // Stock
    for (const item of pricedItems) {
      if (item.type === 'product') await deductStock(item.id, 1)
      else if (item.is_composite && item.composite_items) {
        for (const child of item.composite_items) await deductStock(child.id, child.quantity || 1)
      }
    }

    // Commissions
    if (professionalId) {
      const { data: rules } = await supabase
        .from('commission_rules')
        .select('*')
        .eq('professional_id', professionalId)
      for (const item of pricedItems) {
        if (item.type === 'service') {
          const rule = rules?.find((r) => r.service_id === item.id)
          const pct = rule?.percentage || 0
          const val = rule?.fixed_value || 0
          const amount = pct > 0 ? (item.finalPrice * pct) / 100 : val
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

    setStatus('success')
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
            toast.error('PIX não confirmado pelo gateway')
            setStatus('idle')
            setPixPayload('')
          }
        }, 3000)
      } else {
        toast.error('Erro ao gerar PIX')
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
            <h3 className="text-2xl font-bold">Transação Finalizada!</h3>
            <p className="text-muted-foreground mt-2">
              Os registros foram atualizados com sucesso.
            </p>
            <Button className="mt-8 rounded-full px-8" onClick={() => onOpenChange(false)}>
              Concluir e Voltar
            </Button>
          </div>
        ) : status === 'waiting' && method === 'pix' && pixPayload ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
            <h3 className="text-xl font-bold">Aguardando Pagamento PIX</h3>
            <div className="p-4 bg-white rounded-xl shadow-sm border">
              <QrCode className="w-48 h-48 text-black" />
            </div>
            <div className="bg-muted p-3 w-full rounded-lg text-center font-mono text-xs break-all relative group cursor-pointer hover:bg-muted/80">
              {pixPayload}
              <Copy className="w-4 h-4 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" />
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
            <div className="bg-muted/50 p-4 rounded-xl border">
              <div className="space-y-3 mb-4">
                {pricedItems.map((it: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex flex-col text-sm border-b border-border/50 pb-2 last:border-0"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{it.name}</span>
                      {it.hasCustomPrice ? (
                        <div className="text-right flex items-center gap-2">
                          <span className="line-through text-muted-foreground text-xs">
                            R$ {it.originalPrice.toFixed(2)}
                          </span>
                          <span className="font-bold text-primary">
                            R$ {it.finalPrice.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span>R$ {it.finalPrice.toFixed(2)}</span>
                      )}
                    </div>
                    {it.hasCustomPrice && (
                      <div className="flex justify-between items-center mt-1">
                        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">
                          Preço Especial Aplicado
                        </Badge>
                        <span className="text-green-600 font-medium text-[10px]">
                          - R$ {(it.originalPrice - it.finalPrice).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <Separator className="my-3" />
              <div className="flex justify-between items-center mt-2">
                <span className="text-muted-foreground">Desconto Extra (R$)</span>
                <Input
                  type="number"
                  className="w-24 h-8 text-right"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                />
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-xs text-green-600 mt-2 font-medium">
                  <span>Total em Descontos</span>
                  <span>- R$ {totalDiscount.toFixed(2)}</span>
                </div>
              )}
              <Separator className="my-3" />
              <div className="flex justify-between text-xl font-bold">
                <span>Total Final</span>
                <span className="text-primary">R$ {finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <RadioGroup value={method} onValueChange={setMethod} className="grid grid-cols-3 gap-3">
              {[
                { id: 'pix', l: 'PIX Auto' },
                { id: 'pix_simples', l: 'PIX Simples' },
                { id: 'credit', l: 'Crédito' },
                { id: 'debit', l: 'Débito' },
                { id: 'cash', l: 'Dinheiro' },
                { id: 'pix_agendado', l: 'Agendado' },
                { id: 'convenio', l: 'Convênio' },
              ].map((o) => (
                <div
                  key={o.id}
                  className={cn(
                    'border-2 rounded-xl p-3 text-center cursor-pointer flex flex-col items-center justify-center min-h-[4rem] transition-colors',
                    method === o.id ? 'border-primary bg-primary/5 text-primary' : '',
                  )}
                  onClick={() => setMethod(o.id)}
                >
                  <RadioGroupItem value={o.id} id={o.id} className="sr-only" />
                  <Label className="cursor-pointer font-medium text-xs text-center leading-tight">
                    {o.l}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {['pix_agendado', 'convenio'].includes(method) && (
              <div className="space-y-2 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl animate-fade-in">
                <Label className="text-amber-800">Data de Vencimento da Cobrança</Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="bg-background"
                />
                <p className="text-[10px] text-amber-700 leading-tight">
                  Um registro será criado no Contas a Receber com o status pendente.
                </p>
              </div>
            )}

            {method === 'pix_simples' && (
              <div className="space-y-2 p-4 border rounded-xl bg-muted/50 text-center animate-fade-in">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                  Chave PIX da Empresa
                </Label>
                <div className="font-mono font-bold text-lg py-2 select-all">
                  {gateways?.[0]?.pix_key || 'Chave não cadastrada'}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Confira o recebimento no seu banco antes de finalizar.
                </p>
              </div>
            )}

            <Button
              onClick={handleFinish}
              disabled={status === 'waiting'}
              className="w-full h-14 text-lg rounded-full shadow-elevation"
            >
              {status === 'waiting' ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Finalizar Atendimento
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
