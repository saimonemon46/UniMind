import { Bell, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '@/components/ui/Avatar'
import { ROLE_LABELS } from '@/constants/roles'
import { useAuth } from '@/hooks/useAuth'

export function Topbar() {
  const navigate = useNavigate()
  const { user, clearSession } = useAuth()

  if (!user) return null

  return (
    <header className="flex h-16 items-center justify-between border-b border-ink-10 bg-sand-50 px-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-ink-30">{ROLE_LABELS[user.role]}</p>
        <h1 className="font-serif text-2xl font-normal tracking-tight text-ink">Welcome back</h1>
      </div>
      <div className="flex items-center gap-3">
        <button className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-ink-10 bg-white text-ink-60" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </button>
        <Avatar name={user.fullName} role={user.role} />
        <button
          className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-ink-10 bg-white text-ink-60"
          aria-label="Sign out"
          onClick={() => {
            clearSession()
            navigate('/login')
          }}
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
