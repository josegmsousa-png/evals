import Shell from '@/components/Shell'
import { requireAdmin } from '@/lib/auth'
import { getPeriods, isOpen, formatDate } from '@/lib/period'
import { createClient } from '@/lib/supabase/server'
import type { Criterion } from '@/lib/types'
import { createPeriod, saveCriteria, updateDeadline } from './actions'

export default async function Periodos() {
  const me = await requireAdmin()
  const periods = await getPeriods()
  const { data: criteria } = await createClient().from('criteria').select('*').order('position')
  const year = new Date().getFullYear()

  return (
    <Shell profile={me}>
      <h1 className="text-2xl font-semibold">Períodos de avaliação</h1>

      <form action={createPeriod} className="card mt-6 p-6 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <label className="label">Nome</label>
          <input name="name" className="input" defaultValue={`Avaliação ${year}`} required />
        </div>
        <div>
          <label className="label">Prazo</label>
          <input name="deadline" type="date" className="input" defaultValue={`${year}-12-31`} required />
        </div>
        <button className="btn-primary">Criar período</button>
        <p className="w-full text-xs text-slate-500">Os critérios e pesos são copiados do período mais recente.</p>
      </form>

      {periods.map((p) => {
        const crit = ((criteria as Criterion[]) ?? []).filter((c) => c.period_id === p.id)
        return (
          <section key={p.id} className="card mt-6 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold">{p.name}</h2>
                <p className="text-sm text-slate-500">
                  {isOpen(p) ? 'Aberto' : 'Fechado'} · prazo {formatDate(p.deadline)}
                </p>
              </div>
              <form action={updateDeadline} className="flex items-center gap-2">
                <input type="hidden" name="id" value={p.id} />
                <input name="deadline" type="date" className="input w-auto" defaultValue={p.deadline.slice(0, 10)} />
                <button className="btn-ghost">Alterar prazo</button>
              </form>
            </div>

            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-brand-700">Critérios e pesos ({crit.length})</summary>
              <form action={saveCriteria} className="mt-4 space-y-3">
                {crit.map((c) => (
                  <div key={c.id} className="grid gap-2 md:grid-cols-[1fr_90px] rounded-lg border border-slate-200 p-3">
                    <input type="hidden" name="cid" value={c.id} />
                    <input name={`name-${c.id}`} className="input font-medium" defaultValue={c.name} />
                    <div className="flex items-center gap-1">
                      <input name={`weight-${c.id}`} type="number" min={0} max={100} className="input" defaultValue={c.weight} />
                      <span className="text-sm text-slate-500">%</span>
                    </div>
                    <textarea name={`desc-${c.id}`} className="input md:col-span-2" rows={2} defaultValue={c.description} />
                  </div>
                ))}
                <p className="text-xs text-slate-500">Os pesos têm de somar 100%. Alterar pesos recalcula as notas deste período.</p>
                <button className="btn-primary">Guardar critérios</button>
              </form>
            </details>
          </section>
        )
      })}
    </Shell>
  )
}
