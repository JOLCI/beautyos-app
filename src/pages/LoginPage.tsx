import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Flower } from 'lucide-react'

export default function LoginPage() {
  const [passkey, setPasskey] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (login(passkey, username, password)) {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-elevation border-border">
        <CardHeader className="space-y-4 items-center text-center">
          <div className="bg-primary/10 p-4 rounded-full inline-block mb-2">
            <Flower className="w-10 h-10 text-primary animate-pulse" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">BeautyOS</CardTitle>
          <CardDescription>Gerenciamento inteligente de salão</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="passkey">Chave da Empresa</Label>
              <Input
                id="passkey"
                placeholder="Ex: BEAUTY01"
                value={passkey}
                onChange={(e) => setPasskey(e.target.value.toUpperCase())}
                maxLength={8}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Usuário</Label>
              <Input
                id="username"
                placeholder="Seu usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Dica: Use root/s3nh4 ou admin/123 com BEAUTY01
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full rounded-full h-11 text-base shadow-md hover:scale-[1.02] transition-transform"
            >
              Entrar no Sistema
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
