import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Role } from '@/constants/roles'

export interface AlmaUser {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  role: Role
  department?: string | null
  avatarUrl?: string
}

interface AuthState {
  user: AlmaUser | null
  token: string | null
  refreshToken: string | null
  setSession: (session: { user: AlmaUser; token: string; refreshToken: string }) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      setSession: ({ user, token, refreshToken }) => set({ user, token, refreshToken }),
      clearSession: () => set({ user: null, token: null, refreshToken: null }),
    }),
    { name: 'alma-auth' },
  ),
)
