import Link from 'next/link'
import type { Profile } from '@/lib/types'
import UserMenu from './UserMenu'

export default function Shell({ profile, children }: { profile: Profile; children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-4 h-14 flex items-center gap-6">
          <Link href="/" className="font-semibold text-brand-700">Avaliações</Link>
          <nav className="flex gap-4 text-sm text-slate-600">
            <Link href="/avaliar" className="hover:text-slate-900">Avaliar</Link>
            {profile.role === 'admin' && (
              <>
                <Link href="/admin" className="hover:text-slate-900">Resultados</Link>
                <Link href="/admin/equipa" className="hover:text-slate-900">Equipa</Link>
                <Link href="/admin/periodos" className="hover:text-slate-900">Períodos</Link>
              </>
            )}
          </nav>
          <div className="ml-auto text-sm">
            <UserMenu name={profile.name} email={profile.email} />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  )
}
