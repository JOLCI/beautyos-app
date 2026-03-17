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
import { useQuery } from '@/hooks/use-query'
import {
  Save,
  Smartphone,
  Palette,
  Calendar,
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
  const { data: pixGateways, refetch: refetchPix } = useQuery<any>('pix_gateways')
  const { data: waTemplates, refetch: refetchWa } = useQuery<any>('whatsapp_templates')

  const [primaryColor, setPrimaryColor] = useState(company?.primary_color || '#e11d48')
  const [name, setName] = useState(company?.name || '')
  const [settings, setSettings] = useState<any>(company?.settings || {})

  const [waStatus, setWaStatus] = useState<'disconnected' | 'waiting' | 'connected'>('disconnected')
  const [waQrCode, setWaQrCode] = useState('')

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
    applyTheme(primaryColor)
    await supabase
      .from('companies')
      .update({ name, primary_color: primaryColor, settings })
      .eq('id', company.id)
    toast.success('Configurações salvas')
  }

  // Business Hours setup
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
    if (data?.success) setWaQrCode(data.qr)

    // Poll for connection
    const interval = setInterval(async () => {
      const { data: st } = await supabase.functions.invoke('whatsapp-check-status')
      if (st?.status === 'connected') {
        setWaStatus('connected')
        clearInterval(interval)
        toast.success('WhatsApp Conectado via Evolution API')
      }
    }, 5000)
    setTimeout(() => clearInterval(interval), 180000)
  }

  const savePixGateway = async () => {
    await supabase.from('pix_gateways').insert([{ ...pixForm, company_id: company?.id }])
    toast.success('Gateway adicionado')
    refetchPix()
  }

  const saveTemplate = async () => {
    const existing = waTemplates.find((t: any) => t.template_key === tplForm.template_key)
    if (existing) {
      await supabase.from('whatsapp_templates').update({ body: tplForm.body }).eq('id', existing.id)
    } else {
      await supabase
        .from('whatsapp_templates')
        .insert([{ ...tplForm, name: tplForm.template_key, company_id: company?.id }])
    }
    toast.success('Template salvo')
    refetchWa()
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações do Sistema</h1>
        <p className="text-muted-foreground">Ajuste parâmetros do SaaS e integrações.</p>
      </div>

      <Tabs defaultValue="empresa" className="flex flex-col md:flex-row gap-6">
        <TabsList className="flex md:flex-col h-auto bg-transparent p-0 gap-2 w-full md:w-64 justify-start overflow-x-auto border-r-0 md:border-r pr-2">
          {[
            { id: 'empresa', label: 'Empresa', icon: Building2 },
            { id: 'horarios', label: 'Horários', icon: Clock },
            { id: 'whatsapp', label: 'WhatsApp Evolution', icon: MessageSquare },
            { id: 'pix', label: 'Gateways PIX', icon: Smartphone },
            { id: 'templates', label: 'Templates WA', icon: FileText },
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
                <Button onClick={saveSettings}>
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
                    className="flex items-center justify-between gap-4 p-3 bg-muted/30 rounded-lg border"
                  >
                    <div className="flex items-center gap-3 w-32">
                      <Switch
                        checked={hours[d]?.open}
                        onCheckedChange={(v) =>
                          setHours({ ...hours, [d]: { ...hours[d], open: v } })
                        }
                      />
                      <Label>{d}</Label>
                    </div>
                    {hours[d]?.open ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={hours[d]?.start}
                          onChange={(e) =>
                            setHours({ ...hours, [d]: { ...hours[d], start: e.target.value } })
                          }
                          className="w-28"
                        />
                        <span>até</span>
                        <Input
                          type="time"
                          value={hours[d]?.end}
                          onChange={(e) =>
                            setHours({ ...hours, [d]: { ...hours[d], end: e.target.value } })
                          }
                          className="w-28"
                        />
                      </div>
                    ) : (
                      <div className="flex-1 text-muted-foreground text-sm">Fechado</div>
                    )}
                  </div>
                ))}
                <Button onClick={saveHours}>
                  <Save className="w-4 h-4 mr-2" /> Salvar Horários
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="whatsapp" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Integração WhatsApp API (Evolution)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-xl">
                  <div>
                    <Label className="text-lg">Status da Conexão</Label>
                    <p className="text-sm text-muted-foreground">Conecte via QR Code</p>
                  </div>
                  <Badge
                    variant={waStatus === 'connected' ? 'default' : 'secondary'}
                    className={waStatus === 'connected' ? 'bg-green-500' : ''}
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
                    <QrCode className="w-4 h-4 mr-2" /> Gerar QR Code
                  </Button>
                )}
                {waStatus === 'waiting' && (
                  <div className="flex flex-col items-center p-8 border rounded-xl bg-muted/30 space-y-4">
                    <div className="w-48 h-48 bg-white border p-2 rounded-lg flex items-center justify-center">
                      {waQrCode ? (
                        <QrCode className="w-32 h-32" />
                      ) : (
                        <Loader2 className="w-8 h-8 animate-spin" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Escaneie o QR Code com seu WhatsApp.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pix" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Gateways PIX e Pagamentos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Provedor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pixGateways.map((g: any) => (
                      <TableRow key={g.id}>
                        <TableCell>{g.name}</TableCell>
                        <TableCell className="capitalize">{g.provider}</TableCell>
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

                <div className="space-y-4 border p-4 rounded-xl">
                  <h4 className="font-semibold">Novo Gateway</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Identificação</Label>
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
                          <SelectItem value="mercadopago">Mercado Pago</SelectItem>
                          <SelectItem value="infinitypay">Infinity Pay</SelectItem>
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
                  <Button onClick={savePixGateway}>
                    <Save className="w-4 h-4 mr-2" /> Adicionar Gateway
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Templates Automáticos de WhatsApp</CardTitle>
                <CardDescription>
                  Variáveis: [NOME_CLIENTE], [DATA_HORA], [VALOR], [LINK_PIX]
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4 border p-4 rounded-xl">
                  <div className="space-y-2">
                    <Label>Selecione o Gatilho</Label>
                    <Select
                      value={tplForm.template_key}
                      onValueChange={(v) => {
                        const ex = waTemplates.find((t: any) => t.template_key === v)
                        setTplForm({ template_key: v, body: ex ? ex.body : '' })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha um template..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lembrete_24h">Lembrete de Agenda (24h antes)</SelectItem>
                        <SelectItem value="lembrete_1h">Lembrete de Agenda (1h antes)</SelectItem>
                        <SelectItem value="cobranca_pix_agendado">
                          Cobrança: PIX Agendado no Vencimento
                        </SelectItem>
                        <SelectItem value="pos_atendimento">Pós-Atendimento (Feedback)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {tplForm.template_key && (
                    <div className="space-y-2">
                      <Label>Mensagem</Label>
                      <Textarea
                        value={tplForm.body}
                        onChange={(e) => setTplForm({ ...tplForm, body: e.target.value })}
                        className="h-32"
                      />
                      <Button onClick={saveTemplate}>
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
                <CardTitle>Aparência</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 max-w-xs">
                  <Label>Cor Primária</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input value={primaryColor} readOnly className="font-mono" />
                  </div>
                </div>
                <Button onClick={saveSettings}>
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
