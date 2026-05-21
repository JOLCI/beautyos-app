import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import { Toaster as ShadcnToaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from 'sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeProvider } from '@/components/ThemeProvider'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import TarefasPage from '@/pages/TarefasPage'
import ListaEsperaPage from '@/pages/ListaEsperaPage'
import ChecklistPage from '@/pages/ChecklistPage'
import { AuthProvider } from '@/hooks/use-auth'
import { PasskeyProvider } from '@/contexts/PasskeyContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { PublicRoute } from '@/components/PublicRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { supabase } from '@/lib/supabase/client'

import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import AgendaPage from '@/pages/AgendaPage'
import ClientesPage from '@/pages/ClientesPage'
import ClienteDetailPage from '@/pages/ClienteDetailPage'
import ServicosPage from '@/pages/ServicosPage'
import AtendimentoNovoPage from '@/pages/AtendimentoNovoPage'
import AtendimentoHistoricoPage from '@/pages/AtendimentoHistoricoPage'
import SaldoInicialPage from '@/pages/SaldoInicialPage'
import CaixaPage from '@/pages/CaixaPage'
import ContasPagarPage from '@/pages/ContasPagarPage'
import ContasReceberPage from '@/pages/ContasReceberPage'
import EstoquePage from '@/pages/EstoquePage'
import ComprasPage from '@/pages/ComprasPage'
import FornecedoresPage from '@/pages/FornecedoresPage'
import RelatoriosPage from '@/pages/RelatoriosPage'
import UsuariosPage from '@/pages/UsuariosPage'
import ConfiguracoesPage from '@/pages/ConfiguracoesPage'
import ConfiguracoesChecklistsPage from '@/pages/ConfiguracoesChecklistsPage'
import ConfiguracoesBloqueiosPage from '@/pages/ConfiguracoesBloqueiosPage'
import RootCompaniesPage from '@/pages/RootCompaniesPage'
import NotFound from '@/pages/NotFound'

const OutletWithContext = () => <Outlet />

const App = () => {
  useEffect(() => {
    let timeout: NodeJS.Timeout
    const resetTimeout = () => {
      clearTimeout(timeout)
      // 90 minutes timeout
      timeout = setTimeout(
        async () => {
          await supabase.auth.signOut()
          window.location.href = '/'
        },
        90 * 60 * 1000,
      )
    }

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart']
    events.forEach((e) => document.addEventListener(e, resetTimeout))
    resetTimeout()

    return () => {
      clearTimeout(timeout)
      events.forEach((e) => document.removeEventListener(e, resetTimeout))
    }
  }, [])

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <BrowserRouter>
        <ErrorBoundary>
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
                        <ErrorBoundary>
                          <AppLayout />
                        </ErrorBoundary>
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
                      path="configuracoes/checklists"
                      element={
                        <ProtectedRoute allowedRoles={['admin', 'root']}>
                          <ConfiguracoesChecklistsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="configuracoes/bloqueios"
                      element={
                        <ProtectedRoute allowedRoles={['admin', 'root']}>
                          <ConfiguracoesBloqueiosPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="bloqueios"
                      element={
                        <ProtectedRoute allowedRoles={['admin', 'root']}>
                          <ConfiguracoesBloqueiosPage />
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
        </ErrorBoundary>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
