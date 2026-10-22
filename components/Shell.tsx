import Link from 'next/link'
import { isGlobalAdmin } from '@/lib/auth'
import { getCurrentTeam } from '@/lib/team'
import type { Profile } from '@/lib/types'
import NavLinks from './NavLinks'
import TeamSwitcher from './TeamSwitcher'
import UserMenu from './UserMenu'

export default async function Shell({ profile, children }: { profile: Profile; children: React.ReactNode }) {
  const isAdmin = profile.role === 'admin'
  const global = isGlobalAdmin(profile)
  const { team, teams } = await getCurrentTeam(profile)

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-4 h-14 flex items-center gap-3 sm:gap-4">
          <Link href="/" className="flex items-center gap-2 font-semibold text-brand-700">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.svg" alt="" className="h-7 w-7" />
            <span className="hidden min-[400px]:inline">Avaliações</span>
          </Link>
          {global
            ? <TeamSwitcher teams={teams} current={team?.id} />
            : team && <span className="chip bg-brand-50 text-brand-700">{team.name}</span>}
          <NavLinks isAdmin={isAdmin} isGlobal={global} />
          <div className="ml-auto text-sm">
            <UserMenu name={profile.name} email={profile.email} />
          </div>
        </div>
        <NavLinks isAdmin={isAdmin} isGlobal={global} mobile />
      </header>
      <main className="mx-auto max-w-5xl px-4 py-5 sm:py-8">{children}</main>
    </div>
  )
}
