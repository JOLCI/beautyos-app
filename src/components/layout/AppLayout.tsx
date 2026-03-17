import { Outlet, useLocation } from 'react-router-dom'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { AppHeader } from './AppHeader'

export function AppLayout() {
  const location = useLocation()

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex flex-col flex-1 w-full min-w-0 overflow-hidden bg-background">
        <AppHeader />
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
