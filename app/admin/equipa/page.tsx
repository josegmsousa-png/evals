import Shell from '@/components/Shell'
import ConfirmButton from '@/components/ConfirmButton'
import { isGlobalAdmin, requireAdmin } from '@/lib/auth'
import { teamLabel } from '@/lib/config'
import { tempPassword } from '@/lib/password'
import { getCurrentTeam } from '@/lib/team'
import { createClient } from '@/lib/supabase/server'
import type { Profile, Technician } from '@/lib/types'
import BulkAdd from './BulkAdd'
import { addPerson, addTechnician, deletePerson, deleteTechnician, resetPassword } from './actions'

export default async function Equipa() {
  const me = await requireAdmin()
  const global = isGlobalAdmin(me)
  const { team } = await getCurrentTeam(me)
  if (!team) return <Shell profile={me}><p className="text-slate-500">Sem equipa.</p></Shell>

  const supabase = createClient()
  const [{ data: people }, { data: globals }, { data: techs }, { data: evals }] = await Promise.all([
    supabase.from('profiles').select('*').eq('team_id', team.id).order('name'),
    global ? supabase.from('profiles').select('*').is('team_id', null).order('name') : Promise.resolve({ data: [] }),
    supabase.from('technicians').select('*').eq('team_id', team.id).order('name'),
    supabase.from('evaluations').select('engineer_id, technician_id'),
  ])
  const evalsBy = (key: 'engineer_id' | 'technician_id', id: string) =>
    (evals ?? []).filter((e) => e[key] === id).length
  const andEvals = (n: number) => (n ? ` Também apaga as ${n} avaliações associadas.` : '')

  const personRow = (p: Profile) => (
    <li key={p.id} className="py-3 flex flex-wrap items-center gap-x-3 gap-y-2">
      <div className="min-w-0 flex-1 sm:flex-none">
        <div className="font-medium truncate">{p.name || p.email}</div>
        <div className="text-xs text-slate-500 truncate">{p.email}</div>
      </div>
      {p.role === 'admin' && (
        <span className="chip bg-brand-100 text-brand-700">{p.team_id ? 'admin' : 'admin global'}</span>
      )}
      {p.must_change_password && <span className="chip bg-amber-100 text-amber-700">1.ª entrada</span>}
      {p.id !== me.id && (
        <div className="w-full sm:w-auto sm:ml-auto flex items-center justify-end gap-4 sm:gap-3 shrink-0">
          <details className="relative">
            <summary className="cursor-pointer list-none text-xs text-slate-500 hover:text-slate-900">Repor palavra-passe</summary>
            <form action={resetPassword} className="absolute right-0 z-10 mt-2 w-64 card p-3 space-y-2">
              <input type="hidden" name="id" value={p.id} />
              <label className="label">Nova palavra-passe temporária</label>
              <input name="password" className="input font-mono" defaultValue={tempPassword()} minLength={8} required />
              <button className="btn-primary w-full">Repor</button>
              <p className="text-xs text-slate-500">Terá de a mudar na próxima entrada.</p>
            </form>
          </details>
          <form action={deletePerson}>
            <input type="hidden" name="id" value={p.id} />
            <ConfirmButton className="text-xs text-red-600 hover:text-red-800"
              message={`Eliminar ${p.name || p.email}?${andEvals(evalsBy('engineer_id', p.id))} Não é possível desfazer.`}>
              Eliminar
            </ConfirmButton>
          </form>
        </div>
      )}
    </li>
  )

  return (
    <Shell profile={me}>
      <h1 className="text-xl sm:text-2xl font-semibold">Equipa · {teamLabel(team)}</h1>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="card p-4 sm:p-6">
          <h2 className="font-semibold">Engenheiros e administradores</h2>
          <p className="text-sm text-slate-500 mt-1">
            Quem avalia. Dá-lhes o email e a palavra-passe temporária; na primeira entrada definem uma nova.
            Os administradores da equipa veem os resultados só desta equipa.
          </p>
          <form action={addPerson} className="mt-4 space-y-2">
            <input type="hidden" name="team_id" value={team.id} />
            <input name="name" className="input" placeholder="Nome" required />
            <input name="email" type="email" className="input" placeholder="email@empresa.pt" required />
            <div>
              <label className="label">Palavra-passe temporária</label>
              <input name="password" className="input font-mono" defaultValue={tempPassword()} minLength={8} required />
            </div>
            <div className="flex gap-2">
              <select name="role" className="input">
                <option value="engineer">Engenheiro</option>
                <option value="admin">Administrador da equipa</option>
                {global && <option value="global">Administrador global</option>}
              </select>
              <button className="btn-primary shrink-0">Adicionar</button>
            </div>
          </form>
          <details className="mt-3 rounded-lg border border-dashed border-slate-300 px-3 py-2">
            <summary className="cursor-pointer text-sm font-medium text-brand-700">Adicionar vários (colar do Outlook)</summary>
            <BulkAdd teamId={team.id} teamName={team.name} />
          </details>
          <ul className="mt-5 divide-y divide-slate-100">
            {((people as Profile[]) ?? []).map(personRow)}
            {!people?.length && <li className="py-3 text-sm text-slate-500">Ainda ninguém nesta equipa.</li>}
          </ul>
          {global && (
            <>
              <h3 className="mt-6 label">Administradores globais (todas as equipas)</h3>
              <ul className="divide-y divide-slate-100">{((globals as Profile[]) ?? []).map(personRow)}</ul>
            </>
          )}
        </section>

        <section className="card p-4 sm:p-6">
          <h2 className="font-semibold">Técnicos</h2>
          <p className="text-sm text-slate-500 mt-1">Quem é avaliado. Não têm acesso à aplicação.</p>
          <form action={addTechnician} className="mt-4 flex gap-2">
            <input type="hidden" name="team_id" value={team.id} />
            <input name="name" className="input" placeholder="Nome do técnico" required />
            <button className="btn-primary shrink-0">Adicionar</button>
          </form>
          <ul className="mt-5 divide-y divide-slate-100">
            {((techs as Technician[]) ?? []).map((t) => (
              <li key={t.id} className="py-3 flex items-center gap-3">
                <span className="min-w-0 truncate font-medium">{t.name}</span>
                <form action={deleteTechnician} className="ml-auto shrink-0">
                  <input type="hidden" name="id" value={t.id} />
                  <ConfirmButton className="text-xs text-red-600 hover:text-red-800"
                    message={`Eliminar ${t.name}?${andEvals(evalsBy('technician_id', t.id))} Não é possível desfazer.`}>
                    Eliminar
                  </ConfirmButton>
                </form>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Shell>
  )
}
