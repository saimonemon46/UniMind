export const ROLES = {
  admin: 'admin',
  faculty: 'faculty',
  student: 'student',
  advisor: 'advisor',
} as const

export type Role = keyof typeof ROLES

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrator',
  faculty: 'Faculty',
  student: 'Student',
  advisor: 'Academic Advisor',
}

export const ROLE_HOME: Record<Role, string> = {
  admin: '/admin',
  faculty: '/faculty',
  student: '/student',
  advisor: '/advisor',
}

export const ROLE_ACCENTS: Record<Role, { active: string; avatar: string; text: string }> = {
  admin: {
    active: 'bg-sand-200 text-ink font-medium',
    avatar: 'bg-sand-200 text-ink-60',
    text: 'text-ink',
  },
  faculty: {
    active: 'bg-terracotta-light text-terracotta-dim font-medium',
    avatar: 'bg-terracotta-light text-terracotta-dim',
    text: 'text-terracotta-dim',
  },
  student: {
    active: 'bg-amber-light text-amber-dim font-medium',
    avatar: 'bg-amber-light text-amber-dim',
    text: 'text-amber-dim',
  },
  advisor: {
    active: 'bg-moss-light text-moss-dim font-medium',
    avatar: 'bg-moss-light text-moss-dim',
    text: 'text-moss-dim',
  },
}
