import { NavLink } from 'react-router-dom'
import { BarChart3, BookOpen, ClipboardCheck, GraduationCap, LayoutDashboard, Users } from 'lucide-react'
import type { Role } from '@/constants/roles'
import { ROLE_ACCENTS } from '@/constants/roles'

interface SidebarProps {
  role: Role
}

const navItems: Record<Role, Array<{ label: string; to: string; icon: typeof LayoutDashboard }>> = {
  admin: [
    { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
    { label: 'Users', to: '/admin/users', icon: Users },
    { label: 'Courses', to: '/admin/courses', icon: BookOpen },
    { label: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
  ],
  faculty: [
    { label: 'Dashboard', to: '/faculty', icon: LayoutDashboard },
    { label: 'My Courses', to: '/faculty/courses', icon: BookOpen },
    { label: 'Attendance', to: '/faculty/attendance', icon: ClipboardCheck },
    { label: 'Risk View', to: '/faculty/risk', icon: BarChart3 },
  ],
  student: [
    { label: 'Dashboard', to: '/student', icon: LayoutDashboard },
    { label: 'Courses', to: '/student/courses', icon: BookOpen },
    { label: 'Progress', to: '/student/progress', icon: GraduationCap },
    { label: 'AI Guidance', to: '/student/recommendations', icon: BarChart3 },
  ],
  advisor: [
    { label: 'Dashboard', to: '/advisor', icon: LayoutDashboard },
    { label: 'Students', to: '/advisor/students', icon: Users },
    { label: 'Plans', to: '/advisor/plans', icon: ClipboardCheck },
    { label: 'Counseling', to: '/advisor/counseling', icon: BookOpen },
  ],
}

export function Sidebar({ role }: SidebarProps) {
  return (
    <aside className="hidden min-h-screen w-64 border-r border-ink-10 bg-white px-4 py-5 lg:block">
      <div className="px-3">
        <p className="font-serif text-2xl font-normal tracking-tight text-ink">Alma</p>
        <p className="mt-1 text-xs text-ink-60">University Management</p>
      </div>
      <nav className="mt-8 space-y-1">
        {navItems[role].map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-sm px-3 py-2 text-sm text-ink-60 ${isActive ? ROLE_ACCENTS[role].active : 'hover:bg-sand-100'}`
            }
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
