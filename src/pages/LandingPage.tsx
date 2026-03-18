import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Flower, Building2, KeyRound } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function LandingPage() {
  const [passkey, setPasskey] = useState('')
  const [selectedPasskey, setSelectedPasskey] = useState('')
  const [loading, setLoading] = useState(false)
  const [companies, setCompanies] = useState<any[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    supabase
      .from('companies')
      .select('id, name, passkey')
      .then(({ data }) => {
        if (data) setCompanies(data)
      })
  }, [])

  const handleAccessWithInput = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passkey.trim()) return

    setLoading(true)
    const code = passkey.toUpperCase().trim()
    const { data, error } = await supabase
      .from('companies')
      .select('passkey')
      .eq('passkey', code)
      .single()

    setLoading(false)
    if (error || !data) {
      toast.error('Empresa não encontrada', {
        description: 'Verifique a chave informada e tente novamente.',
      })
    } else {
      navigate(`/${data.passkey}/login`)
    }
  }

  const handleAccessWithSelect = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPasskey) {
      toast.error('Selecione uma empresa')
      return
    }
    navigate(`/${selectedPasskey}/login`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-elevation border-border">
        <CardHeader className="space-y-4 items-center text-center">
          <div className="bg-primary/10 p-4 rounded-full inline-block mb-2">
            <Flower className="w-10 h-10 text-primary animate-pulse" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">BeautyOS</CardTitle>
          <CardDescription>O sistema inteligente para o seu salão</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="select" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="select">
                <Building2 className="w-4 h-4 mr-2" /> Filiais
              </TabsTrigger>
              <TabsTrigger value="input">
                <KeyRound className="w-4 h-4 mr-2" /> Código
              </TabsTrigger>
            </TabsList>

            <TabsContent value="select">
              <form onSubmit={handleAccessWithSelect} className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-center">Selecione sua empresa/filial:</p>
                  <Select value={selectedPasskey} onValueChange={setSelectedPasskey}>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Escolha uma opção..." />
                    </SelectTrigger>
                    <SelectContent>
                      {companies
                        .filter(
                          (c) =>
                            c &&
                            c.passkey &&
                            typeof c.passkey === 'string' &&
                            c.passkey.trim() !== '',
                        )
                        .map((c) => (
                          <SelectItem key={c.id} value={c.passkey}>
                            {c.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 rounded-full text-base"
                  disabled={!selectedPasskey}
                >
                  Acessar
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="input">
              <form onSubmit={handleAccessWithInput} className="space-y-4">
                <div className="space-y-2 text-center">
                  <p className="text-sm font-medium">Digite a chave de acesso:</p>
                  <Input
                    placeholder="Ex: BEAUTY01"
                    value={passkey}
                    onChange={(e) => setPasskey(e.target.value)}
                    className="text-center text-lg uppercase h-12"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 rounded-full text-base"
                  disabled={loading || !passkey.trim()}
                >
                  {loading ? 'Buscando...' : 'Acessar Sistema'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
