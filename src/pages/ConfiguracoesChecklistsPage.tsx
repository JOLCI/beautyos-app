import { useState } from 'react'
import { useQuery } from '@/hooks/use-query'
import { usePasskey } from '@/contexts/PasskeyContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, Plus, Edit2, Trash2 } from 'lucide-react'

export default function ConfiguracoesChecklistsPage() {
  const { company } = usePasskey()
  const {
    data: checklists,
    loading,
    refetch,
  } = useQuery<any>('checklists', { match: { company_id: company?.id } })
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ nome: '', tipo: 'servico' as any })
  const [items, setItems] = useState<any[]>([])

  const openModal = async (checklist: any = null) => {
    if (checklist) {
      setEditingId(checklist.id)
      setForm({ nome: checklist.nome, tipo: checklist.tipo })
      const { data } = await supabase
        .from('checklist_items')
        .select('*')
        .eq('checklist_id', checklist.id)
        .order('ordem')
      setItems(data || [])
    } else {
      setEditingId(null)
      setForm({ nome: '', tipo: 'servico' })
      setItems([])
    }
    setOpen(true)
  }

  const addItem = () => {
    setItems([
      ...items,
      {
        id: `temp-${Date.now()}`,
        pergunta: '',
        tipo_resposta: 'texto',
        obrigatoria: false,
        dropdown_origem: 'manual',
        lista_manual: '',
        valores_json: '',
        query_sql: '',
      },
    ])
  }

  const updateItem = (id: string, field: string, value: any) => {
    setItems(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)))
  }

  const handleSave = async () => {
    if (!form.nome) return toast.error('Nome é obrigatório')

    let cid = editingId
    if (!cid) {
      const { data, error } = await supabase
        .from('checklists')
        .insert([{ company_id: company?.id, nome: form.nome, tipo: form.tipo }])
        .select()
        .single()
      if (error) return toast.error(error.message)
      cid = data.id
    } else {
      await supabase.from('checklists').update({ nome: form.nome, tipo: form.tipo }).eq('id', cid)
    }

    // Upsert items - simplificando deletando e reinserindo
    await supabase.from('checklist_items').delete().eq('checklist_id', cid)
    if (items.length > 0) {
      await supabase.from('checklist_items').insert(
        items.map((i, idx) => ({
          checklist_id: cid,
          pergunta: i.pergunta,
          tipo_resposta: i.tipo_resposta,
          obrigatoria: i.obrigatoria,
          dropdown_origem: i.tipo_resposta === 'dropdown' ? i.dropdown_origem : null,
          lista_manual: i.lista_manual,
          valores_json: i.valores_json,
          query_sql: i.query_sql,
          ordem: idx
        })),
      )
    }

    toast.success('Checklist salvo com sucesso')
    setOpen(false)
    refetch()
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Checklists e Anamnese</h1>
          <p className="text-muted-foreground">
            Configure os formulários para clientes e serviços.
          </p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="w-4 h-4 mr-2" /> Novo Checklist
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <div className="divide-y">
              {checklists?.map((c: any) => (
                <div key={c.id} className="p-4 flex items-center justify-between hover:bg-muted/30">
                  <div>
                    <h3 className="font-semibold">{c.nome}</h3>
                    <Badge variant="outline" className="mt-1 capitalize">
                      {c.tipo}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => openModal(c)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {checklists?.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  Nenhum checklist configurado.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 border-b shrink-0">
            <DialogTitle>{editingId ? 'Editar Checklist' : 'Novo Checklist'}</DialogTitle>
          </DialogHeader>
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Vincular a</Label>
                <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="servico">Serviço / Atendimento</SelectItem>
                    <SelectItem value="cliente">Cadastro de Cliente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">Perguntas</h3>
                <Button size="sm" variant="outline" onClick={addItem} type="button">
                  <Plus className="w-4 h-4 mr-2" /> Adicionar Pergunta
                </Button>
              </div>

              {items.map((it, i) => (
                <Card key={it.id} className="p-4 bg-muted/20 relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-destructive h-6 w-6"
                    onClick={() => setItems(items.filter((x) => x.id !== it.id))}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <div className="grid grid-cols-12 gap-4 pr-8">
                    <div className="col-span-12 md:col-span-7 space-y-2">
                      <Label>Pergunta</Label>
                      <Textarea
                        value={it.pergunta}
                        onChange={(e) => updateItem(it.id, 'pergunta', e.target.value)}
                        rows={2}
                      />
                    </div>
                    <div className="col-span-12 md:col-span-5 space-y-4">
                      <div className="space-y-2">
                        <Label>Tipo de Resposta</Label>
                        <Select
                          value={it.tipo_resposta}
                          onValueChange={(v) => updateItem(it.id, 'tipo_resposta', v)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="texto">Texto</SelectItem>
                            <SelectItem value="numero">Número</SelectItem>
                            <SelectItem value="data">Data</SelectItem>
                            <SelectItem value="sim_nao">Sim / Não</SelectItem>
                            <SelectItem value="dropdown">Lista de Opções</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={it.obrigatoria}
                          onCheckedChange={(v) => updateItem(it.id, 'obrigatoria', v)}
                          id={`ob-${it.id}`}
                        />
                        <Label htmlFor={`ob-${it.id}`}>Obrigatória</Label>
                      </div>
                    </div>

                    {it.tipo_resposta === 'dropdown' && (
                      <div className="col-span-12 mt-2 space-y-4 border-t pt-4">
                        <div className="space-y-2">
                          <Label>Origem dos Dados</Label>
                          <Select
                            value={it.dropdown_origem || 'manual'}
                            onValueChange={(v) => updateItem(it.id, 'dropdown_origem', v)}
                          >
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="manual">Manual (Texto)</SelectItem>
                              <SelectItem value="json">JSON</SelectItem>
                              <SelectItem value="sql">Query SQL</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {(!it.dropdown_origem || it.dropdown_origem === 'manual') && (
                          <div className="space-y-2">
                            <Label>Opções da Lista (Separe por ponto e vírgula ";")</Label>
                            <Input
                              value={it.lista_manual || ''}
                              onChange={(e) => updateItem(it.id, 'lista_manual', e.target.value)}
                              placeholder="Ex: Quebrada; Onicomicose; Mancha"
                            />
                          </div>
                        )}
                        {it.dropdown_origem === 'json' && (
                          <div className="space-y-2">
                            <Label>JSON Array de Objetos (Ex: [{"value":"1", "label":"A"}])</Label>
                            <Textarea
                              value={it.valores_json || ''}
                              onChange={(e) => updateItem(it.id, 'valores_json', e.target.value)}
                              placeholder='[{"value": "1", "label": "Opção 1"}]'
                            />
                          </div>
                        )}
                        {it.dropdown_origem === 'sql' && (
                          <div className="space-y-2">
                            <Label>Query SQL (Deve retornar 'value' e 'label')</Label>
                            <Textarea
                              value={it.query_sql || ''}
                              onChange={(e) => updateItem(it.id, 'query_sql', e.target.value)}
                              placeholder="SELECT id as value, name as label FROM public.services LIMIT 10"
                            />
                            <Button size="sm" variant="secondary" className="mt-2" onClick={() => toast.success('Query validada com sucesso! (Mock)')}>Testar Query</Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
              {items.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg border-dashed">
                  Nenhuma pergunta adicionada.
                </p>
              )}
            </div>
          </div>
          <DialogFooter className="p-6 border-t bg-muted/10 shrink-0">
            <Button onClick={handleSave}>Salvar Checklist</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
