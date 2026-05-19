import { useState, useMemo } from 'react'
import { useQuery } from '@/hooks/use-query'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Plus,
  Loader2,
  Trash2,
  Edit2,
  Layers,
  CalendarClock,
  Search,
  ArrowUpDown,
  Camera,
  Check,
  X,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { usePasskey } from '@/contexts/PasskeyContext'

export default function ServicosPage() {
  const { company } = usePasskey()
  const { data: allServices, loading, refetch } = useQuery<any>('services')

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)

  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('name_asc')
  const [showInactive, setShowInactive] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [form, setForm] = useState({
    name: '',
    price: '',
    type: 'service',
    duration: '60',
    cost_price: '',
    recurrence_days: '0',
    is_composite: false,
    unit_of_measure: 'UN',
    composite_items: [] as any[],
    is_active: true,
    image_url: '',
  })

  const filteredServices = useMemo(() => {
    let result = allServices || []
    if (!showInactive) result = result.filter((s: any) => s.is_active !== false)

    if (search) {
      const lower = search.toLowerCase()
      result = result.filter(
        (s: any) =>
          s.name.toLowerCase().includes(lower) ||
          s.code.toLowerCase().includes(lower) ||
          (s.type === 'product' ? 'produto' : 'serviço').includes(lower),
      )
    }

    result.sort((a: any, b: any) => {
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name)
      if (sortBy === 'name_desc') return b.name.localeCompare(a.name)
      if (sortBy === 'price_asc') return a.price - b.price
      if (sortBy === 'price_desc') return b.price - a.price
      return 0
    })

    return result
  }, [allServices, showInactive, search, sortBy])

  const openSheet = (s: any = null) => {
    if (s) {
      setEditing(s)
      setForm({
        name: s.name,
        price: s.price.toString(),
        type: s.type,
        duration: s.duration.toString(),
        cost_price: s.cost_price?.toString() || '',
        recurrence_days: s.recurrence_days?.toString() || '0',
        is_composite: s.is_composite,
        unit_of_measure: s.unit_of_measure || 'UN',
        composite_items: s.composite_items || [],
        is_active: s.is_active !== false,
        image_url: s.image_url || '',
      })
    } else {
      setEditing(null)
      setForm({
        name: '',
        price: '',
        type: 'service',
        duration: '60',
        cost_price: '',
        recurrence_days: '0',
        is_composite: false,
        unit_of_measure: 'UN',
        composite_items: [],
        is_active: true,
        image_url: '',
      })
    }
    setSheetOpen(true)
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${company?.id}/${Date.now()}.${ext}`

    const { error } = await supabase.storage.from('service-images').upload(path, file)
    if (error) {
      toast.error('Erro ao subir foto')
      setUploading(false)
      return
    }
    const { data: urlData } = supabase.storage.from('service-images').getPublicUrl(path)
    setForm({ ...form, image_url: urlData.publicUrl })
    setUploading(false)
  }

  const addCompositeItem = (id: string) => {
    const it = allServices.find((x: any) => x.id === id)
    if (it)
      setForm({
        ...form,
        composite_items: [
          ...form.composite_items,
          {
            id: it.id,
            name: it.name,
            quantity: 1,
            cost: it.cost_price || 0,
            um: it.unit_of_measure || 'UN',
          },
        ],
      })
  }

  const removeCompositeItem = (idx: number) => {
    const newItems = [...form.composite_items]
    newItems.splice(idx, 1)
    setForm({ ...form, composite_items: newItems })
  }

  const calculatedCost = form.is_composite
    ? form.composite_items.reduce((acc, i) => acc + i.cost * i.quantity, 0)
    : form.cost_price
      ? Number(form.cost_price)
      : 0

  const handleSave = async () => {
    if (!form.name || !form.price) return toast.error('Nome e preço obrigatórios')
    const payload = {
      name: form.name,
      price: Number(form.price),
      type: form.type,
      duration: Number(form.duration),
      cost_price: calculatedCost,
      recurrence_days: form.type === 'service' ? Number(form.recurrence_days) : 0,
      is_composite: form.is_composite,
      unit_of_measure: form.unit_of_measure,
      composite_items: form.composite_items,
      is_active: form.is_active,
      image_url: form.image_url,
    }
    if (editing) {
      await supabase.from('services').update(payload).eq('id', editing.id)
      toast.success('Atualizado')
    } else {
      const code = `${form.type === 'product' ? 'PRD' : 'SRV'}-${Date.now().toString().slice(-4)}`
      await supabase.from('services').insert([{ ...payload, code, company_id: company?.id }])
      toast.success('Adicionado')
    }
    setSheetOpen(false)
    refetch()
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (
      !confirm(
        'Deseja realmente inativar este item? (Não será excluído permanentemente para manter histórico)',
      )
    )
      return
    await supabase.from('services').update({ is_active: false }).eq('id', id)
    toast.success('Item inativado')
    refetch()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Serviços & Produtos</h1>
          <p className="text-muted-foreground">Catálogo e composição avançada (BOM).</p>
        </div>
        <Button onClick={() => openSheet()} className="rounded-full shadow-md w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" /> Novo Item
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b border-border bg-muted/20 flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, código ou tipo..."
              className="pl-9 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] bg-background">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name_asc">Nome (A-Z)</SelectItem>
                  <SelectItem value="name_desc">Nome (Z-A)</SelectItem>
                  <SelectItem value="price_asc">Menor Preço</SelectItem>
                  <SelectItem value="price_desc">Maior Preço</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 border p-2 rounded-lg bg-background">
              <Switch id="show-inactive" checked={showInactive} onCheckedChange={setShowInactive} />
              <Label htmlFor="show-inactive" className="cursor-pointer text-sm">
                Exibir Inativos
              </Label>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Tipo / UND</TableHead>
                  <TableHead>Recorrência</TableHead>
                  <TableHead>Valor Venda</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map((s: any) => (
                  <TableRow key={s.id} className={s.is_active === false ? 'opacity-60' : ''}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {s.code}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border rounded-md shadow-sm bg-background">
                          <AvatarImage src={s.image_url || ''} className="object-cover" />
                          <AvatarFallback className="rounded-md bg-primary/10 text-primary text-xs font-bold">
                            {s.type === 'product' ? 'PRD' : 'SRV'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="font-medium">
                          {s.name}
                          {s.is_composite && (
                            <Badge variant="secondary" className="ml-2 text-[10px]">
                              <Layers className="w-3 h-3 mr-1" /> Composto
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {s.type === 'product' ? 'Produto' : 'Serviço'}
                      </Badge>{' '}
                      <span className="text-xs text-muted-foreground ml-2">
                        {s.unit_of_measure}
                      </span>
                    </TableCell>
                    <TableCell>
                      {s.type === 'service' && s.recurrence_days > 0 ? (
                        <span className="flex items-center text-xs text-muted-foreground">
                          <CalendarClock className="w-3 h-3 mr-1" /> {s.recurrence_days} dias
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold text-primary">
                      R$ {s.price.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {s.is_active === false ? (
                        <Badge variant="destructive" className="text-[10px] uppercase">
                          <X className="w-3 h-3 mr-1" /> Inativo
                        </Badge>
                      ) : (
                        <Badge
                          variant="default"
                          className="bg-green-500 hover:bg-green-600 text-[10px] uppercase"
                        >
                          <Check className="w-3 h-3 mr-1" /> Ativo
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => openSheet(s)}>
                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      {s.is_active !== false && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={(e) => handleDelete(s.id, e)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredServices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhum item encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        )}
      </Card>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>{editing ? 'Editar Item' : 'Novo Item'}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Avatar className="h-24 w-24 border-2 border-border shadow-sm rounded-xl">
                  <AvatarImage src={form.image_url || ''} className="object-cover rounded-xl" />
                  <AvatarFallback className="text-2xl rounded-xl bg-muted">
                    {form.name ? (
                      form.name.charAt(0)
                    ) : (
                      <Layers className="w-8 h-8 text-muted-foreground" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <Label
                  htmlFor="service-image-upload"
                  className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-md translate-x-1/4 translate-y-1/4"
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </Label>
                <input
                  id="service-image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="service">Serviço</SelectItem>
                    <SelectItem value="product">Produto / Insumo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Unidade de Medida</Label>
                <Select
                  value={form.unit_of_measure}
                  onValueChange={(v) => setForm({ ...form, unit_of_measure: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UN">Unidade (UN)</SelectItem>
                    <SelectItem value="ML">Mililitro (ML)</SelectItem>
                    <SelectItem value="GR">Grama (GR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preço Venda (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
              {!form.is_composite && (
                <div className="space-y-2">
                  <Label>Custo Unitário (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.cost_price}
                    onChange={(e) => setForm({ ...form, cost_price: e.target.value })}
                  />
                </div>
              )}
            </div>
            {form.type === 'service' && (
              <div className="space-y-4 pt-2 border-t">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Duração (min)</Label>
                    <Input
                      type="number"
                      value={form.duration}
                      onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Recorrência (dias)</Label>
                    <Input
                      type="number"
                      value={form.recurrence_days}
                      onChange={(e) => setForm({ ...form, recurrence_days: e.target.value })}
                      placeholder="Ex: 30"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg border">
                  <div>
                    <Label className="text-sm font-semibold">Bill of Materials (BOM)</Label>
                    <p className="text-xs text-muted-foreground">Consome produtos ao finalizar.</p>
                  </div>
                  <Switch
                    checked={form.is_composite}
                    onCheckedChange={(v) => setForm({ ...form, is_composite: v })}
                  />
                </div>
                {form.is_composite && (
                  <div className="border p-3 rounded-lg space-y-3 bg-card shadow-inner">
                    <Label>Insumos Utilizados</Label>
                    <Select value={undefined} onValueChange={addCompositeItem}>
                      <SelectTrigger>
                        <SelectValue placeholder="Adicionar insumo..." />
                      </SelectTrigger>
                      <SelectContent>
                        {allServices
                          ?.filter(
                            (x: any) =>
                              x &&
                              x.type === 'product' &&
                              x.id &&
                              x.id.trim() !== '' &&
                              x.is_active !== false,
                          )
                          .map((p: any) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <div className="space-y-2">
                      {form.composite_items.map((ci: any, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <span className="flex-1 truncate">{ci.name}</span>
                          <span className="text-xs text-muted-foreground w-8">{ci.um}</span>
                          <Input
                            type="number"
                            step="0.01"
                            className="w-24 h-8 text-right font-mono"
                            value={ci.quantity}
                            onChange={(e) => {
                              const newI = [...form.composite_items]
                              newI[idx].quantity = Number(e.target.value)
                              setForm({ ...form, composite_items: newI })
                            }}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive shrink-0"
                            onClick={() => removeCompositeItem(idx)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                      <span>Custo Calculado:</span>
                      <span className="text-primary">R$ {calculatedCost.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between border p-3 rounded-lg bg-background shadow-sm mt-4">
              <Label className="cursor-pointer font-medium" htmlFor="is-active-switch">
                Ativo
              </Label>
              <Switch
                id="is-active-switch"
                checked={form.is_active}
                onCheckedChange={(v) => setForm({ ...form, is_active: v })}
              />
            </div>
          </div>
          <SheetFooter className="mt-8">
            <Button className="w-full h-12 text-lg" onClick={handleSave} disabled={uploading}>
              Salvar Item
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
