import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { LogOut, User as UserIcon } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useNavigate, useParams } from 'react-router-dom'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function AppHeader() {
  const { isMobile } = useSidebar()
  const { signOut, profile } = useAuth()
  const navigate = useNavigate()
  const { passkey } = useParams()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (err) {
      console.error('Error in sign out handler:', err)
    } finally {
      // Ensure redirect happens even if an unexpected error occurs during sign out
      navigate(`/${passkey}/login`, { replace: true })
    }
  }

  return (
    <header className="h-16 flex items-center justify-between px-4 border-b bg-background sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-4">
        {isMobile && <SidebarTrigger />}
        <h2 className="font-semibold text-lg hidden sm:block">Painel de Controle</h2>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 rounded-full pl-3 pr-2 flex items-center gap-2 border bg-muted/30"
            >
              <span className="text-sm font-medium hidden sm:inline-block max-w-[120px] truncate">
                {profile?.name}
              </span>
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <UserIcon className="w-3 h-3" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-destructive font-medium cursor-pointer"
            >
              <LogOut className="w-4 h-4 mr-2" /> Sair do Sistema
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
