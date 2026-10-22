import Link from 'next/link'
import Shell from '@/components/Shell'
import { DEPARTMENT } from '@/lib/config'
import ScoreBadge from '@/components/ScoreBadge'
import { requireUser } from '@/lib/auth'
import { getPeriod, isOpen, formatDate } from '@/lib/period'
import { computeScore } from '@/lib/score'
import { createClient } from '@/lib/supabase/server'
import type { Criterion, Evaluation, Technician } from '@/lib/types'

export default async function Avaliar() {
  const profile = await requireUser()
  const { period } = await getPeriod()
  const supabase = createClient()

  if (!period) {
    return <Shell profile={profile}><p className="text-slate-500">Ainda não há nenhum período de avaliação.</p></Shell>
  }

  const [{ data: techs }, { data: criteria }, { data: evals }] = await Promise.all([
    supabase.from('technicians').select('*').eq('active', true).order('name'),
    supabase.from('criteria').select('*').eq('period_id', period.id).order('position'),
    supabase.from('evaluations').select('*').eq('period_id', period.id).eq('engineer_id', profile.id),
  ])
  const byTech = new Map((evals as Evaluation[] ?? []).map((e) => [e.technician_id, e]))
  const list = (techs as Technician[]) ?? []
  const done = list.filter((t) => byTech.get(t.id)?.submitted).length
  const open = isOpen(period)

  return (
    <Shell profile={profile}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">{period.name} – {DEPARTMENT}</h1>
          <p className="text-sm text-slate-500 mt-1">
            {open ? `Podes editar até ${formatDate(period.deadline)}` : `Fechado desde ${formatDate(period.deadline)}`}
          </p>
        </div>
        <div className="w-full sm:w-auto sm:text-right">
          <div className="text-sm text-slate-500">{done} de {list.length} submetidas</div>
          <div className="mt-1 h-2 w-full sm:w-48 rounded-full bg-slate-200 overflow-hidden">
            <div className="h-full bg-brand-500" style={{ width: `${list.length ? (done / list.length) * 100 : 0}%` }} />
          </div>
        </div>
      </div>

      <div className="mt-6 card divide-y divide-slate-100">
        {list.map((t) => {
          const ev = byTech.get(t.id)
          const score = ev ? computeScore((criteria as Criterion[]) ?? [], ev.scores) : null
          return (
            <Link key={t.id} href={`/avaliar/${t.id}`} className="flex items-center gap-3 px-4 py-3.5 sm:gap-4 sm:px-5 sm:py-4 hover:bg-slate-50">
              <div className="h-9 w-9 shrink-0 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-semibold">
                {t.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
              </div>
              <span className="min-w-0 truncate font-medium">{t.name}</span>
              <span className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
                {score != null && <ScoreBadge score={score} />}
                {ev?.submitted
                  ? <span className="chip bg-green-100 text-green-700">Submetida</span>
                  : ev
                    ? <span className="chip bg-amber-100 text-amber-700">Rascunho</span>
                    : <span className="chip bg-slate-100 text-slate-500">Por fazer</span>}
              </span>
            </Link>
          )
        })}
        {list.length === 0 && <p className="p-5 text-sm text-slate-500">Sem técnicos registados.</p>}
      </div>
    </Shell>
  )
}
