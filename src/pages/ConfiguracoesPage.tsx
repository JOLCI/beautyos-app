import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/hooks/use-toast'
import {
  Save,
  Smartphone,
  Palette,
  Calendar,
  Building2,
  Clock,
  MessageSquare,
  Link as LinkIcon,
} from 'lucide-react'

export default function ConfiguracoesPage() {
  const [primaryColor, setPrimaryColor] = useState('#e11d48') // var(--primary) hex approx

  const saveSettings = () => {
    document.documentElement.style.setProperty('--primary', '340 60% 55%') // Mock setting color
    toast({ title: 'Configurações Salvas', description: 'Suas preferências foram atualizadas.' })
  }

  const testConnection = () => {
    toast({
      title: 'Conexão Bem Sucedida',
      description: 'A API do WhatsApp está respondendo corretamente.',
    })
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações do Sistema</h1>
        <p className="text-muted-foreground">Ajuste os parâmetros gerais do salão e integrações.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <Tabs defaultValue="empresa" className="w-full flex flex-col md:flex-row gap-6">
          <TabsList className="flex md:flex-col h-auto bg-transparent p-0 gap-2 w-full md:w-64 justify-start overflow-x-auto overflow-y-hidden border-r-0 md:border-r border-border pr-2">
            {[
              { id: 'empresa', label: 'Empresa', icon: Building2 },
              { id: 'horarios', label: 'Horários', icon: Clock },
              { id: 'whatsapp', label: 'WhatsApp API', icon: MessageSquare },
              { id: 'pix', label: 'PIX & Pagamentos', icon: Smartphone },
              { id: 'google', label: 'Google Agenda', icon: Calendar },
              { id: 'aparencia', label: 'Aparência', icon: Palette },
            ].map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="w-full justify-start gap-3 px-4 py-3 h-auto data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-xl"
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-1 min-w-0">
            <TabsContent value="empresa" className="mt-0 outline-none">
              <Card>
                <CardHeader>
                  <CardTitle>Dados da Empresa</CardTitle>
                  <CardDescription>Informações básicas do salão.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Nome do Salão</Label>
                      <Input defaultValue="Studio Beauty" />
                    </div>
                    <div className="space-y-2">
                      <Label>CNPJ</Label>
                      <Input defaultValue="00.000.000/0001-00" />
                    </div>
                  </div>
                  <Button onClick={saveSettings} className="mt-4">
                    <Save className="w-4 h-4 mr-2" /> Salvar
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="whatsapp" className="mt-0 outline-none">
              <Card>
                <CardHeader>
                  <CardTitle>Integração WhatsApp Business</CardTitle>
                  <CardDescription>
                    Configure a API Oficial da Meta para mensagens automáticas.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4 bg-muted/30 p-4 rounded-xl border">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Ativar Automações Edge</Label>
                        <p className="text-xs text-muted-foreground">
                          Envio de lembretes 24h e cobranças PIX.
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Access Token (Meta Graph API)</Label>
                      <Input type="password" value="EAAGm0PX4ZC...mocked" readOnly />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number ID</Label>
                      <Input value="1234567890" readOnly />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={saveSettings}>
                      <Save className="w-4 h-4 mr-2" /> Salvar Credenciais
                    </Button>
                    <Button variant="secondary" onClick={testConnection}>
                      <LinkIcon className="w-4 h-4 mr-2" /> Testar Conexão
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="aparencia" className="mt-0 outline-none">
              <Card>
                <CardHeader>
                  <CardTitle>Aparência e Marca</CardTitle>
                  <CardDescription>Personalize as cores do sistema.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2 max-w-xs">
                    <Label>Cor Primária</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-16 p-1 h-10 cursor-pointer"
                      />
                      <Input value={primaryColor} readOnly className="flex-1 font-mono" />
                    </div>
                  </div>
                  <Button onClick={saveSettings}>
                    <Palette className="w-4 h-4 mr-2" /> Aplicar Tema
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Other tabs omitted for brevity, fallback content */}
            <TabsContent value="horarios" className="mt-0">
              <Card>
                <CardContent className="p-6 text-muted-foreground">
                  Configuração de horários de funcionamento em construção.
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="pix" className="mt-0">
              <Card>
                <CardContent className="p-6 text-muted-foreground">
                  Configuração de tokens do Mercado Pago/Infinity Pay em construção.
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="google" className="mt-0">
              <Card>
                <CardContent className="p-6 text-muted-foreground">
                  Integração Google Calendar em construção.
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
