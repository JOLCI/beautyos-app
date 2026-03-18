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
import { CheckCircle2, QrCode, Loader2, Copy, MessageSquare, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import { usePasskey } from '@/contexts/PasskeyContext'
import { useQuery } from '@/hooks/use-query'
import { useAuth } from '@/hooks/use-auth'

export function CheckoutSheet({
  open,
  onOpenChange,
  items,
  initialClientId,
  appointmentId,
  onComplete,
}: any) {
  const { company } = usePasskey()
  const { profile } = useAuth()
  const { data: clients } = useQuery<any>('clients', { match: { is_active: true } })
  const { data: gateways } = useQuery<any>('pix_gateways', { match: { is_active: true } })

  const [clientId, setClientId] = useState('')
  const [method, setMethod] = useState('PIX')
  const [discount, setDiscount] = useState('0')

  const [installments, setInstallments] = useState('1')
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  })

  const [status, setStatus] = useState<'idle' | 'waiting' | 'success'>('idle')
  const [pixPayload, setPixPayload] = useState('')
  const [sendingWa, setSendingWa] = useState(false)

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
    const now = new Date().toISOString()
    const isImmediate = ['PIX', 'DINHEIRO', 'DEBITO', 'CREDITO'].includes(methodUsed)
    const txStatus = isImmediate ? 'completed' : 'pending'
    const finStatus = isImmediate ? 'paid' : 'pending'
    const settledAt = isImmediate ? now : null

    let finalDesc = `Checkout PDV - ${items.length} itens`
    if (methodUsed === 'CREDITO' && Number(installments) > 1) {
      finalDesc += ` (${installments}x)`
    }

    const { data: tx } = await supabase
      .from('transactions')
      .insert([
        {
          company_id: company?.id,
          type: 'entrada',
          amount: finalTotal,
          description: finalDesc,
          payment_method: methodUsed,
          status: txStatus,
          user_id: profile?.id,
          settled_at: settledAt,
        },
      ])
      .select()
      .single()

    // Always create a financial_accounts record to accurately track receivables (paid or pending)
    await supabase.from('financial_accounts').insert([
      {
        company_id: company?.id,
        type: 'receivable',
        origin: 'pdv',
        description: `Recebível Automático (${methodUsed}) - ${activeClient?.name || 'Cliente Avulso'}`,
        amount: finalTotal,
        due_date: isImmediate ? now.split('T')[0] : dueDate,
        settled_at: settledAt,
        transaction_id: tx?.id,
        status: finStatus,
      },
    ])

    if (appointmentId) {
      await supabase.from('appointments').update({ status: 'finalizado' }).eq('id', appointmentId)
    }

    for (const item of pricedItems) {
      if (item.type === 'product') await deductStock(item.id, 1)
      else if (item.is_composite && item.composite_items) {
        for (const child of item.composite_items) await deductStock(child.id, child.quantity || 1)
      }
    }

    setStatus('success')
    if (onComplete) onComplete()
  }

  const handleFinish = async (forceManual = false) => {
    setStatus('waiting')
    if (method === 'PIX' && !forceManual) {
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
            toast.error('PIX não confirmado automaticamente pelo gateway.')
            setStatus('idle')
            setPixPayload('')
          }
        }, 3000)
      } else {
        toast.error('Erro ao gerar PIX dinâmico.')
        setStatus('idle')
      }
    } else {
      await finalizeTransaction(method, method === 'PIX AGENDADO' || method === 'CONVENIO')
    }
  }

  const handleSendWhatsAppPix = async () => {
    if (!activeClient?.phone) return toast.error('Selecione um cliente com telefone cadastrado.')
    setSendingWa(true)

    let msg = `Olá [NOME_CLIENTE], o valor do seu atendimento é R$ [VALOR]. Nossa chave PIX é: [CHAVE_PIX]. Por favor envie o comprovante.`

    msg = msg.replace(/\[NOME_CLIENTE\]/g, activeClient.name)
    msg = msg.replace(/\[VALOR\]/g, finalTotal.toFixed(2))
    msg = msg.replace(/\[CHAVE_PIX\]/g, gateways?.[0]?.pix_key || 'não cadastrada')

    await supabase.functions.invoke('send-whatsapp', {
      body: { to: activeClient.phone, message: msg },
    })
    toast.success('Cobrança PIX enviada no WhatsApp')
    setSendingWa(false)
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
              Os registros financeiros foram atualizados com sucesso.
            </p>
            <Button className="mt-8 rounded-full px-8" onClick={() => onOpenChange(false)}>
              Concluir e Voltar
            </Button>
          </div>
        ) : status === 'waiting' && method === 'PIX' && pixPayload ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
            <h3 className="text-xl font-bold">Aguardando Pagamento PIX</h3>
            <div className="p-4 bg-white rounded-xl shadow-sm border">
              <QrCode className="w-48 h-48 text-black" />
            </div>
            <div className="bg-muted p-3 w-full rounded-lg text-center font-mono text-xs break-all relative group cursor-pointer hover:bg-muted/80">
              {pixPayload}
              <Copy className="w-4 h-4 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <Button
              variant="outline"
              onClick={() => handleFinish(true)}
              className="mt-4 text-muted-foreground"
            >
              <AlertCircle className="w-4 h-4 mr-2" /> Forçar Conclusão (Pago Manualmente)
            </Button>
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
                  </div>
                ))}
              </div>
              <Separator className="my-3" />
              <div className="flex justify-between items-center mt-2">
                <span className="text-muted-foreground text-sm">Desconto Extra (R$)</span>
                <Input
                  type="number"
                  className="w-24 h-8 text-right"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                />
              </div>
              <Separator className="my-3" />
              <div className="flex justify-between text-xl font-bold">
                <span>Total Final</span>
                <span className="text-primary">R$ {finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <RadioGroup value={method} onValueChange={setMethod} className="grid grid-cols-3 gap-3">
              {[
                { id: 'PIX', l: 'PIX' },
                { id: 'PIX AGENDADO', l: 'PIX AGENDADO' },
                { id: 'DINHEIRO', l: 'DINHEIRO' },
                { id: 'DEBITO', l: 'DÉBITO' },
                { id: 'CREDITO', l: 'CRÉDITO' },
                { id: 'CONVENIO', l: 'CONVÊNIO' },
              ].map((o) => (
                <div
                  key={o.id}
                  onClick={() => setMethod(o.id)}
                  className={cn(
                    'border-2 rounded-xl p-3 text-center cursor-pointer flex items-center justify-center min-h-[3.5rem] transition-colors',
                    method === o.id ? 'border-primary bg-primary/5 text-primary' : '',
                  )}
                >
                  <RadioGroupItem value={o.id} id={o.id} className="sr-only" />
                  <Label className="cursor-pointer font-bold text-[11px] sm:text-xs text-center leading-tight">
                    {o.l}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {method === 'CREDITO' && (
              <div className="space-y-2 p-4 border rounded-xl bg-muted/20 animate-fade-in mt-3">
                <Label>Número de Parcelas</Label>
                <Input
                  type="number"
                  min="1"
                  value={installments}
                  onChange={(e) => setInstallments(e.target.value)}
                />
              </div>
            )}
            {(method === 'PIX AGENDADO' || method === 'CONVENIO') && (
              <div className="space-y-2 p-4 border rounded-xl bg-muted/20 animate-fade-in mt-3">
                <Label>Data de Vencimento</Label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            )}

            {method === 'PIX' && (
              <div className="space-y-3 p-4 border rounded-xl bg-primary/5 text-center animate-fade-in mt-3">
                <Label className="text-primary font-semibold text-xs uppercase tracking-wider">
                  Chave PIX Manual
                </Label>
                <div className="font-mono font-bold text-sm sm:text-base select-all bg-background py-2 rounded border">
                  {gateways?.[0]?.pix_key || 'Não cadastrada'}
                </div>
                <Button
                  variant="outline"
                  className="w-full bg-white h-10"
                  onClick={handleSendWhatsAppPix}
                  disabled={sendingWa}
                >
                  {sendingWa ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <MessageSquare className="w-4 h-4 mr-2 text-green-600" />
                  )}
                  Enviar Chave por WhatsApp
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => handleFinish(true)}
                  className="w-full h-8 text-xs text-muted-foreground mt-2"
                >
                  Pular Gateway e Concluir Venda
                </Button>
              </div>
            )}

            <Button
              onClick={() => handleFinish(false)}
              disabled={status === 'waiting'}
              className="w-full h-14 text-lg rounded-full shadow-elevation mt-4"
            >
              {status === 'waiting' ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              {method === 'PIX' ? 'Gerar PIX Automático' : 'Finalizar Atendimento'}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
