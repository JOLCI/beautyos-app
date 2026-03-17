import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@/hooks/use-query'
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
import { Card, CardContent } from '@/components/ui/card'
import { Search, UserPlus, ChevronRight, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function ClientesPage() {
  const { passkey } = useParams()
  const navigate = useNavigate()
  const {
    data: clients,
    loading,
    refetch,
  } = useQuery<any>('clients', { match: { is_active: true } })
  const [search, setSearch] = useState('')

  const filtered = clients.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search),
  )

  const createClient = async () => {
    const name = prompt('Nome do Cliente:')
    if (!name) return
    const phone = prompt('Telefone:') || ''
    const { error } = await supabase
      .from('clients')
      .insert([{ name, phone, company_id: clients[0]?.company_id }])
    if (!error) {
      toast.success('Cliente criado')
      refetch()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">Gerencie a base de clientes do salão.</p>
        </div>
        <Button onClick={createClient} className="rounded-full shadow-md w-full sm:w-auto">
          <UserPlus className="w-4 h-4 mr-2" /> Novo Cliente
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b border-border bg-muted/20">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou celular..."
              className="pl-9 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="hidden md:block">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Cliente desde</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => (
                    <TableRow
                      key={c.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/${passkey}/clientes/${c.id}`)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage
                              src={`https://img.usecurling.com/ppl/thumbnail?seed=${c.id}`}
                            />
                            <AvatarFallback>{c.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{c.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{c.phone}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(c.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </div>
        )}
      </Card>
    </div>
  )
}
