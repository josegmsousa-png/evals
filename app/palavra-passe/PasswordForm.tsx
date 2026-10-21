'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MIN_PASSWORD } from '@/lib/password'
import { changePassword } from './actions'

export default function PasswordForm({ canCancel }: { canCancel: boolean }) {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('As palavras-passe não coincidem.'); return }
    setError('')
    startTransition(async () => {
      const res = await changePassword(password)
      if (res.ok) { router.replace('/'); router.refresh() }
      else setError(res.error ?? 'Erro ao guardar.')
    })
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-3">
      <input type="password" required minLength={MIN_PASSWORD} autoComplete="new-password" className="input"
        placeholder={`Nova palavra-passe (mín. ${MIN_PASSWORD})`} value={password} onChange={(e) => setPassword(e.target.value)} />
      <input type="password" required autoComplete="new-password" className="input"
        placeholder="Repetir palavra-passe" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button className="btn-primary w-full" disabled={pending}>{pending ? 'A guardar…' : 'Guardar'}</button>
      {canCancel && <Link href="/" className="block text-center text-sm text-slate-500 hover:text-slate-800">Cancelar</Link>}
    </form>
  )
}
