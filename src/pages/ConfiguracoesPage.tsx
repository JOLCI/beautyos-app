import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
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
  Link as LinkIcon,
  FileText,
  Percent,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function ConfiguracoesPage() {
  const { company } = usePasskey()
  const { data: services } = useQuery<any>('services', { match: { is_active: true } })
  const { data: professionals } = useQuery<any>('profiles', { match: { is_active: true } })

  // States
  const [primaryColor, setPrimaryColor] = useState(company?.primary_color || '#e11d48')
  const [name, setName] = useState(company?.name || '')
  const [settings, setSettings] = useState<any>(company?.settings || {})

  const [commProf, setCommProf] = useState('')
  const [commSrv, setCommSrv] = useState('')
  const [commPct, setCommPct] = useState('')

  const updateSetting = (key: string, value: any) => setSettings({ ...settings, [key]: value })

  const saveSettings = async () => {
    if (!company) return
    applyTheme(primaryColor)
    await supabase
      .from('companies')
      .update({
        name,
        primary_color: primaryColor,
        settings,
      })
      .eq('id', company.id)
    toast.success('Configurações salvas')
  }

  const addCommissionRule = async () => {
    if (!commProf || !commSrv || !commPct) return
    await supabase.from('commission_rules').insert([
      {
        company_id: company?.id,
        professional_id: commProf,
        service_id: commSrv,
        percentage: Number(commPct),
      },
    ])
    toast.success('Regra adicionada')
    setCommPct('')
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
            { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
            { id: 'pix', label: 'PIX & Pagamentos', icon: Smartphone },
            { id: 'google', label: 'Google Agenda', icon: Calendar },
            { id: 'templates', label: 'Templates', icon: FileText },
            { id: 'comissoes', label: 'Comissões', icon: Percent },
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
                <CardTitle>Horários</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between max-w-sm">
                  <Label>Abertura</Label>
                  <Input
                    type="time"
                    className="w-32"
                    value={settings.openTime || '08:00'}
                    onChange={(e) => updateSetting('openTime', e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between max-w-sm">
                  <Label>Fechamento</Label>
                  <Input
                    type="time"
                    className="w-32"
                    value={settings.closeTime || '19:00'}
                    onChange={(e) => updateSetting('closeTime', e.target.value)}
                  />
                </div>
                <Button onClick={saveSettings}>
                  <Save className="w-4 h-4 mr-2" /> Salvar
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="whatsapp" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Integração WhatsApp API</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between bg-muted/30 p-4 border rounded-xl">
                  <div className="space-y-1">
                    <Label>Ativar Lembretes (24h)</Label>
                    <p className="text-xs text-muted-foreground">Dispara via Edge Function</p>
                  </div>
                  <Switch
                    checked={settings.wa_reminders}
                    onCheckedChange={(v) => updateSetting('wa_reminders', v)}
                  />
                </div>
                <div className="flex items-center justify-between bg-muted/30 p-4 border rounded-xl">
                  <div className="space-y-1">
                    <Label>Ativar Cobranças Automáticas</Label>
                  </div>
                  <Switch
                    checked={settings.wa_billing}
                    onCheckedChange={(v) => updateSetting('wa_billing', v)}
                  />
                </div>
                <div className="pt-2 flex gap-2">
                  <Button onClick={saveSettings}>
                    <Save className="w-4 h-4 mr-2" /> Salvar
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      supabase.functions
                        .invoke('test-whatsapp')
                        .then(() => toast.success('Conexão testada'))
                    }
                  >
                    <LinkIcon className="w-4 h-4 mr-2" /> Testar API
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pix" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Gateway de PIX</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Provedor</Label>
                  <Input
                    value={settings.pix_provider || 'Mercado Pago'}
                    onChange={(e) => updateSetting('pix_provider', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Token de Acesso</Label>
                  <Input
                    type="password"
                    value={settings.pix_token || ''}
                    onChange={(e) => updateSetting('pix_token', e.target.value)}
                  />
                </div>
                <Button onClick={saveSettings}>
                  <Save className="w-4 h-4 mr-2" /> Salvar
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="google" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Google Calendar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Sincronize a agenda do BeautyOS com seu Google Agenda.
                </p>
                <Button variant="outline">
                  <Calendar className="w-4 h-4 mr-2" /> Autorizar Google Calendar
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Templates de Mensagem</CardTitle>
                <CardDescription>Use [NOME_CLIENTE], [DATA_HORA] etc.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Lembrete 24h</Label>
                  <Textarea
                    value={
                      settings.tpl_reminder ||
                      'Olá [NOME_CLIENTE], lembramos do seu agendamento dia [DATA_HORA].'
                    }
                    onChange={(e) => updateSetting('tpl_reminder', e.target.value)}
                  />
                </div>
                <Button onClick={saveSettings}>
                  <Save className="w-4 h-4 mr-2" /> Salvar
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comissoes" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Regras de Comissão</CardTitle>
                <CardDescription>
                  Defina o percentual de comissão por profissional e serviço.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Profissional</Label>
                    <Select value={commProf} onValueChange={setCommProf}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {professionals.map((p: any) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Serviço</Label>
                    <Select value={commSrv} onValueChange={setCommSrv}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {services
                          .filter((s: any) => s.type === 'service')
                          .map((s: any) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Percentual (%)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={commPct}
                        onChange={(e) => setCommPct(e.target.value)}
                      />
                      <Button onClick={addCommissionRule}>Adicionar</Button>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground pt-4 border-t">
                  Regras cadastradas aplicam-se automaticamente na finalização de comandas.
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
