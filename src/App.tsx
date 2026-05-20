import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster as ShadcnToaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from 'sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeProvider } from '@/components/ThemeProvider'
import TarefasPage from './pages/TarefasPage'
import ListaEsperaPage from './pages/ListaEsperaPage'
import ChecklistPage from './pages/ChecklistPage'
import { AuthProvider } from '@/hooks/use-auth'
import { PasskeyProvider } from '@/contexts/PasskeyContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { PublicRoute } from '@/components/PublicRoute'
import { AppLayout } from '@/components/layout/AppLayout'

import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import AgendaPage from './pages/AgendaPage'
import ClientesPage from './pages/ClientesPage'
import ClienteDetailPage from './pages/ClienteDetailPage'
import ServicosPage from './pages/ServicosPage'
import AtendimentoNovoPage from './pages/AtendimentoNovoPage'
import AtendimentoHistoricoPage from './pages/AtendimentoHistoricoPage'
import SaldoInicialPage from './pages/SaldoInicialPage'
import CaixaPage from './pages/CaixaPage'
import ContasPagarPage from './pages/ContasPagarPage'
import ContasReceberPage from './pages/ContasReceberPage'
import EstoquePage from './pages/EstoquePage'
import ComprasPage from './pages/ComprasPage'
import FornecedoresPage from './pages/FornecedoresPage'
import RelatoriosPage from './pages/RelatoriosPage'
import UsuariosPage from './pages/UsuariosPage'
import ConfiguracoesPage from './pages/ConfiguracoesPage'
import RootCompaniesPage from './pages/RootCompaniesPage'
import NotFound from './pages/NotFound'

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
    <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
      <AuthProvider>
        <TooltipProvider>
          <ShadcnToaster />
          <Sonner position="bottom-right" richColors duration={4000} />
          <Routes>
            <Route
              path="/"
              element={
                <PublicRoute>
                  <LandingPage />
                </PublicRoute>
              }
            />
            <Route
              path="/:passkey"
              element={
                <PasskeyProvider>
                  <OutletWithContext />
                </PasskeyProvider>
              }
            >
              <Route
                path="login"
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                }
              />
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="agenda" element={<AgendaPage />} />
                <Route path="tarefas" element={<TarefasPage />} />
                <Route path="lista-espera" element={<ListaEsperaPage />} />
                <Route path="checklist" element={<ChecklistPage />} />
                <Route path="clientes" element={<ClientesPage />} />
                <Route path="clientes/:id" element={<ClienteDetailPage />} />
                <Route path="servicos" element={<ServicosPage />} />
                <Route path="atendimento/novo" element={<AtendimentoNovoPage />} />
                <Route path="atendimento/historico" element={<AtendimentoHistoricoPage />} />
                <Route path="financeiro/caixa" element={<CaixaPage />} />
                <Route
                  path="financeiro/contas-pagar"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'root']}>
                      <ContasPagarPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="financeiro/contas-receber"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'root']}>
                      <ContasReceberPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="financeiro/relatorios"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'root']}>
                      <RelatoriosPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="estoque"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'root', 'atendimento']}>
                      <EstoquePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="compras"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'root']}>
                      <ComprasPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="fornecedores"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'root']}>
                      <FornecedoresPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="usuarios"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'root']}>
                      <UsuariosPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="configuracoes"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'root']}>
                      <ConfiguracoesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="saldo-inicial"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'root']}>
                      <SaldoInicialPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="empresas"
                  element={
                    <ProtectedRoute allowedRoles={['root']}>
                      <RootCompaniesPage />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </ThemeProvider>
)

import { Outlet } from 'react-router-dom'
const OutletWithContext = () => <Outlet />

export default App
