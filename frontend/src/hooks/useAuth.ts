import { useAuthStore } from '@/store/auth.store'

export function useAuth() {
  const { user, token, refreshToken, setSession, clearSession } = useAuthStore()
  return {
    user,
    token,
    refreshToken,
    setSession,
    clearSession,
    isAuthenticated: Boolean(token),
  }
}
