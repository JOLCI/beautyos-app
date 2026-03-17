import { SidebarTrigger } from '@/components/ui/sidebar'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Flower } from 'lucide-react'

export function AppHeader() {
  const { user } = useAuth()

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center px-4 justify-between sticky top-0 z-30 shadow-subtle">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="md:hidden" />
        <div className="font-semibold text-xl flex items-center gap-2 text-primary">
          <Flower className="h-6 w-6" />
          <span className="hidden sm:inline tracking-tight">BeautyOS</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end hidden md:flex">
            <span className="text-sm font-medium leading-none">{user?.name}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              {user?.role}
            </span>
          </div>
          <Avatar className="h-9 w-9 border border-border shadow-sm">
            <AvatarFallback className="bg-primary/10 text-primary">
              {user?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
            <AvatarImage src={`https://img.usecurling.com/ppl/thumbnail?seed=${user?.username}`} />
          </Avatar>
        </div>
      </div>
    </header>
  )
}
