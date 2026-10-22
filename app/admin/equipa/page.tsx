import Shell from '@/components/Shell'
import { isGlobalAdmin, requireAdmin } from '@/lib/auth'
import { teamLabel } from '@/lib/config'
import { tempPassword } from '@/lib/password'
import { getCurrentTeam } from '@/lib/team'
import { createClient } from '@/lib/supabase/server'
import type { Profile, Technician } from '@/lib/types'
import BulkAdd from './BulkAdd'
import PersonRow from './PersonRow'
import TechnicianRow from './TechnicianRow'
import { addPerson, addTechnician } from './actions'

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

  const personRow = (p: Profile) => (
    <PersonRow key={p.id} person={p} isMe={p.id === me.id}
      evalCount={evalsBy('engineer_id', p.id)} suggestedPassword={tempPassword()} />
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
              <TechnicianRow key={t.id} technician={t} evalCount={evalsBy('technician_id', t.id)} />
            ))}
          </ul>
        </section>
      </div>
    </Shell>
  )
}
