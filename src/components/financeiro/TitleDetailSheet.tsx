import { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useQuery } from '@/hooks/use-query'
import {
  Edit2,
  Save,
  FileText,
  Calendar,
  DollarSign,
  Clock,
  X,
  Link as LinkIcon,
} from 'lucide-react'

export function TitleDetailSheet({ open, onOpenChange, title, onUpdate }: any) {
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ original_amount: 0, due_date: '' })

  const { data: transactions } = useQuery<any>('transactions', {
    match: { financial_title_id: title?.id },
  })

  useEffect(() => {
    if (title) {
      setForm({ original_amount: title.original_amount, due_date: title.due_date })
      setEditMode(false)
    }
  }, [title])

  const handleSave = async () => {
    setSaving(true)
    const newAmount = Number(form.original_amount)

    if (newAmount < title.paid_amount) {
      setSaving(false)
      return toast.error('Valor original não pode ser menor que o valor já pago.')
    }

    const { error } = await supabase
      .from('financial_titles')
      .update({
        original_amount: newAmount,
        due_date: form.due_date,
      })
      .eq('id', title.id)

    if (error) {
      toast.error('Erro ao atualizar título')
      setSaving(false)
      return
    }

    const { data: schedules } = await supabase
      .from('whatsapp_message_schedules')
      .select('*')
      .eq('related_title_id', title.id)
      .eq('status', 'pending')

    if (schedules && schedules.length > 0) {
      const scheduleDate = new Date(form.due_date)
      scheduleDate.setHours(8, 0, 0, 0)

      const { data: clientData } = await supabase
        .from('clients')
        .select('name')
        .eq('id', title.client_id)
        .single()
      const { data: tpls } = await supabase
        .from('whatsapp_templates')
        .select('body')
        .eq('template_key', 'cobranca_pix_agendado')
        .eq('company_id', title.company_id)

      if (clientData && tpls?.[0]) {
        let msg = tpls[0].body
          .replace(/\[NOME_CLIENTE\]/g, clientData.name)
          .replace(/\[VALOR\]/g, newAmount.toFixed(2))
          .replace(/\[DATA\]/g, new Date(form.due_date).toLocaleDateString('pt-BR'))

        await supabase
          .from('whatsapp_message_schedules')
          .update({
            rendered_message: msg,
            scheduled_at_datetime: scheduleDate.toISOString(),
          })
          .eq('id', schedules[0].id)
      }
    }

    toast.success('Título atualizado com sucesso')
    if (onUpdate) onUpdate()
    setEditMode(false)
    setSaving(false)
  }

  if (!title) return null

  const currentOpenAmount = title.open_amount ?? title.original_amount - title.paid_amount

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6 flex flex-row items-center justify-between">
          <SheetTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" /> Detalhes do Título
          </SheetTitle>
          {!editMode && (
            <Button variant="ghost" size="icon" onClick={() => setEditMode(true)} className="mr-8">
              <Edit2 className="w-4 h-4" />
            </Button>
          )}
        </SheetHeader>

        <div className="space-y-6">
          <div className="bg-muted/50 p-4 rounded-xl border space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Tipo
              </span>
              <Badge variant="outline" className="uppercase">
                {title.type === 'receivable' ? 'Receita' : 'Despesa'}
              </Badge>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" /> Status
              </span>
              <Badge className={title.status === 'paid' ? 'bg-green-500' : ''}>
                {title.status.toUpperCase()}
              </Badge>
            </div>
            <div className="flex justify-between items-center text-sm pt-2 border-t">
              <span className="text-muted-foreground">Valor Pago</span>
              <span className="font-medium text-green-600">R$ {title.paid_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Saldo Restante</span>
              <span className="font-bold text-destructive">R$ {currentOpenAmount.toFixed(2)}</span>
            </div>
          </div>

          <Separator />

          {editMode ? (
            <div className="space-y-4 animate-in fade-in">
              <div className="space-y-2">
                <Label>Valor Original (R$)</Label>
                <Input
                  type="number"
                  value={form.original_amount}
                  onChange={(e) => setForm({ ...form, original_amount: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Data de Vencimento</Label>
                <Input
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setEditMode(false)
                    setForm({ original_amount: title.original_amount, due_date: title.due_date })
                  }}
                >
                  <X className="w-4 h-4 mr-2" /> Cancelar
                </Button>
                <Button className="flex-1" onClick={handleSave} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" /> Salvar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <span className="text-sm font-medium text-muted-foreground">Valor Original</span>
                <span className="text-lg font-bold">R$ {title.original_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Vencimento
                </span>
                <span className="text-sm font-medium">
                  {new Date(title.due_date).toLocaleDateString()}
                </span>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Descrição / Notas</Label>
                <p className="text-sm bg-muted p-3 rounded-lg min-h-[3rem]">
                  {title.description || 'Sem descrição.'}
                </p>
              </div>

              <div className="space-y-3 pt-4">
                <Label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-2">
                  <LinkIcon className="w-3.5 h-3.5" /> Histórico de Liquidações
                </Label>
                {transactions?.length > 0 ? (
                  <div className="space-y-2">
                    {transactions.map((tx: any) => (
                      <div
                        key={tx.id}
                        className="p-3 border rounded-lg bg-background text-sm flex justify-between items-center"
                      >
                        <div>
                          <p className="font-medium text-[10px] text-muted-foreground mb-0.5">
                            {new Date(tx.created_at).toLocaleDateString()}
                          </p>
                          <p className="font-semibold text-xs">
                            {tx.ticket_id} • {tx.payment_method}
                          </p>
                        </div>
                        <span className="font-bold text-green-600">R$ {tx.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-4 border rounded-lg border-dashed">
                    Nenhuma transação vinculada.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
