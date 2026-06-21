import type { Role } from '@/constants/roles'
import { ROLE_ACCENTS } from '@/constants/roles'

interface AvatarProps {
  name: string
  role: Role
}

export function Avatar({ name, role }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-medium ${ROLE_ACCENTS[role].avatar}`}>
      {initials || 'A'}
    </div>
  )
}
