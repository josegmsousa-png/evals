import Link from 'next/link'
import { notFound } from 'next/navigation'
import Shell from '@/components/Shell'
import ScoreBadge from '@/components/ScoreBadge'
import LevelBars from '@/components/LevelBars'
import { requireAdmin } from '@/lib/auth'
import { teamLabel } from '@/lib/config'
import { getCurrentTeam } from '@/lib/team'
import { getPeriod } from '@/lib/period'
import { loadResults } from '@/lib/results'
import { LEVELS, computeScore } from '@/lib/score'

export default async function TecnicoResultado({
  params, searchParams,
}: { params: { id: string }; searchParams: { periodo?: string } }) {
  const profile = await requireAdmin()
  const { team } = await getCurrentTeam(profile)
  const { period } = await getPeriod(team?.id, searchParams.periodo)
  if (!period) notFound()
  const { criteria, results, evaluators, profiles } = await loadResults(period)
  const r = results.find((x) => x.technician.id === params.id)
  if (!r) notFound()

  const nameOf = (id: string) => {
    const p = profiles.find((x) => x.id === id)
    return p?.name || p?.email || 'Engenheiro removido'
  }
  const missing = evaluators.filter((e) => !r.evaluations.some((ev) => ev.engineer_id === e.id))

  return (
    <Shell profile={profile}>
      <Link href={`/admin?periodo=${period.id}`} className="text-sm text-slate-500 hover:text-slate-800">← Resultados</Link>

      <div className="card mt-3 overflow-hidden">
        <div className="h-2 bg-brand-600" />
        <div className="p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold">{r.technician.name}</h1>
            <p className="text-sm text-slate-500 mt-1">
              {period.name} · {teamLabel(team)} · {r.evaluations.length} de {evaluators.length} engenheiros responderam
            </p>
            {missing.length > 0 && (
              <p className="text-xs text-amber-700 mt-1">Em falta: {missing.map((m) => m.name || m.email).join(', ')}</p>
            )}
          </div>
          <div className="sm:text-right">
            <div className="text-xs uppercase tracking-wide text-slate-500">Média</div>
            <ScoreBadge score={r.score} size="lg" />
          </div>
        </div>
      </div>

      {/* Uma linha por engenheiro */}
      <section className="card mt-4 overflow-hidden">
        <h2 className="px-4 pt-4 sm:px-5 sm:pt-5 font-semibold">Por engenheiro</h2>

        {/* Telemóvel: um cartão por engenheiro */}
        <div className="sm:hidden mt-2 divide-y divide-slate-100">
          {r.evaluations.map((ev) => (
            <div key={ev.id} className="px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium truncate">{nameOf(ev.engineer_id)}</span>
                <ScoreBadge score={computeScore(criteria, ev.scores)} />
              </div>
              <div className="mt-2 space-y-1">
                {criteria.map((c) => {
                  const lvl = ev.scores[c.id]?.level
                  return (
                    <div key={c.id} className="flex items-center justify-between gap-3 text-xs">
                      <span className="truncate text-slate-500">{c.name.split(' /')[0]}</span>
                      {lvl != null && <span className="chip shrink-0 text-white" style={{ backgroundColor: LEVELS[lvl].color }}>{LEVELS[lvl].label}</span>}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
          {r.evaluations.length === 0 && <p className="px-4 py-4 text-sm text-slate-500">Ainda sem avaliações submetidas.</p>}
        </div>

        {/* Desktop: tabela */}
        <div className="hidden sm:block overflow-x-auto">
        <table className="mt-3 w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs text-slate-500">
            <tr>
              <th className="px-5 py-2">Engenheiro</th>
              {criteria.map((c) => <th key={c.id} className="px-2 py-2 font-medium" title={c.name}>{c.name.split(' /')[0]} <span className="text-slate-400">{c.weight}%</span></th>)}
              <th className="px-5 py-2 text-right">Nota</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {r.evaluations.map((ev) => (
              <tr key={ev.id}>
                <td className="px-5 py-2 font-medium whitespace-nowrap">{nameOf(ev.engineer_id)}</td>
                {criteria.map((c) => {
                  const lvl = ev.scores[c.id]?.level
                  return (
                    <td key={c.id} className="px-2 py-2">
                      {lvl != null && <span className="chip text-white" style={{ backgroundColor: LEVELS[lvl].color }}>{LEVELS[lvl].label}</span>}
                    </td>
                  )
                })}
                <td className="px-5 py-2 text-right"><ScoreBadge score={computeScore(criteria, ev.scores)} /></td>
              </tr>
            ))}
            {r.evaluations.length === 0 && (
              <tr><td colSpan={criteria.length + 2} className="px-5 py-4 text-slate-500">Ainda sem avaliações submetidas.</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </section>

      {/* Um cartão por critério: distribuição + comentários */}
      {criteria.map((c, i) => {
        const levels = r.evaluations.map((e) => e.scores[c.id]?.level).filter((l): l is number => l != null)
        const avg = r.criterionAvg[c.id]
        const comments = r.evaluations.filter((e) => e.scores[c.id]?.comment?.trim())
        return (
          <section key={c.id} className="card mt-4 p-4 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold"><span className="text-slate-400 mr-2">{i + 1}.</span>{c.name}</h2>
                <p className="text-xs text-slate-500 mt-0.5">peso {c.weight}% · {levels.length} respostas</p>
              </div>
              {avg != null && (
                <div className="text-right">
                  <div className="text-xs text-slate-500">média</div>
                  <div className="font-semibold" style={{ color: LEVELS[Math.round(avg)].color }}>
                    {LEVELS[Math.round(avg)].label} <span className="text-slate-400 font-normal">({Math.round(avg * 25)}%)</span>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4"><LevelBars levels={levels} /></div>
            {comments.length > 0 && (
              <div className="mt-5 space-y-2">
                <div className="label">Comentários</div>
                {comments.map((e) => {
                  const lvl = e.scores[c.id].level
                  return (
                    <div key={e.id} className="rounded-lg bg-slate-50 px-4 py-3 text-sm">
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                        <span className="font-medium text-slate-700">{nameOf(e.engineer_id)}</span>
                        {lvl != null && <span style={{ color: LEVELS[lvl].color }}>● {LEVELS[lvl].label}</span>}
                      </div>
                      <p className="whitespace-pre-line">{e.scores[c.id].comment}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        )
      })}
    </Shell>
  )
}
