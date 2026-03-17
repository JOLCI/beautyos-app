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

  const isAtendimento = user?.role === 'atendimento'

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === '/dashboard'}
                tooltip="Dashboard"
              >
                <Link to="/dashboard">
                  <LayoutDashboard />
                  <span>Dashboard</span>
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
                isActive={location.pathname === '/agenda'}
                tooltip="Agenda"
              >
                <Link to="/agenda">
                  <Calendar />
                  <span>Agenda</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === '/atendimento/novo'}
                tooltip="Novo Checkout"
              >
                <Link to="/atendimento/novo">
                  <PlayCircle />
                  <span>Novo Checkout</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === '/atendimento/historico'}
                tooltip="Histórico"
              >
                <Link to="/atendimento/historico">
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
                isActive={location.pathname.startsWith('/clientes')}
                tooltip="Clientes"
              >
                <Link to="/clientes">
                  <Users />
                  <span>Clientes</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname.startsWith('/servicos')}
                tooltip="Serviços & Produtos"
              >
                <Link to="/servicos">
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
                <Link to="/financeiro/caixa">
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
                    <Link to="/financeiro/contas-pagar">
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
                    <Link to="/financeiro/contas-receber">
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
                  <Link to="/usuarios">
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
                  <Link to="/configuracoes">
                    <Settings />
                    <span>Configurações</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {user?.role === 'root' && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === '/saldo-inicial'}
                    tooltip="Saldo Inicial"
                  >
                    <Link to="/saldo-inicial">
                      <Wallet />
                      <span>Saldo Inicial</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout} tooltip="Sair da Conta">
              <LogOut className="text-destructive" />
              <span className="text-destructive font-medium">Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
