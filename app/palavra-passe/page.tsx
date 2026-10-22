import { requireUser } from '@/lib/auth'
import PasswordForm from './PasswordForm'

export default async function PalavraPasse() {
  const profile = await requireUser({ allowTempPassword: true })
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-brand-50 to-slate-100">
      <div className="card w-full max-w-sm p-8">
        <h1 className="text-xl font-semibold">
          {profile.must_change_password ? 'Define a tua palavra-passe' : 'Mudar palavra-passe'}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {profile.must_change_password
            ? `Olá ${profile.name || profile.email}. É a tua primeira entrada: escolhe uma palavra-passe só tua para substituir a temporária.`
            : 'Escolhe uma nova palavra-passe.'}
        </p>
        <PasswordForm canCancel={!profile.must_change_password} />
      </div>
    </div>
  )
}
