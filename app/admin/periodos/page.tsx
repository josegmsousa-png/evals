import Shell from '@/components/Shell'
import ConfirmButton from '@/components/ConfirmButton'
import { isGlobalAdmin, requireAdmin } from '@/lib/auth'
import { teamLabel } from '@/lib/config'
import { getCurrentTeam } from '@/lib/team'
import { getPeriods, isOpen, formatDate } from '@/lib/period'
import { createClient } from '@/lib/supabase/server'
import type { Criterion } from '@/lib/types'
import CriteriaEditor from './CriteriaEditor'
import { createPeriod, deletePeriod, updatePeriod } from './actions'

export default async function Periodos() {
  const me = await requireAdmin()
  const { team } = await getCurrentTeam(me)
  if (!team) return <Shell profile={me}><p className="text-slate-500">Sem equipa.</p></Shell>
  const periods = await getPeriods(team.id)
  const ids = periods.map((p) => p.id)
  const supabase = createClient()
  const [{ data: criteria }, { data: evals }] = await Promise.all([
    supabase.from('criteria').select('*').in('period_id', ids).order('position'),
    supabase.from('evaluations').select('period_id').in('period_id', ids),
  ])
  const evalCount = (id: string) => (evals ?? []).filter((e) => e.period_id === id).length
  const year = new Date().getFullYear()

  return (
    <Shell profile={me}>
      <h1 className="text-xl sm:text-2xl font-semibold">Períodos · {teamLabel(team)}</h1>

      <form action={createPeriod} className="card mt-6 p-4 sm:p-6 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <label className="label">Nome</label>
          <input name="name" className="input" defaultValue={`Avaliação ${year}`} required />
        </div>
        <div>
          <label className="label">Prazo</label>
          <input name="deadline" type="date" className="input" defaultValue={`${year}-12-31`} required />
        </div>
        <input type="hidden" name="team_id" value={team.id} />
        <button className="btn-primary">Criar período</button>
        {isGlobalAdmin(me) && (
          <label className="w-full flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" name="all_teams" className="h-4 w-4 accent-brand-600" />
            Criar em todas as equipas
          </label>
        )}
        <p className="w-full text-xs text-slate-500">Os critérios e pesos são copiados do período mais recente de cada equipa.</p>
      </form>

      {periods.map((p) => {
        const crit = ((criteria as Criterion[]) ?? []).filter((c) => c.period_id === p.id)
        const n = evalCount(p.id)
        return (
          <section key={p.id} className="card mt-6 p-4 sm:p-6">
            <form action={updatePeriod} className="flex flex-wrap items-end gap-3">
              <input type="hidden" name="id" value={p.id} />
              <div className="flex-1 min-w-[200px]">
                <label className="label">Nome</label>
                <input name="name" className="input font-medium" defaultValue={p.name} required />
              </div>
              <div>
                <label className="label">Prazo</label>
                <input name="deadline" type="date" className="input" defaultValue={p.deadline.slice(0, 10)} required />
              </div>
              <button className="btn-ghost">Guardar</button>
              <ConfirmButton formAction={deletePeriod} className="btn text-red-600 hover:bg-red-50"
                message={`Apagar "${p.name}"?${n ? ` Também apaga as ${n} avaliações feitas neste período.` : ''} Não é possível desfazer.`}>
                Apagar
              </ConfirmButton>
            </form>
            <p className="mt-2 text-sm text-slate-500">
              {isOpen(p) ? 'Aberto' : 'Fechado'} · prazo {formatDate(p.deadline)} · {n} avaliações
            </p>

            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-brand-700">Critérios e pesos ({crit.length})</summary>
              <CriteriaEditor key={crit.map((c) => `${c.id}:${c.weight}`).join()} periodId={p.id} criteria={crit} />
            </details>
          </section>
        )
      })}
    </Shell>
  )
}
