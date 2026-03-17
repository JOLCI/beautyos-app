import { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
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
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  UserCog,
} from 'lucide-react'

export function AppSidebar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const { setOpenMobile, isMobile } = useSidebar()

  const isAtendimento = user?.role === 'atendimento'

  const handleLinkClick = () => {
    if (isMobile) setOpenMobile(false)
  }

  const mainMenu = useMemo(
    () => [{ to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' }],
    [],
  )

  const atendimentoMenu = useMemo(
    () => [
      { to: '/agenda', icon: Calendar, label: 'Agenda' },
      { to: '/atendimento/novo', icon: PlayCircle, label: 'Novo Checkout' },
      { to: '/atendimento/historico', icon: History, label: 'Histórico' },
    ],
    [],
  )

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarMenu>
            {mainMenu.map((item) => (
              <SidebarMenuItem key={item.to}>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === item.to}
                  tooltip={item.label}
                >
                  <Link to={item.to} onClick={handleLinkClick}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Atendimento</SidebarGroupLabel>
          <SidebarMenu>
            {atendimentoMenu.map((item) => (
              <SidebarMenuItem key={item.to}>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === item.to}
                  tooltip={item.label}
                >
                  <Link to={item.to} onClick={handleLinkClick}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Cadastros</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname.startsWith('/clientes')}
                tooltip="Clientes"
              >
                <Link to="/clientes" onClick={handleLinkClick}>
                  <Users />
                  <span>Clientes</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname.startsWith('/servicos')}
                tooltip="Serviços"
              >
                <Link to="/servicos" onClick={handleLinkClick}>
                  <Scissors />
                  <span>Serviços</span>
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
                isActive={location.pathname === '/financeiro/caixa'}
                tooltip="Caixa"
              >
                <Link to="/financeiro/caixa" onClick={handleLinkClick}>
                  <DollarSign />
                  <span>Caixa</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {!isAtendimento && (
              <>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === '/financeiro/contas-pagar'}
                    tooltip="A Pagar"
                  >
                    <Link to="/financeiro/contas-pagar" onClick={handleLinkClick}>
                      <ArrowUpCircle />
                      <span>Contas a Pagar</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === '/financeiro/contas-receber'}
                    tooltip="A Receber"
                  >
                    <Link to="/financeiro/contas-receber" onClick={handleLinkClick}>
                      <ArrowDownCircle />
                      <span>Contas a Receber</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </>
            )}
          </SidebarMenu>
        </SidebarGroup>

        {!isAtendimento && (
          <SidebarGroup>
            <SidebarGroupLabel>Administração</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === '/usuarios'}
                  tooltip="Usuários"
                >
                  <Link to="/usuarios" onClick={handleLinkClick}>
                    <UserCog />
                    <span>Usuários</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === '/configuracoes'}
                  tooltip="Configurações"
                >
                  <Link to="/configuracoes" onClick={handleLinkClick}>
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
            <SidebarMenuButton onClick={logout} tooltip="Sair da Conta" aria-label="Sair da conta">
              <LogOut className="text-destructive" />
              <span className="text-destructive font-medium">Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
