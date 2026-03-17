import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeProvider } from '@/components/ThemeProvider'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'

import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import AgendaPage from './pages/AgendaPage'
import ClientesPage from './pages/ClientesPage'
import ClienteDetailPage from './pages/ClienteDetailPage'
import ServicosPage from './pages/ServicosPage'
import AtendimentoNovoPage from './pages/AtendimentoNovoPage'
import AtendimentoHistoricoPage from './pages/AtendimentoHistoricoPage'
import SaldoInicialPage from './pages/SaldoInicialPage'
import NotFound from './pages/NotFound'

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />

              <Route path="/agenda" element={<AgendaPage />} />

              <Route path="/clientes" element={<ClientesPage />} />
              <Route path="/clientes/:id" element={<ClienteDetailPage />} />

              <Route path="/servicos" element={<ServicosPage />} />

              <Route path="/atendimento/novo" element={<AtendimentoNovoPage />} />
              <Route path="/atendimento/historico" element={<AtendimentoHistoricoPage />} />

              {/* Protected only for 'root' */}
              <Route
                path="/saldo-inicial"
                element={
                  <ProtectedRoute allowedRoles={['root']}>
                    <SaldoInicialPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </ThemeProvider>
)

export default App
