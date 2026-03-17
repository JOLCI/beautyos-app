import { useMemo } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  LayoutDashboard,
  Calendar,
  Users,
  Scissors,
  PlayCircle,
  History,
  DollarSign,
  Settings,
  LogOut,
  Package,
  FileText,
  ArrowDownCircle,
  ArrowUpCircle,
  UserCog,
} from 'lucide-react'

export function AppSidebar() {
  const { profile, signOut } = useAuth()
  const { passkey } = useParams()
  const location = useLocation()
  const { setOpenMobile, isMobile } = useSidebar()

  const isAdmin = profile?.role === 'admin'

  const handleLinkClick = () => {
    if (isMobile) setOpenMobile(false)
  }

  const nav = (path: string) => `/${passkey}${path}`

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === nav('/dashboard')}
                tooltip="Dashboard"
              >
                <Link to={nav('/dashboard')} onClick={handleLinkClick}>
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === nav('/agenda')}
                tooltip="Agenda"
              >
                <Link to={nav('/agenda')} onClick={handleLinkClick}>
                  <Calendar />
                  <span>Agenda</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Atendimento</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === nav('/atendimento/novo')}
                tooltip="Novo Checkout"
              >
                <Link to={nav('/atendimento/novo')} onClick={handleLinkClick}>
                  <PlayCircle />
                  <span>Novo Checkout</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === nav('/atendimento/historico')}
                tooltip="Histórico"
              >
                <Link to={nav('/atendimento/historico')} onClick={handleLinkClick}>
                  <History />
                  <span>Histórico</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Cadastros</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname.includes('/clientes')}
                tooltip="Clientes"
              >
                <Link to={nav('/clientes')} onClick={handleLinkClick}>
                  <Users />
                  <span>Clientes</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname.includes('/servicos')}
                tooltip="Serviços & Produtos"
              >
                <Link to={nav('/servicos')} onClick={handleLinkClick}>
                  <Scissors />
                  <span>Serviços & Produtos</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname.includes('/estoque')}
                tooltip="Estoque"
              >
                <Link to={nav('/estoque')} onClick={handleLinkClick}>
                  <Package />
                  <span>Estoque</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Financeiro</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === nav('/financeiro/caixa')}
                tooltip="Caixa"
              >
                <Link to={nav('/financeiro/caixa')} onClick={handleLinkClick}>
                  <DollarSign />
                  <span>Caixa</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {isAdmin && (
              <>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === nav('/financeiro/contas-pagar')}
                    tooltip="A Pagar"
                  >
                    <Link to={nav('/financeiro/contas-pagar')} onClick={handleLinkClick}>
                      <ArrowUpCircle />
                      <span>Contas a Pagar</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === nav('/financeiro/contas-receber')}
                    tooltip="A Receber"
                  >
                    <Link to={nav('/financeiro/contas-receber')} onClick={handleLinkClick}>
                      <ArrowDownCircle />
                      <span>Contas a Receber</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === nav('/financeiro/relatorios')}
                    tooltip="Relatórios"
                  >
                    <Link to={nav('/financeiro/relatorios')} onClick={handleLinkClick}>
                      <FileText />
                      <span>Relatórios</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </>
            )}
          </SidebarMenu>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administração</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === nav('/usuarios')}
                  tooltip="Usuários"
                >
                  <Link to={nav('/usuarios')} onClick={handleLinkClick}>
                    <UserCog />
                    <span>Usuários</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === nav('/configuracoes')}
                  tooltip="Configurações"
                >
                  <Link to={nav('/configuracoes')} onClick={handleLinkClick}>
                    <Settings />
                    <span>Configurações</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={signOut} tooltip="Sair" aria-label="Sair da conta">
              <LogOut className="text-destructive" />
              <span className="text-destructive font-medium">Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
