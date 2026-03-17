import { useState } from 'react'
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
import { toast } from '@/hooks/use-toast'

export default function UsuariosPage() {
  const visibleUsers = mockUsers.filter((u) => u.username !== 'root')

  const resetPassword = () => {
    toast({ title: 'Senha Redefinida', description: 'A nova senha temporária foi enviada.' })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuários do Sistema</h1>
          <p className="text-muted-foreground">Gerencie quem tem acesso ao BeautyOS.</p>
        </div>
        <Button className="rounded-full shadow-md">
          <UserPlus className="w-4 h-4 mr-2" /> Novo Usuário
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Login</TableHead>
                <TableHead>Nível de Acesso</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {u.name.charAt(0)}
                        </AvatarFallback>
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
                      title="Resetar Senha"
                    >
                      <KeyRound className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10"
                      title="Remover"
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
  )
}
