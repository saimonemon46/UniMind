import { useAuthStore } from '@/store/auth.store'
import type { Role } from '@/constants/roles'

export function useRBAC(requiredRole: Role | Role[]) {
  const { user } = useAuthStore()
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
  return { canAccess: user ? roles.includes(user.role) : false }
}
