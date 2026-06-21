import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { useAuth } from '@/hooks/useAuth'

export function RootLayout() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-sand-50 text-ink">
      <div className="flex min-h-screen">
        {user ? <Sidebar role={user.role} /> : null}
        <main className="min-w-0 flex-1">
          {user ? <Topbar /> : null}
          <div className="mx-auto max-w-7xl px-5 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
