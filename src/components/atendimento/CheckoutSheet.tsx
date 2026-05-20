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
  const [discount, setDiscount] = useState('0')
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('fixed')

  const [surcharge, setSurcharge] = useState('0')
  const [surchargeType, setSurchargeType] = useState<'fixed' | 'percentage'>('fixed')

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
    if (open && paymentMethods?.length > 0 && !method) {
      setMethod(paymentMethods[0].id)
    }
    if (!open) {
      setStatus('idle')
      if (paymentMethods?.length > 0) setMethod(paymentMethods[0].id)
      setClientId('avulso')
      setDiscount('0')
      setSurcharge('0')
      setProvisionalCreated(false)
      setRecurrenceDate('')
      setRecurrenceTime('09:00')
      setPhotoData(null)
    }
  }, [initialClientId, open, paymentMethods])

  const actualClientId = clientId === 'avulso' ? '' : clientId

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
    () => clients?.find((c: any) => c.id === actualClientId),
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

  const total = pricedItems.reduce((acc: any, i: any) => acc + i.finalPrice, 0)
  const selectedMethodObj = paymentMethods?.find((m: any) => m.id === method)

  const discountValue =
    discountType === 'percentage' ? total * (Number(discount || 0) / 100) : Number(discount || 0)

  const surchargeValue =
    surchargeType === 'percentage' ? total * (Number(surcharge || 0) / 100) : Number(surcharge || 0)

  const finalTotal = Math.max(0, total - discountValue + surchargeValue)

  const isScheduled = selectedMethodObj?.exige_data === true
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

  useEffect(() => {
    if (suggestedDate && !recurrenceDate) {
      setRecurrenceDate(suggestedDate)
    }
  }, [suggestedDate, recurrenceDate])

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

  const finalizeTransaction = async (
    methodId: string,
    isPending: boolean,
    keepAppointmentOpen = false,
  ) => {
    const methodObj = paymentMethods?.find((m: any) => m.id === methodId)
    const methodName = methodObj?.nome || methodId
    const now = new Date().toISOString()
    const isImmediate = methodObj?.baixa_automatica === true

    if (appointmentId) {
      const { data: existingApp } = await supabase
        .from('appointments')
        .select('processado_pdv')
        .eq('id', appointmentId)
        .single()
      if (existingApp?.processado_pdv) {
        toast.error('Este atendimento já foi faturado.')
        setStatus('idle')
        return
      }
    }

    let titleId = null

    if (actualClientId) {
      if (surchargeValue > 0 && pricedItems.length > 0) {
        for (const item of pricedItems) {
          const itemRatio = item.finalPrice / total
          const itemSurcharge = surchargeValue * itemRatio
          const newPrice = item.finalPrice + itemSurcharge

          await supabase.from('client_custom_prices').upsert(
            {
              client_id: actualClientId,
              service_id: item.id,
              company_id: company?.id,
              price: newPrice,
              preco_padrao_original: item.originalPrice,
              tipo_especial: 'acrescimo',
              valor_ajuste: itemSurcharge,
              tipo_ajuste: 'reais',
              observacoes: 'Acréscimo automático do PDV',
            },
            { onConflict: 'client_id,service_id' },
          )
        }
        toast.info(`Preço especial atualizado para o cliente devido ao acréscimo.`)
      }

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
          clientName: activeClient.nome_preferido || activeClient.name,
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
            discount: discountValue,
            discount_type: discountType,
            discount_raw: Number(discount || 0),
            surcharge: surchargeValue,
            surcharge_type: surchargeType,
            surcharge_raw: Number(surcharge || 0),
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

      if (!keepAppointmentOpen && company?.id && activeClient?.phone) {
        const contextData = { clientName: activeClient.nome_preferido || activeClient.name }
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

  const handleFinish = async (forceManual = false, keepAppointmentOpen = false) => {
    const methodObj = paymentMethods?.find((m: any) => m.id === method)
    if (methodObj?.exige_data && !actualClientId) {
      return toast.error('Obrigatório selecionar um cliente para faturamento agendado.')
    }

    setStatus('waiting')
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

  const handleCreateProvisional = async () => {
    if (!company?.id || !actualClientId || !recurrenceDate) return

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

    if (activeClient?.phone) {
      const reminderDt = new Date(recurrenceDate)
      reminderDt.setDate(reminderDt.getDate() - 7)
      reminderDt.setHours(8, 0, 0, 0)

      const parts = recurrenceDate.split('-')
      const dtBr = `${parts[2]}/${parts[1]}/${parts[0]}`

      const contextData = {
        clientName: activeClient.nome_preferido || activeClient.name,
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
                  className={
                    isScheduled && clientId === 'avulso' ? 'border-amber-500 ring-amber-500' : ''
                  }
                />
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
                        min="0"
                        className="w-24 h-8 text-right font-mono"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <Separator className="my-3" />
                <div className="space-y-3 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Tipo de Acréscimo</span>
                    <div className="flex gap-2">
                      <Button
                        variant={surchargeType === 'fixed' ? 'default' : 'outline'}
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => setSurchargeType('fixed')}
                      >
                        R$
                      </Button>
                      <Button
                        variant={surchargeType === 'percentage' ? 'default' : 'outline'}
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => setSurchargeType('percentage')}
                      >
                        %
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Valor do Acréscimo</span>
                    <div className="flex items-center gap-2">
                      {surchargeType === 'percentage' && Number(surcharge) > 0 && (
                        <span className="text-xs text-muted-foreground font-semibold">
                          (+R$ {surchargeValue.toFixed(2)})
                        </span>
                      )}
                      <Input
                        type="number"
                        min="0"
                        className="w-24 h-8 text-right font-mono"
                        value={surcharge}
                        onChange={(e) => {
                          const val = Number(e.target.value)
                          if (surchargeType === 'percentage' && val > 200) {
                            toast.error('Acréscimo percentual não pode ser maior que 200%.')
                            return
                          }
                          if (val < 0) return
                          setSurcharge(e.target.value)
                        }}
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
                    {m.descricao_visivel && m.descricao && (
                      <span className="text-[9px] text-muted-foreground text-center mt-1">
                        {m.descricao}
                      </span>
                    )}
                  </div>
                ))}
              </RadioGroup>

              {selectedMethodObj?.tipo === 'cartao_credito' && (
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
              {selectedMethodObj?.exige_data && (
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
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => handleFinish(false, false)}
                  disabled={status === 'waiting' || !canFinish}
                  className="w-full h-12 text-base sm:text-lg rounded-full shadow-elevation"
                >
                  {status === 'waiting' ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                  {selectedMethodObj?.tipo === 'pix' && selectedMethodObj?.baixa_automatica
                    ? 'Gerar PIX e Finalizar'
                    : 'Finalizar Atendimento'}
                </Button>
                {appointmentId && (
                  <Button
                    variant="outline"
                    onClick={() => handleFinish(false, true)}
                    disabled={status === 'waiting' || !canFinish}
                    className="w-full h-10 rounded-full border-primary/50 text-primary hover:bg-primary/5"
                  >
                    {status === 'waiting' ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Apenas Receber Pagamento (Manter Aberto)
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
