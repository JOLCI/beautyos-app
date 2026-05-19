import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@/hooks/use-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft, Save, MessageCircle, Loader2, Camera } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { usePasskey } from '@/contexts/PasskeyContext'
import { toast } from 'sonner'
import { ClientTimeline } from '@/components/clients/ClientTimeline'
import { ClientCrmTable } from '@/components/clients/ClientCrmTable'

export default function ClienteDetailPage() {
  const { id } = useParams()
  const { company } = usePasskey()
  const navigate = useNavigate()

  const { data: clients, loading, refetch } = useQuery<any>('clients', { match: { id } })
  const { data: appointments } = useQuery<any>('appointments', { match: { client_id: id } })
  const { data: transactions } = useQuery<any>('transactions', { match: { client_id: id } })
  const { data: titles } = useQuery<any>('financial_titles', { match: { client_id: id } })
  const { data: waSchedules } = useQuery<any>('whatsapp_message_schedules', {
    match: { client_id: id },
  })
  const { data: services } = useQuery<any>('services', { match: { type: 'service' } })
  const { data: serviceIntervals } = useQuery<any>('v_client_service_intervals', {
    match: { client_id: id },
  })

  const client = clients?.[0]
  const [form, setForm] = useState({
    phone: '',
    email: '',
    birthday: '',
    notes: '',
    avatar_url: '',
  })
  const [anamnesis, setAnamnesis] = useState('')
  const [customPrices, setCustomPrices] = useState<Record<string, number>>({})
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (client) {
      setForm({
        phone: client.phone || '',
        email: client.email || '',
        birthday: client.birthday || '',
        notes: client.notes || '',
        avatar_url: client.avatar_url || '',
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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${company?.id}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('client-photos').upload(path, file)
    if (error) {
      toast.error('Erro ao subir foto')
      setUploading(false)
      return
    }
    const { data: urlData } = supabase.storage.from('client-photos').getPublicUrl(path)
    setForm({ ...form, avatar_url: urlData.publicUrl })
    await supabase.from('clients').update({ avatar_url: urlData.publicUrl }).eq('id', id)
    refetch()
    setUploading(false)
    toast.success('Foto atualizada')
  }

  const saveDados = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('clients')
      .update({ phone: form.phone, email: form.email, birthday: form.birthday, notes: form.notes })
      .eq('id', id)
    if (!error) {
      toast.success('Dados salvos')
      refetch()
    } else {
      toast.error('Erro ao salvar dados')
    }
    setSaving(false)
  }

  const saveAnamnesis = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('clients')
      .update({ anamnesis: { notes: anamnesis } })
      .eq('id', id)
    if (!error) toast.success('Anamnese atualizada')
    else toast.error('Erro ao salvar anamnese')
    setSaving(false)
  }

  const savePrices = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('clients')
      .update({ special_prices: customPrices })
      .eq('id', id)
    if (!error) toast.success('Preços especiais atualizados')
    else toast.error('Erro ao salvar preços')
    setSaving(false)
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <Button variant="ghost" className="mb-2 -ml-4" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
      </Button>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-6 rounded-2xl border shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-4 relative z-10">
          <div className="relative group">
            <Avatar className="h-20 w-20 border-2 border-background shadow-sm">
              <AvatarImage
                src={
                  client.avatar_url ||
                  `https://img.usecurling.com/ppl/thumbnail?gender=female&seed=${client.id}`
                }
              />
              <AvatarFallback className="text-xl">{client.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <Label
              htmlFor="avatar-upload"
              className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              {uploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Camera className="w-5 h-5" />
              )}
            </Label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
              disabled={uploading}
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
            <p className="text-muted-foreground mt-1">
              {client.phone} • {client.email || 'Sem e-mail'}
            </p>
          </div>
        </div>
        <Button className="rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-sm">
          <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
        </Button>
      </div>

      <Tabs defaultValue="crm" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full md:w-auto bg-muted/50 p-1 h-auto gap-1">
          <TabsTrigger value="crm">CRM & Consumo</TabsTrigger>
          <TabsTrigger value="historico">Histórico 360º</TabsTrigger>
          <TabsTrigger value="dados">Dados Pessoais</TabsTrigger>
          <TabsTrigger value="anamnese">Ficha/Anamnese</TabsTrigger>
          <TabsTrigger value="precos">Preços Especiais</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="crm" className="space-y-4">
            <ClientCrmTable
              serviceIntervals={serviceIntervals || []}
              transactions={transactions || []}
            />
          </TabsContent>
          <TabsContent value="historico">
            <ClientTimeline
              appointments={appointments || []}
              transactions={transactions || []}
              titles={titles || []}
              waSchedules={waSchedules || []}
            />
          </TabsContent>

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
                  />
                </div>
                <Button onClick={saveDados} disabled={saving}>
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}{' '}
                  Salvar Cadastro
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="anamnese">
            <Card>
              <CardHeader>
                <CardTitle>Anamnese e Evolução</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  className="min-h-[200px]"
                  value={anamnesis}
                  placeholder="Descreva aqui alergias, preferências e histórico clínico do cliente..."
                  onChange={(e) => setAnamnesis(e.target.value)}
                />
                <Button onClick={saveAnamnesis} disabled={saving}>
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}{' '}
                  Salvar Anamnese
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="precos">
            <Card>
              <CardHeader>
                <CardTitle>Tabela de Preços Customizados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-w-md">
                {services?.map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between gap-4">
                    <Label className="flex-1 leading-snug">
                      {s.name} <br />
                      <span className="text-muted-foreground text-[10px] uppercase font-semibold">
                        Padrão: R$ {s.price}
                      </span>
                    </Label>
                    <Input
                      type="number"
                      className="w-28 text-right"
                      value={customPrices[s.id] || ''}
                      placeholder={String(s.price)}
                      onChange={(e) =>
                        setCustomPrices({ ...customPrices, [s.id]: Number(e.target.value) })
                      }
                    />
                  </div>
                ))}
                <Button onClick={savePrices} className="mt-4 w-full" disabled={saving}>
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}{' '}
                  Salvar Preços
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
