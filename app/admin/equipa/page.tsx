import Shell from '@/components/Shell'
import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import type { Profile, Technician } from '@/lib/types'
import { tempPassword } from '@/lib/password'
import ConfirmButton from '@/components/ConfirmButton'
import { addPerson, addTechnician, deletePerson, deleteTechnician, resetPassword, setTechnicianActive, updatePerson } from './actions'

export default async function Equipa() {
  const me = await requireAdmin()
  const supabase = createClient()
  const [{ data: people }, { data: techs }, { data: evals }] = await Promise.all([
    supabase.from('profiles').select('*').order('name'),
    supabase.from('technicians').select('*').order('name'),
    supabase.from('evaluations').select('engineer_id, technician_id'),
  ])
  const evalsBy = (key: 'engineer_id' | 'technician_id', id: string) =>
    (evals ?? []).filter((e) => e[key] === id).length
  const andEvals = (n: number) => (n ? ` Também apaga as ${n} avaliações associadas.` : '')

  return (
    <Shell profile={me}>
      <h1 className="text-xl sm:text-2xl font-semibold">Equipa</h1>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="card p-4 sm:p-6">
          <h2 className="font-semibold">Engenheiros</h2>
          <p className="text-sm text-slate-500 mt-1">
            Quem avalia. Dá-lhes o email e a palavra-passe temporária; na primeira entrada definem uma nova.
          </p>
          <form action={addPerson} className="mt-4 space-y-2">
            <input name="name" className="input" placeholder="Nome" required />
            <input name="email" type="email" className="input" placeholder="email@empresa.pt" required />
            <div>
              <label className="label">Palavra-passe temporária</label>
              <input name="password" className="input font-mono" defaultValue={tempPassword()} minLength={8} required />
            </div>
            <div className="flex gap-2">
              <select name="role" className="input">
                <option value="engineer">Engenheiro</option>
                <option value="admin">Administrador</option>
              </select>
              <button className="btn-primary shrink-0">Adicionar</button>
            </div>
          </form>
          <ul className="mt-5 divide-y divide-slate-100">
            {((people as Profile[]) ?? []).map((p) => (
              <li key={p.id} className={`py-3 flex flex-wrap items-center gap-x-3 gap-y-2 ${p.active ? '' : 'opacity-50'}`}>
                <div className="min-w-0 flex-1 sm:flex-none">
                  <div className="font-medium truncate">{p.name || p.email}</div>
                  <div className="text-xs text-slate-500 truncate">{p.email}</div>
                </div>
                {p.role === 'admin' && <span className="chip bg-brand-100 text-brand-700">admin</span>}
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
                    <form action={updatePerson}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="active" value={String(!p.active)} />
                      <button className="text-xs text-slate-500 hover:text-slate-900">{p.active ? 'Desactivar' : 'Reactivar'}</button>
                    </form>
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
            ))}
          </ul>
        </section>

        <section className="card p-4 sm:p-6">
          <h2 className="font-semibold">Técnicos</h2>
          <p className="text-sm text-slate-500 mt-1">
            Quem é avaliado. Não têm acesso à aplicação. Desactivar esconde-o das avaliações mas mantém o histórico.
          </p>
          <form action={addTechnician} className="mt-4 flex gap-2">
            <input name="name" className="input" placeholder="Nome do técnico" required />
            <button className="btn-primary shrink-0">Adicionar</button>
          </form>
          <ul className="mt-5 divide-y divide-slate-100">
            {((techs as Technician[]) ?? []).map((t) => (
              <li key={t.id} className={`py-3 flex items-center gap-3 ${t.active ? '' : 'opacity-50'}`}>
                <span className="min-w-0 truncate font-medium">{t.name}</span>
                <div className="ml-auto flex shrink-0 items-center gap-4 sm:gap-3">
                  <form action={setTechnicianActive}>
                    <input type="hidden" name="id" value={t.id} />
                    <input type="hidden" name="active" value={String(!t.active)} />
                    <button className="text-xs text-slate-500 hover:text-slate-900">{t.active ? 'Desactivar' : 'Reactivar'}</button>
                  </form>
                  <form action={deleteTechnician}>
                    <input type="hidden" name="id" value={t.id} />
                    <ConfirmButton className="text-xs text-red-600 hover:text-red-800"
                      message={`Eliminar ${t.name}?${andEvals(evalsBy('technician_id', t.id))} Não é possível desfazer.`}>
                      Eliminar
                    </ConfirmButton>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Shell>
  )
}
