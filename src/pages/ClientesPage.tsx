import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { mockClients } from '@/lib/mock'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search, Plus, UserPlus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function ClientesPage() {
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const filtered = mockClients.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">Gerencie a base de clientes do salão.</p>
        </div>
        <Button className="rounded-full shadow-md">
          <UserPlus className="w-4 h-4 mr-2" /> Novo Cliente
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-border bg-muted/20">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou WhatsApp..."
                className="pl-9 bg-background"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Cliente</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead className="hidden sm:table-cell">Cliente desde</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow
                  key={c.id}
                  className="cursor-pointer transition-colors"
                  onClick={() => navigate(`/clientes/${c.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {c.name.charAt(0)}
                        </AvatarFallback>
                        <AvatarImage
                          src={`https://img.usecurling.com/ppl/thumbnail?seed=${c.id}`}
                        />
                      </Avatar>
                      <span className="font-medium">{c.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.phone}</TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {new Date(c.createdAt).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    Nenhum cliente encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
