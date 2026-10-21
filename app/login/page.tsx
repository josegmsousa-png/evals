'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function Login() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setState('sending')
    const { error } = await createClient().auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      // Só utilizadores adicionados pelo admin podem entrar
      options: { shouldCreateUser: false, emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      setError(error.message.includes('not allowed') || error.message.includes('Signups')
        ? 'Este email não está registado. Fala com o administrador.'
        : error.message)
      setState('error')
    } else setState('sent')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card w-full max-w-sm p-8">
        <h1 className="text-xl font-semibold">Avaliações</h1>
        <p className="mt-1 text-sm text-slate-500">Entra com o teu email. Vais receber um link de acesso.</p>
        {state === 'sent' ? (
          <div className="mt-6 rounded-lg bg-green-50 p-4 text-sm text-green-800">
            Link enviado para <b>{email}</b>. Abre o email para entrar.
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <input type="email" required className="input" placeholder="nome@empresa.pt"
              value={email} onChange={(e) => setEmail(e.target.value)} />
            {state === 'error' && <p className="text-sm text-red-600">{error}</p>}
            <button className="btn-primary w-full" disabled={state === 'sending'}>
              {state === 'sending' ? 'A enviar…' : 'Enviar link'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
