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
} from 'lucide-react'

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

  const [waStatus, setWaStatus] = useState<'disconnected' | 'waiting' | 'connected'>('disconnected')
  const [waQrCode, setWaQrCode] = useState('')

  useEffect(() => {
    if (company) {
      setPrimaryColor(company.primary_color || '#e11d48')
      setSecondaryColor(company.secondary_color || '#ffffff')
      setName(company.name || '')
      setPasskey(company.passkey || '')
      setSettings(company.settings || {})
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

  const [pixForm, setPixForm] = useState({
    name: '',
    provider: 'mercadopago',
    pix_key: '',
    pix_key_type: 'cpf',
    is_active: false,
  })
  const [tplForm, setTplForm] = useState({ template_key: '', body: '' })

  const updateSetting = (key: string, value: any) => setSettings({ ...settings, [key]: value })

  const saveSettings = async () => {
    if (!company) return
    applyTheme(primaryColor, secondaryColor)

    const payload: any = {
      name,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      settings,
    }

    if (profile?.role === 'root') {
      payload.passkey = passkey.toUpperCase().replace(/\s+/g, '')
    }

    await supabase.from('companies').update(payload).eq('id', company.id)
    toast.success('Configurações salvas')
  }

  const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
  const [hours, setHours] = useState<any>(
    settings.business_hours ||
      days.reduce((acc, d) => ({ ...acc, [d]: { open: true, start: '08:00', end: '19:00' } }), {}),
  )

  const saveHours = () => {
    updateSetting('business_hours', hours)
    saveSettings()
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
          <TabsContent value="empresa" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Empresa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4 border p-4 rounded-xl bg-muted/20">
                  <h4 className="font-semibold text-sm">Adicionar Novo Gateway / Chave Simples</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome</Label>
                      <Input
                        value={pixForm.name}
                        onChange={(e) => setPixForm({ ...pixForm, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Provedor</Label>
                      <Select
                        value={pixForm.provider}
                        onValueChange={(v) => setPixForm({ ...pixForm, provider: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mercadopago">Mercado Pago (Auto)</SelectItem>
                          <SelectItem value="simples">PIX Simples (Manual)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Chave PIX</Label>
                      <Input
                        value={pixForm.pix_key}
                        onChange={(e) => setPixForm({ ...pixForm, pix_key: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo de Chave</Label>
                      <Select
                        value={pixForm.pix_key_type}
                        onValueChange={(v) => setPixForm({ ...pixForm, pix_key_type: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cpf">CPF/CNPJ</SelectItem>
                          <SelectItem value="email">E-mail</SelectItem>
                          <SelectItem value="phone">Telefone</SelectItem>
                          <SelectItem value="random">Aleatória</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    onClick={async () => {
                      await supabase
                        .from('pix_gateways')
                        .insert([{ ...pixForm, company_id: company?.id }])
                      toast.success('Gateway adicionado')
                      refetchPix()
                    }}
                  >
                    <Save className="w-4 h-4 mr-2" /> Salvar
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Identificação</TableHead>
                      <TableHead>Provedor</TableHead>
                      <TableHead>Chave</TableHead>
                      <TableHead>Ativo</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pixGateways.map((g: any) => (
                      <TableRow key={g.id}>
                        <TableCell className="font-medium">{g.name}</TableCell>
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
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
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
                  Utilize tags: [NOME_CLIENTE], [DATA_HORA], [VALOR], [LINK_PIX], [CHAVE_PIX],
                  [DATA].
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 border p-4 rounded-xl">
                  <div className="space-y-2">
                    <Label>Gatilho Automático</Label>
                    <Select
                      value={tplForm.template_key}
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
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input value={primaryColor} readOnly className="font-mono w-28" />
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
