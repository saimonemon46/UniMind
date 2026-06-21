import { useQuery } from '@tanstack/react-query'
import { getCurrentUser } from '@/api/auth.api'

export function useCurrentUser(enabled: boolean) {
  return useQuery({
    queryKey: ['users', 'me'],
    queryFn: getCurrentUser,
    enabled,
  })
}
