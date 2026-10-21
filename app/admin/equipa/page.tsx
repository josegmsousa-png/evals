import Shell from '@/components/Shell'
import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import type { Profile, Technician } from '@/lib/types'
import { addPerson, addTechnician, setTechnicianActive, updatePerson } from './actions'

export default async function Equipa() {
  const me = await requireAdmin()
  const supabase = createClient()
  const [{ data: people }, { data: techs }] = await Promise.all([
    supabase.from('profiles').select('*').order('name'),
    supabase.from('technicians').select('*').order('name'),
  ])

  return (
    <Shell profile={me}>
      <h1 className="text-2xl font-semibold">Equipa</h1>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="card p-6">
          <h2 className="font-semibold">Engenheiros</h2>
          <p className="text-sm text-slate-500 mt-1">Quem avalia. Entram com o email no ecrã de login.</p>
          <form action={addPerson} className="mt-4 space-y-2">
            <input name="name" className="input" placeholder="Nome" required />
            <input name="email" type="email" className="input" placeholder="email@empresa.pt" required />
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
              <li key={p.id} className={`py-3 flex items-center gap-3 ${p.active ? '' : 'opacity-50'}`}>
                <div className="min-w-0">
                  <div className="font-medium truncate">{p.name || p.email}</div>
                  <div className="text-xs text-slate-500 truncate">{p.email}</div>
                </div>
                {p.role === 'admin' && <span className="chip bg-brand-100 text-brand-700">admin</span>}
                {p.id !== me.id && (
                  <form action={updatePerson} className="ml-auto">
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="active" value={String(!p.active)} />
                    <button className="text-xs text-slate-500 hover:text-slate-900">{p.active ? 'Desactivar' : 'Reactivar'}</button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-6">
          <h2 className="font-semibold">Técnicos</h2>
          <p className="text-sm text-slate-500 mt-1">Quem é avaliado. Não têm acesso à aplicação.</p>
          <form action={addTechnician} className="mt-4 flex gap-2">
            <input name="name" className="input" placeholder="Nome do técnico" required />
            <button className="btn-primary shrink-0">Adicionar</button>
          </form>
          <ul className="mt-5 divide-y divide-slate-100">
            {((techs as Technician[]) ?? []).map((t) => (
              <li key={t.id} className={`py-3 flex items-center ${t.active ? '' : 'opacity-50'}`}>
                <span className="font-medium">{t.name}</span>
                <form action={setTechnicianActive} className="ml-auto">
                  <input type="hidden" name="id" value={t.id} />
                  <input type="hidden" name="active" value={String(!t.active)} />
                  <button className="text-xs text-slate-500 hover:text-slate-900">{t.active ? 'Desactivar' : 'Reactivar'}</button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Shell>
  )
}
