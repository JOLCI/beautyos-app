import { useEffect, useState } from 'react'
import { Outlet, useLocation, useParams } from 'react-router-dom'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { AppHeader } from './AppHeader'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

export function AppLayout() {
  const location = useLocation()
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    })
  }, [])

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      deferredPrompt.userChoice.then(() => setDeferredPrompt(null))
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex flex-col flex-1 w-full min-w-0 overflow-hidden bg-background">
        <AppHeader />
        {deferredPrompt && (
          <div className="bg-primary text-primary-foreground px-4 py-2 flex items-center justify-between text-sm">
            <span>Instale o BeautyOS para acesso offline mais rápido.</span>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleInstall}
              className="h-8 rounded-full"
            >
              <Download className="w-4 h-4 mr-2" /> Instalar App
            </Button>
          </div>
        )}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 w-full">
          <div
            key={location.pathname}
            className="max-w-7xl mx-auto w-full space-y-6 animate-page-transition"
          >
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
