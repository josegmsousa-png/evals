import Link from 'next/link'
import Shell from '@/components/Shell'
import ScoreBadge from '@/components/ScoreBadge'
import PeriodPicker from '@/components/PeriodPicker'
import { requireAdmin } from '@/lib/auth'
import { getPeriod, isOpen, formatDate } from '@/lib/period'
import { loadResults } from '@/lib/results'
import { LEVELS, MAX_SCORE, average, formatScore, levelForScore } from '@/lib/score'

export default async function Admin({ searchParams }: { searchParams: { periodo?: string } }) {
  const profile = await requireAdmin()
  const { period, periods } = await getPeriod(searchParams.periodo)
  if (!period) {
    return (
      <Shell profile={profile}>
        <p className="text-slate-500">Ainda não há períodos. <Link className="text-brand-600 underline" href="/admin/periodos">Criar o primeiro</Link>.</p>
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{period.name}</h1>
          <p className="text-sm text-slate-500 mt-1">
            {isOpen(period) ? `Aberto até ${formatDate(period.deadline)}` : `Fechado em ${formatDate(period.deadline)}`}
          </p>
        </div>
        <div className="flex gap-2">
          <PeriodPicker periods={periods} current={period.id} />
          <a className="btn-ghost" href={`/admin/exportar?periodo=${period.id}`}>Exportar Excel</a>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Técnicos" value={results.length} />
        <Stat label="Engenheiros" value={evaluators.length} />
        <Stat label="Avaliações submetidas" value={`${submitted} / ${expected}`}
          bar={expected ? submitted / expected : 0} />
        <Stat label="Média geral" value={`${formatScore(overall)} / ${MAX_SCORE}`} />
      </div>

      <div className="mt-6 card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Técnico</th>
              <th className="px-5 py-3 w-1/3">Média</th>
              <th className="px-5 py-3 text-right">Respostas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ranked.map((r) => (
              <tr key={r.technician.id} className="hover:bg-slate-50">
                <td className="px-5 py-3">
                  <Link href={`/admin/tecnico/${r.technician.id}?periodo=${period.id}`} className="font-medium hover:text-brand-700">
                    {r.technician.name}
                  </Link>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <ScoreBadge score={r.score} />
                    <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                      {r.score != null && (
                        <div className="h-full rounded-full" style={{
                          width: `${(r.score / MAX_SCORE) * 100}%`,
                          backgroundColor: LEVELS[levelForScore(r.score)].color,
                        }} />
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-right tabular-nums text-slate-500">
                  {r.evaluations.length} / {evaluators.length}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  )
}

function Stat({ label, value, bar }: { label: string; value: string | number; bar?: number }) {
  return (
    <div className="card p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
      {bar != null && (
        <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full bg-brand-500" style={{ width: `${bar * 100}%` }} />
        </div>
      )}
    </div>
  )
}
