import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { InteractiveBodyMap } from './InteractiveBodyMap'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export function ChecklistResponseModal({
  open,
  onOpenChange,
  checklistId,
  clientId,
  appointmentId,
  onCompleted,
}: any) {
  const [checklist, setChecklist] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [responses, setResponses] = useState<any>({})
  const [bodyMarks, setBodyMarks] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const { profile } = useAuth()

  useEffect(() => {
    if (open && checklistId) {
      loadChecklist()
    }
  }, [open, checklistId])

  const loadChecklist = async () => {
    setLoading(true)
    const { data: cl } = await supabase
      .from('checklists')
      .select('*')
      .eq('id', checklistId)
      .single()
    const { data: clItems } = await supabase
      .from('checklist_items')
      .select('*')
      .eq('checklist_id', checklistId)
      .order('id')

    setChecklist(cl)
    setItems(clItems || [])

    if (clientId) {
      // Pre-fill last response
      const { data: lastResponse } = await supabase
        .from('checklist_responses')
        .select('*')
        .eq('checklist_id', checklistId)
        .eq('cliente_id', clientId)
        .order('respondido_em', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (lastResponse) {
        setResponses(lastResponse.respostas || {})
        // Carregar body marks também, idealmente buscar de checklist_body_map
        const { data: marks } = await supabase
          .from('checklist_body_map')
          .select('*')
          .eq('checklist_response_id', lastResponse.id)
        if (marks) {
          setBodyMarks(
            marks.map((m) => ({
              id: m.id,
              x: m.posicao_x,
              y: m.posicao_y,
              body_type: m.tipo_corpo,
              ungueal_number: m.ungueal_numero,
              alteration_type: m.tipo_alteracao,
              description: m.descricao_texto,
            })),
          )
        }
      } else {
        setResponses({})
        setBodyMarks([])
      }
    }
    setLoading(false)
  }

  const handleSave = async () => {
    // Validate mandatory
    const missing = items.filter((i) => i.obrigatoria && !responses[i.id])
    if (missing.length > 0) {
      return toast.error('Por favor, preencha todos os campos obrigatórios.')
    }

    setSaving(true)
    const { data: responseData, error } = await supabase
      .from('checklist_responses')
      .insert([
        {
          checklist_id: checklistId,
          cliente_id: clientId,
          ticket_id: appointmentId || null,
          respostas: responses,
          respondido_por: profile?.id,
        },
      ])
      .select()
      .single()

    if (error) {
      setSaving(false)
      return toast.error('Erro ao salvar checklist: ' + error.message)
    }

    // Save body marks
    if (bodyMarks.length > 0) {
      await supabase.from('checklist_body_map').insert(
        bodyMarks.map((m) => ({
          checklist_response_id: responseData.id,
          tipo_corpo: m.body_type,
          ungueal_numero: m.ungueal_number,
          posicao_x: m.x,
          posicao_y: m.y,
          tipo_alteracao: m.alteration_type,
          descricao_texto: m.description,
        })),
      )
    }

    toast.success('Checklist / Anamnese salva com sucesso!')
    setSaving(false)
    if (onCompleted) onCompleted()
    else onOpenChange(false)
  }

  const renderInput = (item: any) => {
    const val = responses[item.id] || ''
    const setVal = (v: any) => setResponses({ ...responses, [item.id]: v })

    switch (item.tipo_resposta) {
      case 'texto':
        return (
          <Textarea
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder="Sua resposta..."
          />
        )
      case 'numero':
        return <Input type="number" value={val} onChange={(e) => setVal(e.target.value)} />
      case 'data':
        return <Input type="date" value={val} onChange={(e) => setVal(e.target.value)} />
      case 'sim_nao':
        return (
          <RadioGroup value={val} onValueChange={setVal} className="flex gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sim" id={`sim-${item.id}`} />
              <Label htmlFor={`sim-${item.id}`}>Sim</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="nao" id={`nao-${item.id}`} />
              <Label htmlFor={`nao-${item.id}`}>Não</Label>
            </div>
          </RadioGroup>
        )
      case 'dropdown': {
        let options: any[] = []
        if (item.dropdown_origem === 'manual' && item.lista_manual) {
          options = item.lista_manual
            .split(';')
            .map((s: string) => ({ label: s.trim(), value: s.trim() }))
        } else if (item.dropdown_origem === 'json' && item.valores_json) {
          options = item.valores_json as any[]
        }
        return (
          <Select value={val} onValueChange={setVal}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {options.map((o: any, i: number) => (
                <SelectItem key={i} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      }
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2 shrink-0 border-b">
          <DialogTitle>{checklist?.nome || 'Ficha de Anamnese'}</DialogTitle>
          <DialogDescription>Preenchimento obrigatório para prosseguir.</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {items.map((item) => (
                <div key={item.id} className="space-y-2 border-b pb-4 last:border-0">
                  <Label className="text-sm font-semibold flex items-center gap-1">
                    {item.pergunta}
                    {item.obrigatoria && <span className="text-destructive">*</span>}
                  </Label>
                  {renderInput(item)}
                </div>
              ))}

              <div className="border-t pt-6 mt-6">
                <Label className="text-sm font-semibold mb-4 block">
                  Mapeamento Corporal (Opcional)
                </Label>
                <InteractiveBodyMap value={bodyMarks} onChange={setBodyMarks} />
              </div>
            </>
          )}
        </div>

        <DialogFooter className="p-6 pt-2 shrink-0 border-t bg-muted/20">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button disabled={saving || loading} onClick={handleSave}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Salvar e Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
