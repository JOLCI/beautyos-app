import { useParams, useNavigate } from 'react-router-dom'
import { mockClients, mockAppointments, mockServices } from '@/lib/mock'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft, MessageCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ClienteDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const client = mockClients.find((c) => c.id === id)

  if (!client) return <div className="p-8 text-center">Cliente não encontrado.</div>

  const history = mockAppointments.filter((a) => a.clientId === id)

  return (
    <div className="space-y-6">
      <Button variant="ghost" className="mb-2 -ml-4" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
      </Button>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
        <Avatar className="h-20 w-20 shadow-md border-2 border-background">
          <AvatarFallback className="text-2xl bg-primary/10 text-primary">
            {client.name.charAt(0)}
          </AvatarFallback>
          <AvatarImage src={`https://img.usecurling.com/ppl/medium?seed=${client.id}`} />
        </Avatar>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{client.name}</h1>
          <p className="text-muted-foreground text-sm mt-1">{client.email || 'Sem email'}</p>
        </div>
        <Button className="rounded-full shadow-md w-full sm:w-auto bg-[#25D366] hover:bg-[#20bd5a] text-white">
          <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
        </Button>
      </div>

      <Tabs defaultValue="dados" className="w-full">
        <TabsList className="grid w-full sm:w-auto grid-cols-2 sm:grid-cols-4 bg-muted/50 p-1">
          <TabsTrigger value="dados" className="rounded-md">
            Dados
          </TabsTrigger>
          <TabsTrigger value="historico" className="rounded-md">
            Histórico
          </TabsTrigger>
          <TabsTrigger value="anamnese" className="rounded-md">
            Anamnese
          </TabsTrigger>
          <TabsTrigger value="precos" className="rounded-md">
            Preços Especiais
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="dados" className="animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Informações Cadastrais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-w-md">
                <div className="space-y-1">
                  <Label>Nome Completo</Label>
                  <Input defaultValue={client.name} />
                </div>
                <div className="space-y-1">
                  <Label>Telefone / WhatsApp</Label>
                  <Input defaultValue={client.phone} />
                </div>
                <div className="space-y-1">
                  <Label>Email</Label>
                  <Input defaultValue={client.email || ''} />
                </div>
                <Button className="mt-4">Salvar Alterações</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historico" className="animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Últimos Agendamentos</CardTitle>
                <CardDescription>Histórico de visitas deste cliente.</CardDescription>
              </CardHeader>
              <CardContent>
                {history.length > 0 ? (
                  <div className="space-y-4">
                    {history.map((a) => {
                      const srv = mockServices.find((s) => s.id === a.serviceId)
                      return (
                        <div
                          key={a.id}
                          className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition"
                        >
                          <div>
                            <div className="font-semibold">{srv?.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(a.date).toLocaleDateString('pt-BR')} às {a.startTime}
                            </div>
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {a.status}
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhum agendamento encontrado.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="anamnese" className="animate-fade-in">
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                <p>Formulário de anamnese em construção.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="precos" className="animate-fade-in">
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                <p>Gerenciamento de preços diferenciados em construção.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
