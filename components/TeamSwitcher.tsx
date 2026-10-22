'use client'
import { useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { selectTeam } from '@/lib/team-actions'
import type { Team } from '@/lib/types'

// Só para o admin global: escolhe a equipa que está a ver
export default function TeamSwitcher({ teams, current }: { teams: Team[]; current: string | undefined }) {
  const router = useRouter()
  const path = usePathname()
  const [pending, startTransition] = useTransition()

  function change(id: string) {
    startTransition(async () => {
      await selectTeam(id)
      // Páginas de um técnico ou período concreto não existem na outra equipa
      router.push(path.startsWith('/admin/tecnico') ? '/admin' : path)
      router.refresh()
    })
  }

  return (
    <select value={current} disabled={pending} onChange={(e) => change(e.target.value)}
      aria-label="Equipa"
      className="rounded-lg border border-brand-100 bg-brand-50 py-1.5 pl-2.5 pr-7 text-sm font-medium text-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-100">
      {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
    </select>
  )
}
