import Link from 'next/link'
import Shell from '@/components/Shell'
import Hero from '@/components/Hero'
import ScoreBadge from '@/components/ScoreBadge'
import PeriodPicker from '@/components/PeriodPicker'
import { requireAdmin } from '@/lib/auth'
import { teamLabel } from '@/lib/config'
import { getCurrentTeam } from '@/lib/team'
import { getPeriod, isOpen, formatDate } from '@/lib/period'
import { loadResults } from '@/lib/results'
import { LEVELS, MAX_SCORE, average, formatScore, levelForScore } from '@/lib/score'

export default async function Admin({ searchParams }: { searchParams: { periodo?: string } }) {
  const profile = await requireAdmin()
  const { team } = await getCurrentTeam(profile)
  const { period, periods } = await getPeriod(team?.id, searchParams.periodo)
  if (!period) {
    return (
      <Shell profile={profile}>
        <p className="text-slate-500">Ainda não há períodos para {teamLabel(team)}. <Link className="text-brand-600 underline" href="/admin/periodos">Criar o primeiro</Link>.</p>
      </Shell>
    )
  }
  const { results, evaluators } = await loadResults(period)
  const expected = results.length * evaluators.length
  const submitted = results.reduce((n, r) => n + r.evaluations.length, 0)
  const overall = average(results.map((r) => r.score).filter((s): s is number => s != null))
  const ranked = [...results].sort((a, b) => (b.score ?? -1) - (a.score ?? -1))

  return (
    <Shell profile={profile}>
      <Hero title={period.name} department={teamLabel(team)}
        subtitle={isOpen(period) ? `Aberto até ${formatDate(period.deadline)}` : `Fechado em ${formatDate(period.deadline)}`}>
        <div className="flex flex-wrap gap-2">
          <PeriodPicker periods={periods} current={period.id} />
          <a className="btn-ghost" href={`/admin/exportar?periodo=${period.id}`}>Exportar Excel</a>
        </div>
      </Hero>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Stat label="Técnicos" value={results.length} />
        <Stat label="Engenheiros" value={evaluators.length} />
        <Stat label="Avaliações submetidas" value={`${submitted} / ${expected}`}
          bar={expected ? submitted / expected : 0} />
        <Stat label="Média geral" value={`${formatScore(overall)} / ${MAX_SCORE}`} />
      </div>

      <div className="mt-6 card overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_minmax(0,1fr)_auto_auto] items-center gap-x-3 sm:gap-x-5 bg-slate-50 px-3 sm:px-5 py-3 text-xs uppercase tracking-wide text-slate-500">
          <span>Técnico</span>
          <span className="hidden sm:block">Média</span>
          <span className="text-right">Resp.</span>
          <span className="w-4" />
        </div>
        <div className="divide-y divide-slate-100">
          {ranked.map((r) => (
            <Link key={r.technician.id} href={`/admin/tecnico/${r.technician.id}?periodo=${period.id}`}
              className="group grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_minmax(0,1fr)_auto_auto] items-center gap-x-3 sm:gap-x-5 px-3 sm:px-5 py-3 text-sm hover:bg-brand-50/60">
              <span className="flex min-w-0 items-center gap-2">
                <span className="truncate font-medium group-hover:text-brand-700">{r.technician.name}</span>
                <span className="sm:hidden"><ScoreBadge score={r.score} /></span>
              </span>
              <span className="hidden sm:flex items-center gap-3">
                <ScoreBadge score={r.score} />
                <span className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                  {r.score != null && (
                    <span className="block h-full rounded-full" style={{
                      width: `${(r.score / MAX_SCORE) * 100}%`,
                      backgroundColor: LEVELS[levelForScore(r.score)].color,
                    }} />
                  )}
                </span>
              </span>
              <span className="text-right tabular-nums text-slate-500">{r.evaluations.length} / {evaluators.length}</span>
              <svg className="h-4 w-4 text-slate-400 group-hover:text-brand-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path d="M7.21 14.77a.75.75 0 01.02-1.06L11.17 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" />
              </svg>
            </Link>
          ))}
          {ranked.length === 0 && <p className="px-5 py-4 text-sm text-slate-500">Sem técnicos nesta equipa.</p>}
        </div>
      </div>
    </Shell>
  )
}

function Stat({ label, value, bar }: { label: string; value: string | number; bar?: number }) {
  return (
    <div className="card p-4">
      <div className="text-[11px] sm:text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-xl sm:text-2xl font-semibold tabular-nums">{value}</div>
      {bar != null && (
        <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full bg-brand-500" style={{ width: `${bar * 100}%` }} />
        </div>
      )}
    </div>
  )
}
