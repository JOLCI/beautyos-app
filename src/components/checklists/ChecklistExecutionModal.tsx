import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { BodyMap } from './BodyMap'
import { toast } from 'sonner'

export function ChecklistExecutionModal({
  open,
  onOpenChange,
  checklistId,
  clientId,
  appointmentId,
  onComplete,
}: any) {
  const [items, setItems] = useState<any[]>([])
  const [responses, setResponses] = useState<any>({})
  const [markedNails, setMarkedNails] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [nailModal, setNailModal] = useState<any>(null) // { part, n }

  useEffect(() => {
    if (open && checklistId) {
      loadChecklist()
    }
  }, [open, checklistId])

  const loadChecklist = async () => {
    setLoading(true)
    const { data: itemData } = await supabase
      .from('checklist_items')
      .select('*')
      .eq('checklist_id', checklistId)
      .order('ordem')
    setItems(itemData || [])

    // Load previous response if exists for pre-fill
    if (clientId) {
      const { data: prev } = await supabase
        .from('checklist_responses')
        .select('respostas, id')
        .eq('checklist_id', checklistId)
        .eq('cliente_id', clientId)
        .order('respondido_em', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (prev) {
        setResponses(prev.respostas || {})
        const { data: mapData } = await supabase
          .from('checklist_body_map')
          .select('*')
          .eq('checklist_response_id', prev.id)
        if (mapData) setMarkedNails(mapData)
        toast.info('Respostas anteriores carregadas para facilitar o preenchimento.')
      }
    }
    setLoading(false)
  }

  const handleFinish = async () => {
    // Validate required
    for (const it of items) {
      if (it.obrigatoria && !responses[it.id]) {
        return toast.error(`A pergunta "${it.pergunta}" é obrigatória.`)
      }
    }

    setSaving(true)
    const { data: respData, error } = await supabase
      .from('checklist_responses')
      .insert([
        {
          checklist_id: checklistId,
          cliente_id: clientId,
          appointment_id: appointmentId,
          respostas: responses,
          respondido_por: (await supabase.auth.getUser()).data.user?.id,
        },
      ])
      .select()
      .single()

    if (error) {
      setSaving(false)
      return toast.error('Erro ao salvar checklist.')
    }

    if (markedNails.length > 0) {
      const mapPayload = markedNails.map((m) => ({
        ...m,
        id: undefined, // remove old id if coming from prefill
        checklist_response_id: respData.id,
      }))
      await supabase.from('checklist_body_map').insert(mapPayload)
    }

    setSaving(false)
    toast.success('Checklist finalizado com sucesso!')
    onComplete()
  }

  const handleNailSave = (e: any) => {
    e.preventDefault()
    const form = new FormData(e.target)
    const tipo = form.get('tipo_alteracao') as string
    const desc = form.get('descricao_texto') as string
    if (!tipo) return

    setMarkedNails((prev) => [
      ...prev.filter((m) => !(m.tipo_corpo === nailModal.part && m.ungueal_numero === nailModal.n)),
      {
        tipo_corpo: nailModal.part,
        ungueal_numero: nailModal.n,
        tipo_alteracao: tipo,
        descricao_texto: desc,
      },
    ])
    setNailModal(null)
  }

  const renderInput = (item: any) => {
    const val = responses[item.id] || ''
    const setVal = (v: any) => setResponses((prev) => ({ ...prev, [item.id]: v }))

    switch (item.tipo_resposta) {
      case 'texto':
        return <Textarea value={val} onChange={(e) => setVal(e.target.value)} />
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
        let opts: any[] = []
        if (item.dropdown_origem === 'json') {
          try {
            opts =
              typeof item.valores_json === 'string'
                ? JSON.parse(item.valores_json)
                : item.valores_json
          } catch (e) {
            opts = []
          }
        } else if (item.dropdown_origem === 'sql') {
          opts = [{ value: 'sql', label: 'Opções Carregadas via SQL' }]
        } else {
          opts = (item.lista_manual || '')
            .split(';')
            .filter((s: string) => s.trim() !== '')
            .map((s: string) => ({ value: s.trim(), label: s.trim() }))
        }

        return (
          <Select value={val} onValueChange={setVal}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {opts.map((o: any) => (
                <SelectItem key={o.value} value={o.value}>
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
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Preenchimento de Checklist / Anamnese</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-4 space-y-8">
            {loading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : (
              <>
                <BodyMap
                  onNailClick={(part: string, n: number) => setNailModal({ part, n })}
                  markedNails={markedNails}
                />

                <div className="space-y-6 mt-8">
                  {items.map((it: any) => (
                    <div key={it.id} className="space-y-2 p-4 border rounded-xl bg-card">
                      <Label className="text-base font-semibold">
                        {it.pergunta}{' '}
                        {it.obrigatoria && <span className="text-destructive">*</span>}
                      </Label>
                      <div className="mt-2">{renderInput(it)}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          <DialogFooter className="mt-4 shrink-0">
            <Button
              disabled={saving || loading}
              onClick={handleFinish}
              className="w-full h-12 text-lg"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null} Concluir e
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {nailModal && (
        <Dialog open={true} onOpenChange={(o) => !o && setNailModal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Alteração (Unha {nailModal.n})</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleNailSave} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Tipo de Alteração</Label>
                <Select name="tipo_alteracao" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o problema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quebrada">Quebrada</SelectItem>
                    <SelectItem value="trincada">Trincada</SelectItem>
                    <SelectItem value="onicomicose">Onicomicose (Fungo)</SelectItem>
                    <SelectItem value="curvatura_excessiva">Curvatura Excessiva</SelectItem>
                    <SelectItem value="mancha">Mancha</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Descrição Adicional</Label>
                <Textarea name="descricao_texto" placeholder="Detalhes do problema encontrado..." />
              </div>
              <Button type="submit" className="w-full mt-4">
                Salvar Marcação
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
