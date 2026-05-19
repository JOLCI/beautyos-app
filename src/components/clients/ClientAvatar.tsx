import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

export function ClientAvatar({ client, className }: { client: any; className?: string }) {
  if (!client) {
    return (
      <Avatar className={className}>
        <AvatarFallback className="bg-muted text-muted-foreground">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-1/2 h-1/2 opacity-50"
          >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </AvatarFallback>
      </Avatar>
    )
  }

  const isMale = client.gender === 'male'

  return (
    <Avatar className={className}>
      {client.avatar_url && <AvatarImage src={client.avatar_url} />}
      <AvatarFallback
        className={isMale ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}
      >
        {isMale ? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-1/2 h-1/2"
          >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-1/2 h-1/2"
          >
            <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"></path>
            <path d="M6.5 21v-2a4 4 0 0 1 4-4h3a4 4 0 0 1 4 4v2"></path>
            <path d="M7 12c-2.5 1.5-4 4.5-4 9"></path>
            <path d="M17 12c2.5 1.5 4 4.5 4 9"></path>
          </svg>
        )}
      </AvatarFallback>
    </Avatar>
  )
}
