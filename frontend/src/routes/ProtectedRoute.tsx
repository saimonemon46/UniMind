import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'

interface ProtectedRouteProps {
  allowedRoles: string[]
  children: ReactNode
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user, token } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  if (!allowedRoles.includes(user?.role ?? '')) return <Navigate to="/unauthorized" replace />
  return <>{children}</>
}
