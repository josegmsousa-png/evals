'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { APP_NAME, DEPARTMENT } from '@/lib/config'

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
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-brand-50 to-slate-100">
      <div className="card w-full max-w-sm p-8">
        <div className="flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.svg" alt="" className="h-20 w-20 drop-shadow-[0_10px_20px_rgba(47,67,196,0.35)]" />
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#1e2a78]">{APP_NAME}</h1>
          <div className="text-sm font-semibold text-brand-600">{DEPARTMENT}</div>
          <p className="mt-3 text-sm text-slate-500">Entra com o teu email e palavra-passe.</p>
        </div>
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
        <p className="mt-4 text-center text-xs text-slate-500">Esqueceste a palavra-passe? Pede ao administrador para a repor.</p>
      </div>
    </div>
  )
}
