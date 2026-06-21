import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, getCurrentUser } from '@/api/auth.api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ROLE_HOME } from '@/constants/roles'
import { useAuthStore } from '@/store/auth.store'

export function LoginPage() {
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
      navigate(ROLE_HOME[user.role], { replace: true })
    } catch {
      setError('Unable to sign in with those credentials.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-3rem)] place-items-center px-4">
      <div className="w-full max-w-md rounded-lg border border-ink-10 bg-white p-7">
        <p className="text-xs font-medium uppercase tracking-widest text-ink-30">Alma UMS</p>
        <h1 className="mt-3 font-serif text-2xl font-normal tracking-tight text-ink">Welcome back</h1>
        <p className="mt-2 text-sm text-ink-60">Sign in to continue to your university workspace.</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <Input label="Username" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required />
          <Input label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
          {error ? <p className="border-l-2 border-terracotta bg-terracotta-light px-3 py-2 text-sm text-terracotta-dim">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  )
}
