import { useState, useMemo, useEffect } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, QrCode, Loader2, AlertCircle, Camera, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { usePasskey } from '@/contexts/PasskeyContext'
import { useQuery } from '@/hooks/use-query'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { ChecklistExecutionModal } from '@/components/checklists/ChecklistExecutionModal'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function CheckoutSheet({
  open,
  onOpenChange,
  items,
  initialClientId,
  appointmentId,
  onComplete,
}: any) {
  const { company } = usePasskey()
  const { data: clients } = useQuery<any>('clients', { match: { is_active: true } })
  const { data: appointments } = useQuery<any>('appointments')

  const appointment = appointments?.find((a: any) => a.id === appointmentId)
  const isAlreadyPaid = appointment?.processado_pdv === true

  const { data: appTxs } = useQuery<any>('transactions', {
    match: { ref_id: appointmentId || 'none' },
  })

  const appTitleId = useMemo(() => {
    if (!appointmentId) return null
    const tx = appTxs?.find((t: any) => t.ref_id === appointmentId && t.financial_title_id)
    return tx?.financial_title_id
  }, [appTxs, appointmentId])

  const { data: titleData } = useQuery<any>('financial_titles', {
    match: { id: appTitleId || 'none' },
  })

  const hasConfirmedTx = appTxs?.some((t: any) => t.status === 'confirmed')
  const isTitlePaidOrPartial =
    titleData?.[0]?.status === 'paid' || titleData?.[0]?.status === 'partial'
  const canFinalizeApp = hasConfirmedTx || isTitlePaidOrPartial

  const [clientId, setClientId] = useState('avulso')
  const { data: paymentMethods } = useQuery<any>('payment_methods', {
    match: { ativo: true },
    order: { column: 'nome', ascending: true },
  })

  const [payments, setPayments] = useState<{ method_id: string; amount: number }[]>([])
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  })

  const [status, setStatus] = useState<'idle' | 'waiting' | 'success'>('idle')
  const [pixPayload, setPixPayload] = useState('')
  const [photoData, setPhotoData] = useState<string | null>(null)
  const [customItemPrices, setCustomItemPrices] = useState<Record<string, number>>({})
  const [checklistModal, setChecklistModal] = useState<{ open: boolean; id: string; args: any }>({
    open: false,
    id: '',
    args: null,
  })

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
  const sumPayments = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0)
  const remaining = finalTotal - sumPayments

  const hasScheduledPayment = payments.some((p) => {
    const m = paymentMethods?.find((x: any) => x.id === p.method_id)
    return m?.exige_data === true
  })

  const canFinish =
    pricedItems.length > 0 &&
    Math.abs(remaining) < 0.01 &&
    payments.length > 0 &&
    (!hasScheduledPayment || actualClientId)

  useEffect(() => {
    if (initialClientId && open && clientId === 'avulso') setClientId(initialClientId)
    if (open && paymentMethods?.length > 0 && payments.length === 0) {
      setPayments([{ method_id: paymentMethods[0].id, amount: finalTotal }])
    }
    if (!open) {
      setStatus('idle')
      setPayments([])
      setClientId('avulso')
      setCustomItemPrices({})
      setPhotoData(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialClientId, open, paymentMethods])

  useEffect(() => {
    if (payments.length === 1 && open) {
      setPayments([{ ...payments[0], amount: finalTotal }])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalTotal])

  const handlePriceChange = (id: string, newPrice: string) => {
    const p = parseFloat(newPrice)
    if (isNaN(p) || p < 0) return
    setCustomItemPrices((prev) => ({ ...prev, [id]: p }))
  }

  const handleAddPayment = () => {
    if (remaining > 0 && paymentMethods?.length > 0) {
      setPayments([...payments, { method_id: paymentMethods[0].id, amount: remaining }])
    }
  }

  const handlePaymentChange = (index: number, field: string, value: any) => {
    const newP = [...payments]
    newP[index] = { ...newP[index], [field]: value }
    setPayments(newP)
  }

  const removePayment = (index: number) => {
    setPayments(payments.filter((_, i) => i !== index))
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => setPhotoData(ev.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const finalizeTransaction = async (keepAppointmentOpen = false) => {
    const now = new Date().toISOString()
    const uniqueTicket = Math.random().toString(36).substring(2, 10).toUpperCase()

    let titleId = null

    if (actualClientId) {
      const titleStatus = payments.every((p) => {
        const m = paymentMethods?.find((x: any) => x.id === p.method_id)
        return m?.baixa_automatica
      })
        ? 'paid'
        : 'open'

      const paidAmt = payments.reduce((acc, p) => {
        const m = paymentMethods?.find((x: any) => x.id === p.method_id)
        return m?.baixa_automatica ? acc + p.amount : acc
      }, 0)

      const { data: title } = await supabase
        .from('financial_titles')
        .insert([
          {
            company_id: company?.id,
            type: 'receivable',
            status: titleStatus,
            original_amount: finalTotal,
            paid_amount: paidAmt,
            due_date: hasScheduledPayment ? dueDate : now.split('T')[0],
            description: `Checkout PDV - ${items.length} itens`,
            client_id: actualClientId,
          },
        ])
        .select()
        .single()

      titleId = title?.id
    }

    const txsToInsert = payments.map((p) => {
      const mObj = paymentMethods?.find((m: any) => m.id === p.method_id)
      const isImmediate = mObj?.baixa_automatica === true

      return {
        company_id: company?.id,
        type: 'inflow',
        origin: 'automatic_entry',
        amount: p.amount,
        status: isImmediate ? 'confirmed' : 'pending',
        payment_method: mObj?.nome || p.method_id,
        client_id: actualClientId || null,
        financial_title_id: titleId,
        ref_id: appointmentId || null,
        confirmed_at: isImmediate ? now : null,
        ticket_id: uniqueTicket,
        description: `Pagamento PDV (${mObj?.nome})`,
        metadata: {
          items: pricedItems.map((i: any) => ({
            id: i.id,
            name: i.name,
            price: i.finalPrice,
            quantity: 1,
          })),
          photo_evidence: photoData,
        },
      }
    })

    const { error: txErr } = await supabase.from('transactions').insert(txsToInsert)
    if (txErr) {
      toast.error('Erro ao salvar transações')
      setStatus('idle')
      return
    }

    if (appointmentId) {
      const appUpdate: any = {
        service_ids: pricedItems.map((i: any) => i.id),
        processado_pdv: true,
        data_processamento_pdv: now,
      }

      if (!keepAppointmentOpen) {
        appUpdate.status = 'finalizado'
      }

      await supabase.from('appointments').update(appUpdate).eq('id', appointmentId)
    }

    setStatus('success')
  }

  const finalizeAlreadyPaid = async () => {
    if (appointmentId) {
      setStatus('waiting')
      await supabase.from('appointments').update({ status: 'finalizado' }).eq('id', appointmentId)
      setStatus('success')
    }
  }

  const executeFinish = async (forceManual = false, keepAppointmentOpen = false) => {
    setStatus('waiting')

    const hasPixAuto = payments.some((p) => {
      const methodObj = paymentMethods?.find((m: any) => m.id === p.method_id)
      return methodObj?.tipo === 'pix' && methodObj?.baixa_automatica
    })

    if (hasPixAuto && !forceManual) {
      const pixPayment = payments.find((p) => {
        const methodObj = paymentMethods?.find((m: any) => m.id === p.method_id)
        return methodObj?.tipo === 'pix' && methodObj?.baixa_automatica
      })

      const { data } = await supabase.functions.invoke('generate-pix', {
        body: { amount: pixPayment?.amount || finalTotal },
      })
      if (data?.success) {
        setPixPayload(data.payload)
        setTimeout(async () => {
          const { data: checkData } = await supabase.functions.invoke('check-pix-status', {
            body: { transactionId: 'test' },
          })
          if (checkData?.status === 'paid') await finalizeTransaction(keepAppointmentOpen)
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
      await finalizeTransaction(keepAppointmentOpen)
    }
  }

  const handleFinishPreCheck = async (forceManual = false, keepAppointmentOpen = false) => {
    if (isAlreadyPaid) {
      return finalizeAlreadyPaid()
    }

    if (hasScheduledPayment && !actualClientId) {
      return toast.error('Obrigatório selecionar um cliente para faturamento agendado.')
    }

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
              <p className="text-muted-foreground mt-2">Registros atualizados com sucesso.</p>
              <Button
                className="mt-8 rounded-full px-8"
                onClick={() => {
                  if (onComplete) onComplete()
                }}
              >
                Concluir e Fechar
              </Button>
            </div>
          ) : status === 'waiting' && pixPayload ? (
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
                {!isAlreadyPaid && (
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
                )}

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
                                {diff > 0 ? '+' : ''}R$ {diff.toFixed(2)} ({diffPercent.toFixed(1)}
                                %)
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
                                disabled={isAlreadyPaid}
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

                {!isAlreadyPaid && (
                  <>
                    <div className="space-y-4 border p-4 rounded-xl">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-bold">Métodos de Pagamento</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleAddPayment}
                          disabled={remaining <= 0}
                        >
                          + Adicionar
                        </Button>
                      </div>

                      {payments.map((p, idx) => (
                        <div
                          key={idx}
                          className="flex gap-2 items-center bg-muted/20 p-2 rounded-lg"
                        >
                          <Select
                            value={p.method_id}
                            onValueChange={(v) => handlePaymentChange(idx, 'method_id', v)}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Método..." />
                            </SelectTrigger>
                            <SelectContent>
                              {paymentMethods?.map((m: any) => (
                                <SelectItem key={m.id} value={m.id}>
                                  {m.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="w-28 relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                              R$
                            </span>
                            <Input
                              type="number"
                              className="pl-6 text-right font-bold"
                              value={p.amount}
                              onChange={(e) =>
                                handlePaymentChange(idx, 'amount', Number(e.target.value))
                              }
                              step="0.01"
                            />
                          </div>
                          {payments.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive shrink-0"
                              onClick={() => removePayment(idx)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}

                      {hasScheduledPayment && (
                        <div className="space-y-2 mt-4 pt-4 border-t">
                          <Label>Data de Vencimento (Faturamento Agendado)</Label>
                          <Input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                          />
                        </div>
                      )}

                      <div className="flex justify-between text-sm font-bold pt-2 mt-2 border-t">
                        <span>Falta Pagar:</span>
                        <span
                          className={
                            Math.abs(remaining) < 0.01 ? 'text-green-600' : 'text-destructive'
                          }
                        >
                          R$ {remaining.toFixed(2)}
                        </span>
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
                  </>
                )}
              </div>
              <div className="p-4 border-t bg-background shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                <Button
                  onClick={() => handleFinishPreCheck(false, false)}
                  disabled={
                    status === 'waiting' ||
                    (!isAlreadyPaid && !canFinish) ||
                    (isAlreadyPaid && !canFinalizeApp)
                  }
                  className="w-full h-12 text-base sm:text-lg rounded-full"
                >
                  {status === 'waiting' ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                  {isAlreadyPaid
                    ? canFinalizeApp
                      ? 'Finalizar Atendimento'
                      : 'Pagamento Pendente (Bloqueado)'
                    : 'Registrar e Finalizar'}
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
