import { useState, useMemo, useEffect } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
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
import { SearchableSelect } from '@/components/ui/searchable-select'
import { ChecklistExecutionModal } from '@/components/checklists/ChecklistExecutionModal'

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
  const { data: paymentMethods } = useQuery<any>('payment_methods', {
    match: { ativo: true },
    order: { column: 'nome', ascending: true },
  })

  const [method, setMethod] = useState('')
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

  const [customItemPrices, setCustomItemPrices] = useState<Record<string, number>>({})
  const [checklistModal, setChecklistModal] = useState<{ open: boolean; id: string; args: any }>({
    open: false,
    id: '',
    args: null,
  })

  useEffect(() => {
    if (initialClientId && open && clientId === 'avulso') setClientId(initialClientId)
    if (open && paymentMethods?.length > 0 && !method) {
      setMethod(paymentMethods[0].id)
    }
    if (!open) {
      setStatus('idle')
      if (paymentMethods?.length > 0) setMethod(paymentMethods[0].id)
      setClientId('avulso')
      setCustomItemPrices({})
      setProvisionalCreated(false)
      setRecurrenceDate('')
      setRecurrenceTime('09:00')
      setPhotoData(null)
    }
  }, [initialClientId, open, paymentMethods])

  const actualClientId = clientId === 'avulso' ? '' : clientId

  const activeClient = useMemo(
    () => clients?.find((c: any) => c.id === actualClientId),
    [actualClientId, clients],
  )

  const pricedItems = useMemo(
    () =>
      items.map((it: any) => {
        const clientSpecialPrice = activeClient?.special_prices?.[it.id]
        const manualCustomPrice = customItemPrices[it.id]

        let finalP = it.price
        if (manualCustomPrice !== undefined) finalP = manualCustomPrice
        else if (clientSpecialPrice !== undefined) finalP = clientSpecialPrice

        return {
          ...it,
          originalPrice: it.price,
          finalPrice: finalP,
          hasCustomPrice: finalP !== it.price,
        }
      }),
    [items, activeClient, customItemPrices],
  )

  const finalTotal = pricedItems.reduce((acc: any, i: any) => acc + i.finalPrice, 0)
  const selectedMethodObj = paymentMethods?.find((m: any) => m.id === method)

  const isScheduled = selectedMethodObj?.exige_data === true
  const canFinish = pricedItems.length > 0 && (!isScheduled || actualClientId)

  const handlePriceChange = (id: string, newPrice: string) => {
    const p = parseFloat(newPrice)
    if (isNaN(p) || p < 0) return
    setCustomItemPrices((prev) => ({ ...prev, [id]: p }))
  }

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

  const finalizeTransaction = async (
    methodId: string,
    isPending: boolean,
    keepAppointmentOpen = false,
  ) => {
    const methodObj = paymentMethods?.find((m: any) => m.id === methodId)
    const methodName = methodObj?.nome || methodId
    const now = new Date().toISOString()
    const isImmediate = methodObj?.baixa_automatica === true

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
          payment_method: methodName,
          client_id: actualClientId || null,
          financial_title_id: titleId,
          ref_id: appointmentId || null,
          confirmed_at: isImmediate ? now : null,
          description:
            methodObj?.tipo === 'cartao_credito' && Number(installments) > 1
              ? `Parcelado em ${installments}x`
              : null,
          metadata: {
            items: pricedItems.map((i: any) => ({
              id: i.id,
              name: i.name,
              price: i.finalPrice,
              quantity: 1,
            })),
            photo_evidence: photoData,
          },
        },
      ])
      .select()
      .single()

    if (appointmentId) {
      const appUpdate: any = {
        service_ids: pricedItems.map((i: any) => i.id),
      }

      if (!keepAppointmentOpen) {
        appUpdate.status = 'finalizado'
        appUpdate.processado_pdv = true
        appUpdate.data_processamento_pdv = now
      }

      await supabase.from('appointments').update(appUpdate).eq('id', appointmentId)
    }

    setStatus('success')
  }

  const handleFinishPreCheck = async (forceManual = false, keepAppointmentOpen = false) => {
    const methodObj = paymentMethods?.find((m: any) => m.id === method)
    if (methodObj?.exige_data && !actualClientId) {
      return toast.error('Obrigatório selecionar um cliente para faturamento agendado.')
    }

    // Check if any service requires checklist
    const serviceWithChecklist = pricedItems.find((i: any) => i.checklist_id)
    if (serviceWithChecklist?.checklist_id) {
      setChecklistModal({
        open: true,
        id: serviceWithChecklist.checklist_id,
        args: { forceManual, keepAppointmentOpen },
      })
      return
    }

    await executeFinish(forceManual, keepAppointmentOpen)
  }

  const executeFinish = async (forceManual = false, keepAppointmentOpen = false) => {
    setStatus('waiting')
    const methodObj = paymentMethods?.find((m: any) => m.id === method)

    if (methodObj?.tipo === 'pix' && methodObj?.baixa_automatica && !forceManual) {
      const { data } = await supabase.functions.invoke('generate-pix', {
        body: { amount: finalTotal },
      })
      if (data?.success) {
        setPixPayload(data.payload)
        setTimeout(async () => {
          const { data: checkData } = await supabase.functions.invoke('check-pix-status', {
            body: { transactionId: 'test' },
          })
          if (checkData?.status === 'paid')
            await finalizeTransaction(method, false, keepAppointmentOpen)
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
      await finalizeTransaction(method, isScheduled, keepAppointmentOpen)
    }
  }

  return (
    <>
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
              <p className="text-muted-foreground mt-2">Registros criados e sincronizados.</p>
              <Button
                className="mt-8 rounded-full px-8"
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
              <Button variant="outline" onClick={() => executeFinish(true)} className="mt-4">
                <AlertCircle className="w-4 h-4 mr-2" /> Forçar Conclusão (Pago Manualmente)
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                <div className="space-y-2">
                  <Label>Cliente Vinculado</Label>
                  <SearchableSelect
                    value={clientId}
                    onChange={setClientId}
                    options={[
                      { label: '-- Venda Avulsa --', value: 'avulso' },
                      ...(clients?.map((c: any) => ({
                        label: `${c.nome_preferido || c.name} ${c.phone ? `(${c.phone})` : ''}`,
                        value: c.id,
                      })) || []),
                    ]}
                    placeholder="Venda Avulsa (Anônimo)"
                  />
                </div>
                <div className="bg-muted/50 p-4 rounded-xl border">
                  <div className="space-y-4 mb-4">
                    {pricedItems.map((it: any, idx: number) => {
                      const diff = it.hasCustomPrice ? it.finalPrice - it.originalPrice : 0
                      const diffPercent = it.originalPrice > 0 ? (diff / it.originalPrice) * 100 : 0

                      return (
                        <div
                          key={idx}
                          className="flex justify-between items-center text-sm border-b border-border/50 pb-3"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{it.name}</span>
                            {it.hasCustomPrice && diff !== 0 && (
                              <span className="text-xs line-through text-muted-foreground">
                                Padrão: R$ {it.originalPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            {it.hasCustomPrice && diff !== 0 && (
                              <Badge
                                variant="outline"
                                className={`text-[10px] font-bold ${diff > 0 ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'}`}
                              >
                                {diff > 0 ? '+' : ''}
                                {diffPercent.toFixed(1)}%
                              </Badge>
                            )}
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                                R$
                              </span>
                              <Input
                                type="number"
                                className="w-24 h-8 text-right font-bold pl-6"
                                value={it.finalPrice}
                                onChange={(e) => handlePriceChange(it.id, e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex justify-between text-xl font-bold pt-2 border-t">
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
                        <img
                          src={photoData}
                          alt="Evidência"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handlePhotoUpload}
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>

                <RadioGroup
                  value={method}
                  onValueChange={setMethod}
                  className="grid grid-cols-3 gap-3"
                >
                  {paymentMethods?.map((m: any) => (
                    <div
                      key={m.id}
                      onClick={() => setMethod(m.id)}
                      className={cn(
                        'border-2 rounded-xl p-3 text-center cursor-pointer flex flex-col items-center justify-center min-h-[3.5rem] transition-colors',
                        method === m.id ? 'border-primary bg-primary/5 text-primary' : '',
                      )}
                    >
                      <RadioGroupItem value={m.id} id={m.id} className="sr-only" />
                      <Label className="cursor-pointer font-bold text-[11px] sm:text-xs text-center leading-tight">
                        {m.nome}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <div className="p-4 border-t bg-background shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                <Button
                  onClick={() => handleFinishPreCheck(false, false)}
                  disabled={status === 'waiting' || !canFinish}
                  className="w-full h-12 text-base sm:text-lg rounded-full"
                >
                  {status === 'waiting' ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                  Finalizar Atendimento
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {checklistModal.open && (
        <ChecklistExecutionModal
          open={checklistModal.open}
          onOpenChange={(o: boolean) => setChecklistModal({ ...checklistModal, open: o })}
          checklistId={checklistModal.id}
          clientId={actualClientId}
          appointmentId={appointmentId}
          onComplete={() => {
            setChecklistModal({ open: false, id: '', args: null })
            executeFinish(checklistModal.args.forceManual, checklistModal.args.keepAppointmentOpen)
          }}
        />
      )}
    </>
  )
}
