import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@/hooks/use-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Save,
  MessageCircle,
  Loader2,
  Calendar,
  DollarSign,
  FileText,
  Send,
  Camera,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { usePasskey } from '@/contexts/PasskeyContext'
import { toast } from 'sonner'
import { translateStatus } from '@/lib/utils'

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

  const timeline = useMemo(() => {
    const events: any[] = []
    appointments?.forEach((a: any) =>
      events.push({
        type: 'appointment',
        date: a.created_at,
        data: a,
        icon: Calendar,
        color: 'text-blue-500',
        bg: 'bg-blue-50',
      }),
    )
    transactions?.forEach((t: any) =>
      events.push({
        type: 'transaction',
        date: t.created_at,
        data: t,
        icon: DollarSign,
        color: 'text-green-500',
        bg: 'bg-green-50',
      }),
    )
    titles?.forEach((t: any) =>
      events.push({
        type: 'title',
        date: t.created_at,
        data: t,
        icon: FileText,
        color: 'text-amber-500',
        bg: 'bg-amber-50',
      }),
    )
    waSchedules?.forEach((w: any) =>
      events.push({
        type: 'whatsapp',
        date: w.created_at,
        data: w,
        icon: Send,
        color: 'text-emerald-500',
        bg: 'bg-emerald-50',
      }),
    )

    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [appointments, transactions, titles, waSchedules])

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

    const newUrl = urlData.publicUrl
    setForm({ ...form, avatar_url: newUrl })
    await supabase.from('clients').update({ avatar_url: newUrl }).eq('id', id)
    refetch()
    setUploading(false)
    toast.success('Foto atualizada')
  }

  const saveDados = async () => {
    const { error } = await supabase
      .from('clients')
      .update({
        phone: form.phone,
        email: form.email,
        birthday: form.birthday,
        notes: form.notes,
      })
      .eq('id', id)
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

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-6 rounded-2xl border shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-4 relative z-10">
          <div className="relative group">
            <Avatar className="h-20 w-20 border-2 border-background shadow-sm">
              <AvatarImage
                src={
                  client.avatar_url || `https://img.usecurling.com/ppl/thumbnail?seed=${client.id}`
                }
              />
              <AvatarFallback className="text-xl">{client.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <Label
              htmlFor="avatar-upload-page"
              className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              {uploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Camera className="w-5 h-5" />
              )}
            </Label>
            <input
              id="avatar-upload-page"
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
        <Button className="rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white relative z-10">
          <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
        </Button>
      </div>

      <Tabs defaultValue="historico" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full md:w-auto bg-muted/50 p-1">
          <TabsTrigger value="historico">Histórico Unificado</TabsTrigger>
          <TabsTrigger value="dados">Dados</TabsTrigger>
          <TabsTrigger value="anamnese">Anamnese</TabsTrigger>
          <TabsTrigger value="precos">Preços</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="historico">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Eventos (360º)</CardTitle>
                <CardDescription>
                  Rastreabilidade completa de agendamentos e transações.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {timeline.length > 0 ? (
                  <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                    {timeline.map((ev, idx) => {
                      const Icon = ev.icon
                      return (
                        <div
                          key={idx}
                          className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                        >
                          <div
                            className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-card shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm ${ev.color} z-10`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border bg-card shadow-sm space-y-1">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                {ev.type === 'appointment'
                                  ? 'Agendamento'
                                  : ev.type === 'transaction'
                                    ? 'Transação Caixa'
                                    : ev.type === 'title'
                                      ? 'Título Financeiro'
                                      : 'WhatsApp Automático'}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {new Date(ev.date).toLocaleString()}
                              </span>
                            </div>

                            {ev.type === 'appointment' && (
                              <div>
                                <p className="font-medium">
                                  {ev.data.date} às {ev.data.start_time.slice(0, 5)}
                                </p>
                                <Badge variant="outline" className="text-[10px] mt-1 uppercase">
                                  {translateStatus(ev.data.status)}
                                </Badge>
                              </div>
                            )}

                            {ev.type === 'transaction' && (
                              <div>
                                <p className="font-medium text-lg">
                                  R$ {ev.data.amount.toFixed(2)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {ev.data.payment_method} • {translateStatus(ev.data.status)}
                                </p>
                              </div>
                            )}

                            {ev.type === 'title' && (
                              <div>
                                <p className="font-medium">
                                  Original: R$ {ev.data.original_amount.toFixed(2)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Vencimento: {new Date(ev.data.due_date).toLocaleDateString()} •{' '}
                                  {translateStatus(ev.data.status)}
                                </p>
                              </div>
                            )}

                            {ev.type === 'whatsapp' && (
                              <div>
                                <p className="text-sm italic line-clamp-2 text-muted-foreground">
                                  "{ev.data.rendered_message}"
                                </p>
                                <Badge variant="secondary" className="text-[10px] mt-2 uppercase">
                                  {translateStatus(ev.data.status)}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhum evento registrado para este cliente.
                  </p>
                )}
              </CardContent>
            </Card>
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
                    className="h-24"
                  />
                </div>
                <Button onClick={saveDados}>
                  <Save className="w-4 h-4 mr-2" /> Salvar
                </Button>
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
