import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { applyTheme } from '@/lib/colorUtils'
import { supabase } from '@/lib/supabase/client'
import { usePasskey } from '@/contexts/PasskeyContext'
import { useAuth } from '@/hooks/use-auth'
import { useQuery } from '@/hooks/use-query'
import {
  Save,
  Smartphone,
  Palette,
  Building2,
  Clock,
  MessageSquare,
  FileText,
  QrCode,
  Loader2,
  Trash2,
  Edit2,
  X,
  ShieldAlert,
  Search,
  CheckSquare,
} from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'

export default function ConfiguracoesPage() {
  const { company } = usePasskey()
  const { profile } = useAuth()
  const { data: pixGateways, refetch: refetchPix } = useQuery<any>('pix_gateways')
  const { data: waTemplates, refetch: refetchWa } = useQuery<any>('whatsapp_templates')

  const [primaryColor, setPrimaryColor] = useState('#e11d48')
  const [secondaryColor, setSecondaryColor] = useState('#ffffff')
  const [name, setName] = useState('')
  const [passkey, setPasskey] = useState('')
  const [settings, setSettings] = useState<any>({})
  const [logoUrl, setLogoUrl] = useState('')
  const [uploadingLogo, setUploadingLogo] = useState(false)

  const [waStatus, setWaStatus] = useState<'disconnected' | 'waiting' | 'connected'>('disconnected')

  const THEMES = [
    { name: 'Rosa (Padrão)', primary: '#e11d48' },
    { name: 'Lilás', primary: '#a855f7' },
    { name: 'Menta', primary: '#10b981' },
    { name: 'Azul Claro', primary: '#0ea5e9' },
    { name: 'Pink', primary: '#ec4899' },
  ]
  const [waQrCode, setWaQrCode] = useState('')

  // Restricted Area State
  const [raEntityType, setRaEntityType] = useState<'client' | 'supplier' | 'service'>('client')
  const [raEntityId, setRaEntityId] = useState('')
  const [raRecords, setRaRecords] = useState<
    { type: string; id: string; desc: string; date: string; status?: string }[]
  >([])
  const [raSelected, setRaSelected] = useState<Set<string>>(new Set())
  const [raLoading, setRaLoading] = useState(false)

  const { data: clientsList } = useQuery<any>('clients', { match: { is_active: true } })
  const { data: suppliersList } = useQuery<any>('suppliers', { match: { is_active: true } })
  const { data: servicesList } = useQuery<any>('services', { match: { is_active: true } })

  const loadRestrictedRecords = async (id: string, type: string) => {
    if (!id) {
      setRaRecords([])
      return
    }
    setRaLoading(true)
    const records: typeof raRecords = []

    if (type === 'client') {
      const [apps, txs, titles] = await Promise.all([
        supabase
          .from('appointments')
          .select('id, date, status, services(name)')
          .eq('client_id', id),
        supabase
          .from('transactions')
          .select('id, transaction_date, amount, description, status')
          .eq('client_id', id),
        supabase
          .from('financial_titles')
          .select('id, due_date, original_amount, description, status')
          .eq('client_id', id),
      ])
      apps.data?.forEach((a: any) =>
        records.push({
          id: a.id,
          type: 'appointment',
          desc: `Agendamento: ${a.services?.name || 'Serviço'}`,
          date: a.date,
          status: a.status,
        }),
      )
      txs.data?.forEach((t: any) =>
        records.push({
          id: t.id,
          type: 'transaction',
          desc: `Transação: R$ ${t.amount} - ${t.description || 'Sem desc'}`,
          date: t.transaction_date,
          status: t.status,
        }),
      )
      titles.data?.forEach((t: any) =>
        records.push({
          id: t.id,
          type: 'title',
          desc: `Título: R$ ${t.original_amount} - ${t.description || 'Sem desc'}`,
          date: t.due_date,
          status: t.status,
        }),
      )
    } else if (type === 'supplier') {
      const [txs, titles] = await Promise.all([
        supabase
          .from('transactions')
          .select('id, transaction_date, amount, description, status')
          .eq('supplier_id', id),
        supabase
          .from('financial_titles')
          .select('id, due_date, original_amount, description, status')
          .eq('supplier_id', id),
      ])
      txs.data?.forEach((t: any) =>
        records.push({
          id: t.id,
          type: 'transaction',
          desc: `Transação: R$ ${t.amount} - ${t.description || 'Sem desc'}`,
          date: t.transaction_date,
          status: t.status,
        }),
      )
      titles.data?.forEach((t: any) =>
        records.push({
          id: t.id,
          type: 'title',
          desc: `Título: R$ ${t.original_amount} - ${t.description || 'Sem desc'}`,
          date: t.due_date,
          status: t.status,
        }),
      )
    } else if (type === 'service') {
      const { data: apps } = await supabase
        .from('appointments')
        .select('id, date, status, services(name)')
        .eq('service_id', id)
      apps?.forEach((a: any) =>
        records.push({
          id: a.id,
          type: 'appointment',
          desc: `Agendamento: ${a.services?.name || 'Serviço'}`,
          date: a.date,
          status: a.status,
        }),
      )
    }

    setRaRecords(records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
    setRaSelected(new Set())
    setRaLoading(false)
  }

  const executeBulkDelete = async () => {
    if (raSelected.size === 0) return
    if (
      !confirm(
        `Tem certeza que deseja excluir permanentemente ${raSelected.size} registro(s)? Essa ação apagará dados dependentes (ex: comissões, agendamentos de WhatsApp).`,
      )
    )
      return

    setRaLoading(true)
    const toDelete = Array.from(raSelected)
    const apps = toDelete.filter((id) => raRecords.find((r) => r.id === id)?.type === 'appointment')
    const txs = toDelete.filter((id) => raRecords.find((r) => r.id === id)?.type === 'transaction')
    const titles = toDelete.filter((id) => raRecords.find((r) => r.id === id)?.type === 'title')

    try {
      // Due to constraints, order matters: transactions then appointments then titles
      if (txs.length) await supabase.from('transactions').delete().in('id', txs)
      if (apps.length) await supabase.from('appointments').delete().in('id', apps)
      if (titles.length) await supabase.from('financial_titles').delete().in('id', titles)

      toast.success('Registros excluídos com sucesso')
      loadRestrictedRecords(raEntityId, raEntityType)
    } catch (e) {
      toast.error('Erro ao excluir registros')
    }
    setRaLoading(false)
  }

  useEffect(() => {
    if (company) {
      setPrimaryColor(company.primary_color || '#e11d48')
      setSecondaryColor(company.secondary_color || '#ffffff')
      setName(company.name || '')
      setPasskey(company.passkey || '')
      setSettings(company.settings || {})
      setLogoUrl(company.logo_url || '')

      const daysArr = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
      if (company.settings?.business_hours) {
        setHours(company.settings.business_hours)
      } else {
        setHours(
          daysArr.reduce(
            (acc, d) => ({ ...acc, [d]: { open: true, start: '08:00', end: '19:00' } }),
            {},
          ),
        )
      }
    }
  }, [company])

  useEffect(() => {
    const checkWaStatus = async () => {
      try {
        const { data } = await supabase.functions.invoke('whatsapp-check-status')
        if (data?.status === 'connected') {
          setWaStatus('connected')
        }
      } catch (e) {
        console.error('Error checking WhatsApp status:', e)
      }
    }
    checkWaStatus()
  }, [])

  const defaultPixForm = {
    name: '',
    provider: 'mercadopago',
    pix_key: '',
    pix_key_type: 'cpf',
    notes: '',
    is_active: false,
  }
  const [pixForm, setPixForm] = useState(defaultPixForm)
  const [editingPixId, setEditingPixId] = useState<string | null>(null)

  const [tplForm, setTplForm] = useState({ template_key: '', body: '' })

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !company) return
    setUploadingLogo(true)
    const ext = file.name.split('.').pop()
    const path = `logos/${company.id}_${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('avatars').upload(path, file)
    if (error) {
      toast.error('Erro ao subir logo')
      setUploadingLogo(false)
      return
    }
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
    setLogoUrl(urlData.publicUrl)
    setUploadingLogo(false)
    toast.success('Logo carregada com sucesso')
  }

  const updateSetting = (key: string, value: any) => setSettings({ ...settings, [key]: value })

  const saveSettings = async () => {
    if (!company) return
    applyTheme(primaryColor, secondaryColor)

    const payload: any = {
      name,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      settings,
      logo_url: logoUrl,
    }

    if (profile?.role === 'root') {
      payload.passkey = passkey.toUpperCase().replace(/\s+/g, '')
    }

    const { error } = await supabase.from('companies').update(payload).eq('id', company.id)
    if (error) {
      toast.error('Erro ao salvar configurações')
    } else {
      toast.success('Configurações salvas com sucesso')
      setTimeout(() => window.location.reload(), 1000)
    }
  }

  const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
  const [hours, setHours] = useState<any>({})

  // Salva especificamente os horários de funcionamento garantindo a persistência imediata
  const saveHours = async () => {
    if (!company) return
    const novosSettings = { ...settings, business_hours: hours }
    setSettings(novosSettings)

    const { error } = await supabase
      .from('companies')
      .update({ settings: novosSettings })
      .eq('id', company.id)
    if (error) {
      toast.error('Erro ao salvar horários')
    } else {
      toast.success('Horários salvos e atualizados com sucesso')
      setTimeout(() => window.location.reload(), 1000)
    }
  }

  const connectWhatsApp = async () => {
    setWaStatus('waiting')
    const { data } = await supabase.functions.invoke('whatsapp-generate-qr')
    if (data?.success) {
      setWaQrCode(
        data.qr.startsWith('data:')
          ? data.qr
          : `https://img.usecurling.com/i?q=qr-code&color=black&shape=outline`,
      )
    }

    const interval = setInterval(async () => {
      const { data: st } = await supabase.functions.invoke('whatsapp-check-status')
      if (st?.status === 'connected') {
        setWaStatus('connected')
        clearInterval(interval)
        toast.success('WhatsApp Conectado')
      }
    }, 5000)
    setTimeout(() => clearInterval(interval), 180000)
  }

  const handleEditPix = (g: any) => {
    setEditingPixId(g.id)
    setPixForm({
      name: g.name,
      provider: g.provider,
      pix_key: g.pix_key,
      pix_key_type: g.pix_key_type,
      notes: g.notes || '',
      is_active: g.is_active || false,
    })
  }

  const handleDeletePix = async (id: string) => {
    if (!confirm('Deseja realmente remover este gateway?')) return
    await supabase.from('pix_gateways').delete().eq('id', id)
    toast.success('Gateway removido')
    refetchPix()
  }

  const handleSavePix = async () => {
    if (editingPixId) {
      await supabase.from('pix_gateways').update(pixForm).eq('id', editingPixId)
      toast.success('Gateway atualizado')
    } else {
      await supabase.from('pix_gateways').insert([{ ...pixForm, company_id: company?.id }])
      toast.success('Gateway adicionado')
    }
    setEditingPixId(null)
    setPixForm(defaultPixForm)
    refetchPix()
  }

  const cancelPixEdit = () => {
    setEditingPixId(null)
    setPixForm(defaultPixForm)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Ajuste parâmetros operacionais e de comunicação.</p>
      </div>

      <Tabs defaultValue="empresa" className="flex flex-col md:flex-row gap-6">
        <TabsList className="flex md:flex-col h-auto bg-transparent p-0 gap-2 w-full md:w-64 justify-start overflow-x-auto border-r-0 md:border-r pr-2">
          {[
            { id: 'empresa', label: 'Empresa', icon: Building2 },
            { id: 'horarios', label: 'Horários', icon: Clock },
            { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
            { id: 'pix', label: 'PIX / Pagamentos', icon: Smartphone },
            { id: 'templates', label: 'Templates', icon: FileText },
            { id: 'aparencia', label: 'Aparência', icon: Palette },
            ...(profile?.role === 'admin' || profile?.role === 'root'
              ? [{ id: 'restrita', label: 'Área Restrita', icon: ShieldAlert }]
              : []),
          ].map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="w-full justify-start gap-3 px-4 py-3 h-auto data-[state=active]:bg-primary/10 rounded-xl"
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex-1 min-w-0">
          <TabsContent value="restrita" className="mt-0">
            <Card className="border-destructive/20">
              <CardHeader className="bg-destructive/5 rounded-t-xl">
                <CardTitle className="text-destructive flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5" /> Área Restrita
                </CardTitle>
                <CardDescription>
                  Limpeza e exclusão em massa de registros. Ações aqui são irreversíveis e acionam
                  exclusão em cascata (comissões, mensagens agendadas).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="space-y-2 w-full sm:w-1/3">
                    <Label>Tipo de Entidade</Label>
                    <Select
                      value={raEntityType}
                      onValueChange={(v: any) => {
                        setRaEntityType(v)
                        setRaEntityId('')
                        setRaRecords([])
                        setRaSelected(new Set())
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="client">Cliente</SelectItem>
                        <SelectItem value="supplier">Fornecedor</SelectItem>
                        <SelectItem value="service">Serviço/Produto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 w-full sm:w-2/3">
                    <Label>Selecione a Entidade</Label>
                    <Select
                      value={raEntityId}
                      onValueChange={(v) => {
                        setRaEntityId(v)
                        loadRestrictedRecords(v, raEntityType)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {raEntityType === 'client' &&
                          clientsList?.map((c: any) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        {raEntityType === 'supplier' &&
                          suppliersList?.map((c: any) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        {raEntityType === 'service' &&
                          servicesList?.map((c: any) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {raEntityId && (
                  <div className="space-y-4 border rounded-xl overflow-hidden">
                    <div className="bg-muted/50 p-3 flex items-center justify-between border-b">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={raRecords.length > 0 && raSelected.size === raRecords.length}
                          onCheckedChange={(c) => {
                            if (c) setRaSelected(new Set(raRecords.map((r) => r.id)))
                            else setRaSelected(new Set())
                          }}
                        />
                        <span className="text-sm font-medium">
                          Selecionar Todos ({raRecords.length})
                        </span>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={executeBulkDelete}
                        disabled={raSelected.size === 0 || raLoading}
                      >
                        {raLoading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 mr-2" />
                        )}
                        Excluir ({raSelected.size})
                      </Button>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto p-0">
                      <Table>
                        <TableHeader className="sticky top-0 bg-background shadow-sm">
                          <TableRow>
                            <TableHead className="w-12"></TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Descrição</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {raRecords.map((r) => (
                            <TableRow key={r.id}>
                              <TableCell>
                                <Checkbox
                                  checked={raSelected.has(r.id)}
                                  onCheckedChange={(c) => {
                                    const next = new Set(raSelected)
                                    if (c) next.add(r.id)
                                    else next.delete(r.id)
                                    setRaSelected(next)
                                  }}
                                />
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                {new Date(r.date).toLocaleDateString('pt-BR')}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="uppercase text-[10px]">
                                  {r.type === 'appointment'
                                    ? 'Agendamento'
                                    : r.type === 'transaction'
                                      ? 'Transação'
                                      : 'Título'}
                                </Badge>
                              </TableCell>
                              <TableCell className="truncate max-w-[200px]">{r.desc}</TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="uppercase text-[10px]">
                                  {r.status || '-'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                          {raRecords.length === 0 && (
                            <TableRow>
                              <TableCell
                                colSpan={5}
                                className="text-center py-8 text-muted-foreground"
                              >
                                Nenhum registro encontrado para esta entidade.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="empresa" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Empresa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <div className="space-y-2 flex flex-col items-center shrink-0">
                    <Label>Logomarca</Label>
                    <div className="relative group cursor-pointer mt-2">
                      <div className="w-24 h-24 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden bg-muted/30">
                        {logoUrl ? (
                          <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>
                      <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-xl cursor-pointer">
                        {uploadingLogo ? (
                          <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                          <span className="text-xs font-medium">Alterar</span>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleLogoUpload}
                          disabled={uploadingLogo}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="flex-1 w-full space-y-4">
                    <div className="space-y-2">
                      <Label>Nome do Salão</Label>
                      <Input value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>CNPJ</Label>
                      <Input
                        value={settings.cnpj || ''}
                        onChange={(e) => updateSetting('cnpj', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Passkey de Acesso</Label>
                  <Input
                    value={passkey}
                    onChange={(e) => setPasskey(e.target.value)}
                    disabled={profile?.role !== 'root'}
                    className="font-mono uppercase"
                  />
                  {profile?.role !== 'root' && (
                    <p className="text-[10px] text-muted-foreground">
                      Apenas administradores globais (root) podem alterar a chave de acesso.
                    </p>
                  )}
                </div>
                <Button onClick={saveSettings} className="w-full sm:w-auto mt-4">
                  <Save className="w-4 h-4 mr-2" /> Salvar
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="horarios" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Horário de Funcionamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {days.map((d) => (
                  <div
                    key={d}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 bg-muted/30 rounded-lg border"
                  >
                    <div className="flex items-center gap-3 w-full sm:w-32 shrink-0">
                      <Switch
                        checked={hours[d]?.open}
                        onCheckedChange={(v) =>
                          setHours({ ...hours, [d]: { ...hours[d], open: v } })
                        }
                      />
                      <Label>{d}</Label>
                    </div>
                    {hours[d]?.open ? (
                      <div className="flex items-center gap-2 w-full sm:flex-1 sm:max-w-[250px]">
                        <Input
                          type="time"
                          value={hours[d]?.start}
                          onChange={(e) =>
                            setHours({ ...hours, [d]: { ...hours[d], start: e.target.value } })
                          }
                          className="flex-1"
                        />
                        <span className="text-muted-foreground text-xs">até</span>
                        <Input
                          type="time"
                          value={hours[d]?.end}
                          onChange={(e) =>
                            setHours({ ...hours, [d]: { ...hours[d], end: e.target.value } })
                          }
                          className="flex-1"
                        />
                      </div>
                    ) : (
                      <div className="w-full sm:flex-1 text-muted-foreground text-sm pl-0 sm:pl-2">
                        Fechado
                      </div>
                    )}
                  </div>
                ))}
                <Button onClick={saveHours} className="w-full sm:w-auto mt-4">
                  <Save className="w-4 h-4 mr-2" /> Salvar Horários
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="whatsapp" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Conexão WhatsApp (Evolution API)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/30">
                  <div>
                    <Label className="text-lg">Instância Isolada</Label>
                    <p className="text-sm text-muted-foreground font-mono mt-1">
                      ID: beautyos_{company?.passkey}
                    </p>
                  </div>
                  <Badge
                    variant={waStatus === 'connected' ? 'default' : 'secondary'}
                    className={waStatus === 'connected' ? 'bg-green-500 hover:bg-green-600' : ''}
                  >
                    {waStatus === 'connected'
                      ? 'Conectado'
                      : waStatus === 'waiting'
                        ? 'Aguardando Leitura'
                        : 'Desconectado'}
                  </Badge>
                </div>
                {waStatus === 'disconnected' && (
                  <Button onClick={connectWhatsApp} className="w-full h-12">
                    <QrCode className="w-4 h-4 mr-2" /> Gerar QR Code de Conexão
                  </Button>
                )}
                {waStatus === 'waiting' && (
                  <div className="flex flex-col items-center p-8 border rounded-xl bg-muted/30 space-y-4">
                    <div className="w-48 h-48 bg-white border p-2 rounded-lg flex items-center justify-center overflow-hidden">
                      {waQrCode ? (
                        <img src={waQrCode} alt="QR Code" className="w-full h-full object-cover" />
                      ) : (
                        <Loader2 className="w-8 h-8 animate-spin" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      Escaneie o QR Code com o WhatsApp do seu salão para ativar a automação.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pix" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Gateways PIX</CardTitle>
                <CardDescription>
                  Configure os provedores de recebimento PIX e chaves simples.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div
                  className={`space-y-4 border p-4 rounded-xl ${editingPixId ? 'bg-primary/5 border-primary/20' : 'bg-muted/20'}`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">
                      {editingPixId ? 'Editar Gateway' : 'Adicionar Novo Gateway / Chave Simples'}
                    </h4>
                    {editingPixId && (
                      <Button variant="ghost" size="sm" onClick={cancelPixEdit}>
                        <X className="w-4 h-4 mr-2" /> Cancelar
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome</Label>
                      <Input
                        value={pixForm.name}
                        onChange={(e) => setPixForm({ ...pixForm, name: e.target.value })}
                        placeholder="Ex: Banco Itaú Principal"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Provedor</Label>
                      <Select
                        value={pixForm.provider || undefined}
                        onValueChange={(v) => setPixForm({ ...pixForm, provider: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um provedor..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mercadopago">Mercado Pago (Automático)</SelectItem>
                          <SelectItem value="simples">PIX Simples (Manual)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Chave PIX</Label>
                      <Input
                        value={pixForm.pix_key}
                        onChange={(e) => setPixForm({ ...pixForm, pix_key: e.target.value })}
                        placeholder="Chave PIX (E-mail, CPF, Telefone...)"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo de Chave</Label>
                      <Select
                        value={pixForm.pix_key_type || undefined}
                        onValueChange={(v) => setPixForm({ ...pixForm, pix_key_type: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo de chave..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cpf">CPF/CNPJ</SelectItem>
                          <SelectItem value="email">E-mail</SelectItem>
                          <SelectItem value="phone">Telefone</SelectItem>
                          <SelectItem value="random">Aleatória</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Notas Adicionais (opcional)</Label>
                      <Input
                        value={pixForm.notes}
                        onChange={(e) => setPixForm({ ...pixForm, notes: e.target.value })}
                        placeholder="Informações para uso interno"
                      />
                    </div>
                  </div>
                  <Button onClick={handleSavePix} disabled={!pixForm.name || !pixForm.pix_key}>
                    <Save className="w-4 h-4 mr-2" />{' '}
                    {editingPixId ? 'Salvar Alterações' : 'Adicionar Gateway'}
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Identificação</TableHead>
                      <TableHead>Provedor</TableHead>
                      <TableHead>Chave</TableHead>
                      <TableHead>Ativo</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pixGateways.map((g: any) => (
                      <TableRow key={g.id}>
                        <TableCell className="font-medium">
                          {g.name}
                          {g.notes && (
                            <p className="text-xs text-muted-foreground mt-0.5">{g.notes}</p>
                          )}
                        </TableCell>
                        <TableCell className="capitalize">{g.provider}</TableCell>
                        <TableCell className="font-mono text-xs">{g.pix_key}</TableCell>
                        <TableCell>
                          <Switch
                            checked={g.is_active}
                            onCheckedChange={async (v) => {
                              await supabase
                                .from('pix_gateways')
                                .update({ is_active: v })
                                .eq('id', g.id)
                              refetchPix()
                            }}
                          />
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditPix(g)}>
                            <Edit2 className="w-4 h-4 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleDeletePix(g.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {pixGateways.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Nenhum gateway PIX cadastrado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Templates de Mensagens</CardTitle>
                <CardDescription>
                  Utilize tags: [NOME_CLIENTE], [DATA_HORA], [VALOR], [LINK_PIX], [PIX], [DATA],
                  [SERVICOS].
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 border p-4 rounded-xl">
                  <div className="space-y-2">
                    <Label>Gatilho Automático</Label>
                    <Select
                      value={tplForm.template_key || undefined}
                      onValueChange={(v) => {
                        const ex = waTemplates.find((t: any) => t.template_key === v)
                        setTplForm({ template_key: v, body: ex ? ex.body : '' })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha um evento..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lembrete_24h">Lembrete (24h antes)</SelectItem>
                        <SelectItem value="lembrete_1h">Lembrete (1h antes)</SelectItem>
                        <SelectItem value="cobranca_pix_agendado">
                          Cobrança (Vencimento PIX)
                        </SelectItem>
                        <SelectItem value="pos_atendimento">Pós-Atendimento / Avaliação</SelectItem>
                        <SelectItem value="aniversario">Aniversário (08:00 AM)</SelectItem>
                        <SelectItem value="recorrencia">Recorrência (7 dias antes)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {tplForm.template_key && (
                    <div className="space-y-2 animate-in fade-in">
                      <Label>Mensagem</Label>
                      <Textarea
                        value={tplForm.body}
                        onChange={(e) => setTplForm({ ...tplForm, body: e.target.value })}
                        className="h-32 font-mono text-sm leading-relaxed"
                      />
                      <Button
                        onClick={async () => {
                          const existing = waTemplates.find(
                            (t: any) => t.template_key === tplForm.template_key,
                          )
                          if (existing)
                            await supabase
                              .from('whatsapp_templates')
                              .update({ body: tplForm.body })
                              .eq('id', existing.id)
                          else
                            await supabase
                              .from('whatsapp_templates')
                              .insert([
                                { ...tplForm, name: tplForm.template_key, company_id: company?.id },
                              ])
                          toast.success('Template salvo')
                          refetchWa()
                        }}
                        className="w-full sm:w-auto"
                      >
                        <Save className="w-4 h-4 mr-2" /> Salvar Template
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="aparencia" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Identidade Visual</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-8">
                  <div className="space-y-2">
                    <Label>Cor Primária (Destaques)</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input value={primaryColor} readOnly className="font-mono w-28" />
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {THEMES.map((t) => (
                        <button
                          key={t.name}
                          type="button"
                          onClick={() => setPrimaryColor(t.primary)}
                          className={`w-8 h-8 rounded-full border-2 shadow-sm transition-all hover:scale-110 ${primaryColor === t.primary ? 'ring-2 ring-offset-2 ring-primary border-transparent' : 'border-border'}`}
                          style={{ backgroundColor: t.primary }}
                          title={t.name}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Cor Secundária</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input value={secondaryColor} readOnly className="font-mono w-28" />
                    </div>
                  </div>
                </div>
                <Button onClick={saveSettings} className="w-full sm:w-auto mt-4">
                  <Palette className="w-4 h-4 mr-2" /> Aplicar Tema
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
