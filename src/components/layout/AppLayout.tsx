import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export function AppLayout() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4 z-10 shadow-sm md:hidden">
            <SidebarTrigger className="-ml-1" />
            <div className="font-semibold ml-2 text-primary tracking-tight">BeautyOS</div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-muted/10 relative">
            <div className="absolute inset-0 bg-grid-black/[0.02] -z-10" />
            <div className="max-w-7xl mx-auto h-full">
              <ErrorBoundary>
                <Outlet />
              </ErrorBoundary>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
