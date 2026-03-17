import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@/hooks/use-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Save, MessageCircle, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function ClienteDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: clients, loading, refetch } = useQuery<any>('clients', { match: { id } })
  const { data: appointments } = useQuery<any>('appointments', { match: { client_id: id } })
  const { data: services } = useQuery<any>('services', { match: { type: 'service' } })

  const client = clients?.[0]
  const [form, setForm] = useState({ phone: '', email: '', birthday: '', notes: '' })
  const [anamnesis, setAnamnesis] = useState('')
  const [customPrices, setCustomPrices] = useState<Record<string, number>>({})

  useEffect(() => {
    if (client) {
      setForm({
        phone: client.phone || '',
        email: client.email || '',
        birthday: client.birthday || '',
        notes: client.notes || '',
      })
      setAnamnesis(client.anamnesis?.notes || '')
      setCustomPrices(client.special_prices || {})
    }
  }, [client])

  if (loading)
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    )
  if (!client) return <div className="p-8 text-center">Cliente não encontrado.</div>

  const saveDados = async () => {
    const { error } = await supabase.from('clients').update(form).eq('id', id)
    if (!error) {
      toast.success('Dados salvos')
      refetch()
    }
  }

  const saveAnamnesis = async () => {
    await supabase
      .from('clients')
      .update({ anamnesis: { notes: anamnesis } })
      .eq('id', id)
    toast.success('Anamnese atualizada')
  }

  const savePrices = async () => {
    await supabase.from('clients').update({ special_prices: customPrices }).eq('id', id)
    toast.success('Preços especiais atualizados')
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" className="mb-2 -ml-4" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
      </Button>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-6 rounded-2xl border shadow-sm">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
          <p className="text-muted-foreground mt-1">{client.email || 'Sem e-mail'}</p>
        </div>
        <Button className="rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white">
          <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
        </Button>
      </div>

      <Tabs defaultValue="dados" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full md:w-auto bg-muted/50 p-1">
          <TabsTrigger value="dados">Dados</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
          <TabsTrigger value="anamnese">Anamnese</TabsTrigger>
          <TabsTrigger value="precos">Preços Especiais</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="dados">
            <Card>
              <CardHeader>
                <CardTitle>Informações Cadastrais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-w-md">
                <div className="space-y-1">
                  <Label>Telefone</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>E-mail</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Data de Nascimento</Label>
                  <Input
                    type="date"
                    value={form.birthday}
                    onChange={(e) => setForm({ ...form, birthday: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Observações Gerais</Label>
                  <Textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="h-24"
                  />
                </div>
                <Button onClick={saveDados}>
                  <Save className="w-4 h-4 mr-2" /> Salvar
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historico">
            <Card>
              <CardHeader>
                <CardTitle>Agendamentos</CardTitle>
              </CardHeader>
              <CardContent>
                {appointments?.length > 0 ? (
                  <div className="space-y-3">
                    {appointments.map((a: any) => (
                      <div
                        key={a.id}
                        className="p-3 border rounded-lg flex justify-between items-center"
                      >
                        <div>
                          <p className="font-medium">{new Date(a.date).toLocaleDateString()}</p>
                          <p className="text-sm text-muted-foreground">
                            {a.start_time.slice(0, 5)} - {a.end_time.slice(0, 5)}
                          </p>
                        </div>
                        <div className="text-xs uppercase px-2 py-1 bg-muted rounded-md font-semibold">
                          {a.status}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhum histórico.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="anamnese">
            <Card>
              <CardHeader>
                <CardTitle>Anamnese</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  className="min-h-[150px]"
                  value={anamnesis}
                  onChange={(e) => setAnamnesis(e.target.value)}
                />
                <Button onClick={saveAnamnesis}>
                  <Save className="w-4 h-4 mr-2" /> Salvar Ficha
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="precos">
            <Card>
              <CardHeader>
                <CardTitle>Preços Customizados</CardTitle>
                <CardDescription>Defina valores diferenciados para este cliente.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 max-w-md">
                  {services?.map((s: any) => (
                    <div key={s.id} className="flex items-center justify-between">
                      <Label className="flex-1">
                        {s.name}{' '}
                        <span className="text-muted-foreground text-xs ml-2">
                          (Padrão: R$ {s.price})
                        </span>
                      </Label>
                      <Input
                        type="number"
                        className="w-24 text-right"
                        value={customPrices[s.id] || ''}
                        placeholder={String(s.price)}
                        onChange={(e) =>
                          setCustomPrices({ ...customPrices, [s.id]: Number(e.target.value) })
                        }
                      />
                    </div>
                  ))}
                </div>
                <Button onClick={savePrices} className="mt-4">
                  <Save className="w-4 h-4 mr-2" /> Salvar Preços
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
