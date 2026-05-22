import { Link, useLocation, useParams } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Scissors,
  Wallet,
  Settings,
  Package,
  FileText,
  Building2,
  Truck,
  ShoppingCart,
} from 'lucide-react'
import { usePasskey } from '@/contexts/PasskeyContext'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import { LogOut } from 'lucide-react'

export function AppSidebar() {
  const { passkey } = useParams()
  const location = useLocation()
  const { company } = usePasskey()
  const { profile, signOut } = useAuth()
  const { setOpenMobile, isMobile } = useSidebar()

  const isAdmin = profile?.role === 'admin' || profile?.role === 'root'
  const isRoot = profile?.role === 'root'

  const navigation = [
    { name: 'Painel', href: `/${passkey}/dashboard`, icon: LayoutDashboard },
    { name: 'Agenda', href: `/${passkey}/agenda`, icon: CalendarDays },
    { name: 'Caixa (PDV)', href: `/${passkey}/atendimento/novo`, icon: Wallet },
    { name: 'Clientes', href: `/${passkey}/clientes`, icon: Users },
    { name: 'Serviços e Produtos', href: `/${passkey}/servicos`, icon: Scissors },
    { name: 'Estoque', href: `/${passkey}/estoque`, icon: Package },
    { name: 'Compras', href: `/${passkey}/compras`, icon: ShoppingCart, admin: true },
    { name: 'Fornecedores', href: `/${passkey}/fornecedores`, icon: Truck, admin: true },
    { name: 'Financeiro', href: `/${passkey}/financeiro/caixa`, icon: Wallet },
    {
      name: 'Contas a Pagar',
      href: `/${passkey}/financeiro/contas-pagar`,
      icon: FileText,
      admin: true,
    },
    {
      name: 'Contas a Receber',
      href: `/${passkey}/financeiro/contas-receber`,
      icon: FileText,
      admin: true,
    },
    { name: 'Relatórios', href: `/${passkey}/financeiro/relatorios`, icon: FileText, admin: true },
    { name: 'Equipe', href: `/${passkey}/usuarios`, icon: Users, admin: true },
    { name: 'Tarefas', href: `/${passkey}/tarefas`, icon: FileText },
    { name: 'Lista de Espera', href: `/${passkey}/lista-espera`, icon: CalendarDays },
    { name: 'Checklist/Anamnese', href: `/${passkey}/checklist`, icon: FileText, admin: true },
    { name: 'Bloqueios de Agenda', href: `/${passkey}/bloqueios`, icon: CalendarDays, admin: true },
    { name: 'Configurações', href: `/${passkey}/configuracoes`, icon: Settings, admin: true },
  ]

  if (isRoot) {
    navigation.push({
      name: 'Empresas (Root)',
      href: `/${passkey}/empresas`,
      icon: Building2,
      admin: true,
    })
  }

  const items = navigation.filter((item) => !item.admin || isAdmin)

  return (
    <Sidebar variant="inset" className="border-r shadow-sm flex flex-col h-full">
      <SidebarHeader className="p-4 flex flex-row items-center gap-3">
        {company?.logo_url ? (
          <img src={company.logo_url} alt="Logo" className="w-10 h-10 rounded-lg object-cover" />
        ) : (
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-lg">
            {company?.name.charAt(0)}
          </div>
        )}
        <div className="flex flex-col overflow-hidden">
          <span className="font-bold truncate">{company?.name}</span>
          <span className="text-xs text-muted-foreground truncate capitalize">{profile?.role}</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="flex-1 overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname.startsWith(item.href)}
                    tooltip={item.name}
                    className="font-medium"
                  >
                    <Link
                      to={item.href}
                      onClick={() => {
                        if (isMobile) {
                          setOpenMobile(false)
                        }
                      }}
                    >
                      <item.icon
                        className={cn(
                          'w-4 h-4',
                          location.pathname.startsWith(item.href) && 'text-primary',
                        )}
                      />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4 mt-auto space-y-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => signOut()}
              className="w-full text-muted-foreground hover:text-foreground font-medium"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="text-xs text-center text-muted-foreground font-medium flex items-center justify-center pt-2 border-t">
          <span>0.0.138 - 0e43bdf #202405</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
