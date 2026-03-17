import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { UserPlus, KeyRound, Trash2 } from 'lucide-react'
import { mockUsers } from '@/lib/mock'
import { toast } from 'sonner'

export default function UsuariosPage() {
  const visibleUsers = mockUsers.filter((u) => u.username !== 'root')

  const resetPassword = () =>
    toast.success('Senha Redefinida', { description: 'Nova senha temporária gerada.' })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
          <p className="text-muted-foreground">Gerencie o acesso ao sistema.</p>
        </div>
        <Button className="rounded-full shadow-md">
          <UserPlus className="w-4 h-4 mr-2" /> Novo
        </Button>
      </div>

      <div className="md:hidden space-y-4">
        {visibleUsers.map((u) => (
          <Card key={u.id} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                <AvatarImage src={`https://img.usecurling.com/ppl/thumbnail?seed=${u.username}`} />
              </Avatar>
              <div>
                <div className="font-semibold text-sm">{u.name}</div>
                <Badge
                  variant={u.role === 'admin' ? 'default' : 'secondary'}
                  className="uppercase text-[9px] px-1 py-0"
                >
                  {u.role}
                </Badge>
              </div>
            </div>
            <div className="flex">
              <Button
                variant="ghost"
                size="icon"
                onClick={resetPassword}
                aria-label="Resetar Senha"
              >
                <KeyRound className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive"
                aria-label="Remover Usuário"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="hidden md:block">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Login</TableHead>
                  <TableHead>Nível</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                          <AvatarImage
                            src={`https://img.usecurling.com/ppl/thumbnail?seed=${u.username}`}
                          />
                        </Avatar>
                        <span className="font-medium">{u.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-sm">
                      {u.username}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={u.role === 'admin' ? 'default' : 'secondary'}
                        className="uppercase text-[10px]"
                      >
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={resetPassword}
                        aria-label="Resetar Senha"
                      >
                        <KeyRound className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        aria-label="Remover"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
