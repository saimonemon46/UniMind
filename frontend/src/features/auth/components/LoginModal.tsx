import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, getCurrentUser } from '@/api/auth.api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ROLE_HOME } from '@/constants/roles'
import { useAuthStore } from '@/store/auth.store'
import { Modal } from '@/components/ui/Modal'
import { GraduationCap } from 'lucide-react'

interface LoginModalProps {
  open: boolean
  onClose: () => void
}

export function LoginModal({ open, onClose }: LoginModalProps) {
  const navigate = useNavigate()
  const setSession = useAuthStore((state) => state.setSession)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      const tokens = await login(username, password)
      useAuthStore.setState({ token: tokens.access, refreshToken: tokens.refresh })
      const user = await getCurrentUser()
      setSession({ user, token: tokens.access, refreshToken: tokens.refresh })
      onClose()
      navigate(ROLE_HOME[user.role], { replace: true })
    } catch {
      setError('Unable to sign in with those credentials.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal title="Welcome back" open={open} onClose={onClose}>
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-200">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div>
          <span className="font-extrabold text-base text-gray-900 tracking-tight block">UniMind</span>
          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold block -mt-1">University Portal</span>
        </div>
      </div>
      <p className="text-xs text-gray-500 font-sans leading-relaxed">
        Sign in to continue to your university workspace.
      </p>
      <form className="mt-6 space-y-4 font-sans" onSubmit={handleSubmit}>
        <Input label="Username" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required />
        <Input label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
        {error ? <p className="border-l-2 border-red-500 bg-red-50 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-700 leading-relaxed">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
    </Modal>
  )
}
