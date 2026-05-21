import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { LogOut, User as UserIcon, Settings, Lock } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useNavigate, useParams } from 'react-router-dom'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

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
              className="relative h-9 rounded-full pl-3 pr-2 flex items-center gap-2 border bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <span className="text-sm font-medium hidden sm:inline-block max-w-[120px] truncate">
                {profile?.name}
              </span>
              <Avatar className="w-6 h-6">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback>
                  <div className="w-full h-full rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <UserIcon className="w-3 h-3" />
                  </div>
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{profile?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{profile?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigate(`/${passkey}/configuracoes`)}
              className="cursor-pointer"
            >
              <Settings className="w-4 h-4 mr-2" /> Configurações
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => navigate(`/${passkey}/login`)}
            >
              <Lock className="w-4 h-4 mr-2" /> Bloquear Tela
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-destructive font-medium cursor-pointer focus:text-destructive focus:bg-destructive/10"
            >
              <LogOut className="w-4 h-4 mr-2" /> Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
