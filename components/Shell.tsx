import Link from 'next/link'
import type { Profile } from '@/lib/types'
import NavLinks from './NavLinks'
import UserMenu from './UserMenu'

export default function Shell({ profile, children }: { profile: Profile; children: React.ReactNode }) {
  const isAdmin = profile.role === 'admin'
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-4 h-14 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 font-semibold text-brand-700">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.svg" alt="" className="h-7 w-7" />
            Avaliações
          </Link>
          <NavLinks isAdmin={isAdmin} />
          <div className="ml-auto text-sm">
            <UserMenu name={profile.name} email={profile.email} />
          </div>
        </div>
        <NavLinks isAdmin={isAdmin} mobile />
      </header>
      <main className="mx-auto max-w-5xl px-4 py-5 sm:py-8">{children}</main>
    </div>
  )
}
