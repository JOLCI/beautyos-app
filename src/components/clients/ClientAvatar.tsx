import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { User } from 'lucide-react'

export function ClientAvatar({ client, className }: { client: any; className?: string }) {
  if (!client) {
    return (
      <Avatar className={className}>
        <AvatarFallback className="bg-muted text-muted-foreground">
          <User className="w-1/2 h-1/2 opacity-50" />
        </AvatarFallback>
      </Avatar>
    )
  }

  const isMale = client.gender === 'male' || client.gender === 'M'
  const isFemale = client.gender === 'female' || client.gender === 'F'

  // Implements the fallback logic requested:
  const defaultAvatar = isFemale
    ? 'https://img.usecurling.com/i?q=woman&shape=fill&color=rose'
    : isMale
      ? 'https://img.usecurling.com/i?q=man&shape=fill&color=blue'
      : 'https://img.usecurling.com/i?q=user&shape=fill&color=gray'

  return (
    <Avatar className={className}>
      <AvatarImage src={client.avatar_url || defaultAvatar} />
      <AvatarFallback
        className={
          isMale
            ? 'bg-blue-100 text-blue-600'
            : isFemale
              ? 'bg-pink-100 text-pink-600'
              : 'bg-gray-100 text-gray-600'
        }
      >
        <User className="w-1/2 h-1/2" />
      </AvatarFallback>
    </Avatar>
  )
}
