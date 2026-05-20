import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { usePasskey } from '@/contexts/PasskeyContext'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { formatPhoneForDisplay, formatPhoneForStorage } from '@/lib/utils'

export function ClientFormModal({ open, onOpenChange, onSuccess }: any) {
  const { company } = usePasskey()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    nome_preferido: '',
    phone: '',
    email: '',
  })

  const handleSave = async () => {
    if (!form.name || !form.phone) return toast.error('Nome e telefone são obrigatórios')
    setSaving(true)

    const payload = {
      name: form.name,
      nome_preferido: form.nome_preferido,
      phone: formatPhoneForStorage(form.phone),
      email: form.email,
      company_id: company?.id,
      gender: 'female',
      is_active: true,
    }

    const { data: existing } = await supabase
      .from('clients')
      .select('id, name, phone')
      .eq('company_id', company?.id)
      .or(`name.ilike.${payload.name},phone.eq.${payload.phone}`)
      .eq('is_active', true)

    if (existing && existing.length > 0) {
      const isDuplicateName = existing.some(
        (c: any) => c.name.toLowerCase() === payload.name.toLowerCase(),
      )
      const isDuplicatePhone = existing.some((c: any) => c.phone === payload.phone)

      const proceed = window.confirm(
        `ATENÇÃO: Já existe um cliente com ${isDuplicateName ? 'o mesmo nome' : ''} ${isDuplicateName && isDuplicatePhone ? 'e' : ''} ${isDuplicatePhone ? 'o mesmo celular' : ''} cadastrado. Deseja continuar e salvar mesmo assim?`,
      )
      if (!proceed) {
        setSaving(false)
        return
      }
    }

    const { data, error } = await supabase
      .from('clients')
      .insert([payload])
      .select('id, name')
      .single()

    if (error) {
      toast.error(error.message)
      setSaving(false)
      return
    }

    toast.success('Cliente cadastrado com sucesso!')
    setSaving(false)
    if (onSuccess) onSuccess(data.id)
    onOpenChange(false)
    setForm({ name: '', nome_preferido: '', phone: '', email: '' })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Novo Cliente</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nome Completo</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Como gostaria de ser chamado(a)?</Label>
            <Input
              value={form.nome_preferido}
              onChange={(e) => setForm({ ...form, nome_preferido: e.target.value })}
              placeholder="Opcional"
            />
          </div>
          <div className="space-y-2">
            <Label>Celular</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: formatPhoneForDisplay(e.target.value) })}
              maxLength={15}
            />
          </div>
          <div className="space-y-2">
            <Label>E-mail (opcional)</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Salvar e Selecionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
