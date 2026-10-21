'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await createClient().auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })
    if (error) {
      setError(error.message.includes('Invalid login')
        ? 'Email ou palavra-passe errados.'
        : 'Não foi possível entrar. Tenta novamente.')
      setLoading(false)
      return
    }
    router.replace('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card w-full max-w-sm p-8">
        <h1 className="text-xl font-semibold">Avaliações</h1>
        <p className="mt-1 text-sm text-slate-500">Entra com o teu email e palavra-passe.</p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <input type="email" required autoComplete="username" className="input" placeholder="nome@empresa.pt"
            value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" required autoComplete="current-password" className="input" placeholder="Palavra-passe"
            value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? 'A entrar…' : 'Entrar'}
          </button>
        </form>
        <p className="mt-4 text-xs text-slate-500">Esqueceste a palavra-passe? Pede ao administrador para a repor.</p>
      </div>
    </div>
  )
}
