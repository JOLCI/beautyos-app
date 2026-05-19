import { useState, useMemo, useEffect } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CheckCircle2,
  QrCode,
  Loader2,
  Copy,
  AlertCircle,
  Info,
  CalendarClock,
  Camera,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import { usePasskey } from '@/contexts/PasskeyContext'
import { useQuery } from '@/hooks/use-query'
import { useAuth } from '@/hooks/use-auth'
import { resolveAndScheduleWhatsApp } from '@/lib/whatsapp'

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
  const { data: appointments } = useQuery<any>('appointments')

  const [clientId, setClientId] = useState('avulso')
  const [method, setMethod] = useState('PIX')
  // Estado para armazenar o valor do desconto inserido
  const [discount, setDiscount] = useState('0')
  // Estado para definir se o desconto é em valor fixo (R$) ou percentual (%)
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('fixed')

  const [installments, setInstallments] = useState('1')
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  })

  const [status, setStatus] = useState<'idle' | 'waiting' | 'success'>('idle')
  const [pixPayload, setPixPayload] = useState('')
  const [provisionalCreated, setProvisionalCreated] = useState(false)
  const [recurrenceDate, setRecurrenceDate] = useState('')
  const [recurrenceTime, setRecurrenceTime] = useState('09:00')
  const [photoData, setPhotoData] = useState<string | null>(null)

  useEffect(() => {
    if (initialClientId && open && clientId === 'avulso') setClientId(initialClientId)
    if (!open) {
      setStatus('idle')
      setMethod('PIX')
      setClientId('avulso')
      setDiscount('0')
      setProvisionalCreated(false)
      setRecurrenceDate('')
      setRecurrenceTime('09:00')
      setPhotoData(null)
    }
  }, [initialClientId, open])

  const actualClientId = clientId === 'avulso' ? '' : clientId

  // Função para processar o upload da imagem de evidência (Câmera ou Galeria)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setPhotoData(ev.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const activeClient = useMemo(
    () => clients.find((c: any) => c.id === actualClientId),
    [actualClientId, clients],
  )

  const pricedItems = useMemo(
    () =>
      items.map((it: any) => {
        const customPrice = activeClient?.special_prices?.[it.id]
        return {
          ...it,
          originalPrice: it.price,
          finalPrice: customPrice !== undefined ? customPrice : it.price,
          hasCustomPrice: customPrice !== undefined,
        }
      }),
    [items, activeClient],
  )

  // Calcula o valor total bruto dos itens no carrinho
  const total = pricedItems.reduce((acc: any, i: any) => acc + i.finalPrice, 0)

  // Calcula o valor real do desconto a ser aplicado
  const discountValue =
    discountType === 'percentage' ? total * (Number(discount || 0) / 100) : Number(discount || 0)

  // Calcula o total final subtraindo o desconto do valor bruto
  const finalTotal = Math.max(0, total - discountValue)

  const isScheduled = method === 'PIX AGENDADO' || method === 'CONVENIO'
  const canFinish = pricedItems.length > 0 && (!isScheduled || actualClientId)

  const isNewClient = useMemo(() => {
    if (!actualClientId || !appointments) return false
    const past = appointments.filter(
      (a: any) =>
        a.client_id === actualClientId && a.status === 'finalizado' && a.id !== appointmentId,
    )
    return past.length === 0
  }, [actualClientId, appointments, appointmentId])

  const newServices = useMemo(() => {
    if (!actualClientId || !appointments || pricedItems.length === 0) return []
    const past = appointments.filter(
      (a: any) =>
        a.client_id === actualClientId && a.status === 'finalizado' && a.id !== appointmentId,
    )
    const pastServiceIds = new Set(
      past.flatMap((a: any) =>
        a.service_ids?.length ? a.service_ids : a.service_id ? [a.service_id] : [],
      ),
    )

    return pricedItems
      .filter((i: any) => !pastServiceIds.has(i.id))
      .map((i: any) => i.name)
      .filter(Boolean)
  }, [actualClientId, pricedItems, appointments, appointmentId])

  const minRecurrence = useMemo(() => {
    let min = 0
    pricedItems.forEach((i: any) => {
      if (i.recurrence_days > 0) {
        if (min === 0 || i.recurrence_days < min) min = i.recurrence_days
      }
    })
    return min
  }, [pricedItems])

  const suggestedDate = useMemo(() => {
    if (minRecurrence === 0) return ''
    const d = new Date()
    d.setDate(d.getDate() + minRecurrence)
    return d.toISOString().split('T')[0]
  }, [minRecurrence])

  // Preenche a data de recorrência inicialmente com a data sugerida
  useEffect(() => {
    if (suggestedDate && !recurrenceDate) {
      setRecurrenceDate(suggestedDate)
    }
  }, [suggestedDate, recurrenceDate])

  // Função para deduzir o estoque de um produto ou composição
  const deductStock = async (serviceId: string, quantity: number) => {
    const { data: inv } = await supabase
      .from('inventory')
      .select('id, quantity')
      .eq('service_id', serviceId)
      .maybeSingle()

    if (inv) {
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

  // Função responsável por consolidar a transação financeira no banco de dados e dar baixa nos itens
  const finalizeTransaction = async (methodUsed: string, isPending: boolean) => {
    const now = new Date().toISOString()
    const isImmediate = ['PIX', 'DINHEIRO', 'DEBITO', 'CREDITO'].includes(methodUsed)

    let titleId = null

    if (actualClientId) {
      const { data: title } = await supabase
        .from('financial_titles')
        .insert([
          {
            company_id: company?.id,
            type: 'receivable',
            status: isImmediate ? 'paid' : 'open',
            original_amount: finalTotal,
            paid_amount: isImmediate ? finalTotal : 0,
            due_date: isImmediate ? now.split('T')[0] : dueDate,
            description: `Checkout PDV - ${items.length} itens`,
            client_id: actualClientId,
          },
        ])
        .select()
        .single()

      titleId = title?.id

      if (isScheduled && titleId && activeClient?.phone && company?.id) {
        const { data: gateways } = await supabase
          .from('pix_gateways')
          .select('pix_key')
          .eq('company_id', company.id)
          .eq('is_active', true)
        const pixKey = gateways?.[0]?.pix_key || ''

        const scheduleDate = new Date(dueDate)
        scheduleDate.setHours(8, 0, 0, 0)

        const contextData = {
          clientName: activeClient.name,
          date: new Date(dueDate).toLocaleDateString(),
          amount: finalTotal.toFixed(2),
          pixKey,
        }

        await resolveAndScheduleWhatsApp(
          company.id,
          activeClient.id,
          activeClient.phone,
          'cobranca_pix_agendado',
          scheduleDate.toISOString(),
          contextData,
          titleId,
          undefined,
        ).then((res) => {
          if (res.error && res.error.includes('Chave PIX')) toast.error(res.error)
        })
      }
    }

    const { data: tx } = await supabase
      .from('transactions')
      .insert([
        {
          company_id: company?.id,
          type: 'inflow',
          origin: 'automatic_entry',
          amount: finalTotal,
          status: isImmediate ? 'confirmed' : 'pending',
          payment_method: methodUsed,
          client_id: actualClientId || null,
          financial_title_id: titleId,
          ref_id: appointmentId || null,
          confirmed_at: isImmediate ? now : null,
          description:
            methodUsed === 'CREDITO' && Number(installments) > 1
              ? `Parcelado em ${installments}x`
              : null,
          metadata: {
            items: pricedItems.map((i: any) => ({
              id: i.id,
              name: i.name,
              price: i.finalPrice,
              quantity: 1,
            })),
            discount: discountValue,
            discount_type: discountType,
            discount_raw: Number(discount || 0),
            photo_evidence: photoData, // Armazena a foto em base64 caso tenha sido enviada
          },
        },
      ])
      .select()
      .single()

    if (appointmentId) {
      await supabase
        .from('appointments')
        .update({
          status: 'finalizado',
          service_ids: pricedItems.map((i: any) => i.id),
        })
        .eq('id', appointmentId)

      // Post-Service Follow-up
      if (company?.id && activeClient?.phone) {
        const contextData = { clientName: activeClient.name }
        resolveAndScheduleWhatsApp(
          company.id,
          actualClientId,
          activeClient.phone,
          'pos_atendimento',
          new Date().toISOString(),
          contextData,
          undefined,
          tx?.id,
        ).then((res) => {
          if (res.error && !res.error.includes('inativo')) console.error(res.error)
        })
      }
    }

    for (const item of pricedItems) {
      if (item.type === 'product') await deductStock(item.id, 1)
      else if (item.is_composite && item.composite_items) {
        for (const child of item.composite_items) await deductStock(child.id, child.quantity || 1)
      }
    }

    setStatus('success')
  }

  // Função que inicia o processo de finalização do checkout, tratando também pagamentos via PIX integrado
  const handleFinish = async (forceManual = false) => {
    if (isScheduled && !actualClientId) {
      return toast.error('Obrigatório selecionar um cliente para faturamento agendado.')
    }

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
            toast.error('PIX não confirmado.')
            setStatus('idle')
            setPixPayload('')
          }
        }, 3000)
      } else {
        toast.error('Erro ao gerar PIX.')
        setStatus('idle')
      }
    } else {
      await finalizeTransaction(method, isScheduled)
    }
  }

  // Função para pré-agendar o retorno (recorrência) com base na data/hora informada
  const handleCreateProvisional = async () => {
    if (!company?.id || !actualClientId || !recurrenceDate) return

    // Estima a duração
    const duration = 60
    const [h, m] = recurrenceTime.split(':').map(Number)
    const endH = Math.floor((h * 60 + m + duration) / 60)
    const endM = (h * 60 + m + duration) % 60
    const endTimeStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}:00`

    const { data: newApp, error } = await supabase
      .from('appointments')
      .insert({
        company_id: company.id,
        client_id: actualClientId,
        date: recurrenceDate,
        start_time: recurrenceTime + ':00',
        end_time: endTimeStr,
        status: 'provisional',
        service_ids: pricedItems.map((i: any) => i.id),
      })
      .select()
      .single()

    if (error) return toast.error('Erro ao agendar retorno provisório')

    toast.success('Retorno provisório pré-agendado!')
    setProvisionalCreated(true)

    // Agendar lembrete via WhatsApp 7 dias antes do retorno
    if (activeClient?.phone) {
      const reminderDt = new Date(recurrenceDate)
      reminderDt.setDate(reminderDt.getDate() - 7)
      reminderDt.setHours(8, 0, 0, 0)

      const parts = recurrenceDate.split('-')
      const dtBr = `${parts[2]}/${parts[1]}/${parts[0]}`

      const contextData = {
        clientName: activeClient.name,
        date: dtBr,
        dateTime: `${dtBr} às ${recurrenceTime}`,
      }
      resolveAndScheduleWhatsApp(
        company.id,
        actualClientId,
        activeClient.phone,
        'recorrencia',
        reminderDt.toISOString(),
        contextData,
      ).then((res) => {
        if (res.error && !res.error.includes('inativo')) console.error(res.error)
      })
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-[560px] w-full flex flex-col h-full p-0">
        <div className="p-4 sm:p-6 sm:pb-2 border-b shrink-0">
          <SheetHeader>
            <SheetTitle>Finalizar Cobrança</SheetTitle>
          </SheetHeader>
        </div>
        {status === 'success' ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center overflow-y-auto">
            <CheckCircle2 className="w-16 h-16 text-green-600 mb-4 animate-in zoom-in" />
            <h3 className="text-2xl font-bold">Transação Finalizada!</h3>
            <p className="text-muted-foreground mt-2">
              {actualClientId
                ? 'Registros financeiros criados com rigor de auditoria.'
                : 'Venda avulsa registrada no caixa sem vínculo nominal.'}
            </p>

            {minRecurrence > 0 && actualClientId && !provisionalCreated && (
              <div className="mt-8 w-full p-5 border rounded-2xl bg-primary/5 border-primary/20 text-left animate-fade-in-up">
                <div className="flex items-center gap-2 text-primary font-bold text-lg mb-2">
                  <CalendarClock className="w-5 h-5" /> Sugerir Retorno
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Com base nos serviços, a próxima visita ideal seria em aproximadamente{' '}
                  <strong>{minRecurrence} dias</strong>. Modifique a data e hora se necessário:
                </p>
                <div className="flex gap-2 mb-4">
                  <Input
                    type="date"
                    value={recurrenceDate}
                    onChange={(e) => setRecurrenceDate(e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="time"
                    value={recurrenceTime}
                    onChange={(e) => setRecurrenceTime(e.target.value)}
                    className="w-24"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateProvisional} className="flex-1 shadow-md">
                    Confirmar Pré-Agendamento
                  </Button>
                </div>
              </div>
            )}

            <Button
              className="mt-8 rounded-full px-8"
              variant={
                minRecurrence > 0 && actualClientId && !provisionalCreated ? 'outline' : 'default'
              }
              onClick={() => {
                if (onComplete) onComplete()
              }}
            >
              Concluir e Fechar
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
          <>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              <div className="space-y-2">
                <Label>Cliente Vinculado (Opcional para Caixa)</Label>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger
                    className={
                      isScheduled && clientId === 'avulso' ? 'border-amber-500 ring-amber-500' : ''
                    }
                  >
                    <SelectValue placeholder="Venda Avulsa (Anônimo)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="avulso">-- Venda Avulsa --</SelectItem>
                    {clients.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isScheduled && clientId === 'avulso' && (
                  <p className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                    <Info className="w-3 h-3" /> Obrigatório para faturamento agendado
                  </p>
                )}
                {isNewClient && actualClientId && (
                  <Badge
                    variant="default"
                    className="bg-amber-500 hover:bg-amber-600 mt-2 animate-in fade-in w-full justify-center"
                  >
                    ✨ Cliente Primeira Vez
                  </Badge>
                )}
                {!isNewClient && newServices.length > 0 && actualClientId && (
                  <Badge
                    variant="secondary"
                    className="mt-2 animate-in fade-in border-purple-200 bg-purple-50 text-purple-700 w-full justify-center whitespace-normal text-center"
                  >
                    ✨ Primeiro Checkout para: {newServices.join(', ')}
                  </Badge>
                )}
              </div>
              <div className="bg-muted/50 p-4 rounded-xl border">
                <div className="space-y-3 mb-4">
                  {pricedItems.map((it: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center text-sm border-b border-border/50 pb-2"
                    >
                      <span className="font-medium">{it.name}</span>
                      <span>R$ {it.finalPrice.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <Separator className="my-3" />
                <div className="space-y-3 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Tipo de Desconto</span>
                    <div className="flex gap-2">
                      <Button
                        variant={discountType === 'fixed' ? 'default' : 'outline'}
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => setDiscountType('fixed')}
                      >
                        R$
                      </Button>
                      <Button
                        variant={discountType === 'percentage' ? 'default' : 'outline'}
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => setDiscountType('percentage')}
                      >
                        %
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Valor do Desconto</span>
                    <div className="flex items-center gap-2">
                      {discountType === 'percentage' && Number(discount) > 0 && (
                        <span className="text-xs text-muted-foreground font-semibold">
                          (-R$ {discountValue.toFixed(2)})
                        </span>
                      )}
                      <Input
                        type="number"
                        className="w-24 h-8 text-right font-mono"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between text-xl font-bold">
                  <span>Total Final</span>
                  <span className="text-primary">R$ {finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3 p-4 border rounded-xl bg-muted/20">
                <Label className="flex items-center gap-2 text-sm font-semibold">
                  <Camera className="w-4 h-4 text-primary" /> Anexar Evidência (Foto)
                </Label>
                <div className="flex items-center gap-4">
                  {photoData && (
                    <div className="w-16 h-16 rounded-md overflow-hidden border border-border">
                      <img src={photoData} alt="Evidência" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoUpload}
                      className="text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
                  </div>
                </div>
              </div>

              <RadioGroup
                value={method}
                onValueChange={setMethod}
                className="grid grid-cols-3 gap-3"
              >
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
                <div className="space-y-2 p-4 border rounded-xl bg-muted/20 mt-3">
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
                <div className="space-y-2 p-4 border rounded-xl bg-muted/20 mt-3">
                  <Label>Data de Vencimento</Label>
                  <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                  <p className="text-xs text-muted-foreground mt-1">
                    Um lembrete via WhatsApp será agendado automaticamente.
                  </p>
                </div>
              )}
            </div>
            <div className="p-4 border-t bg-background shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
              <Button
                onClick={() => handleFinish(false)}
                disabled={status === 'waiting' || !canFinish}
                className="w-full h-12 text-base sm:text-lg rounded-full shadow-elevation"
              >
                {status === 'waiting' ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                {method === 'PIX' ? 'Gerar PIX Automático' : 'Finalizar Atendimento'}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
