import { notFound } from 'next/navigation'
import Link from 'next/link'
import Shell from '@/components/Shell'
import EvalForm from './EvalForm'
import { requireUser } from '@/lib/auth'
import { getPeriod, isOpen, formatDate } from '@/lib/period'
import { createClient } from '@/lib/supabase/server'
import type { Criterion, Evaluation } from '@/lib/types'

export default async function AvaliarTecnico({ params }: { params: { tecnicoId: string } }) {
  const profile = await requireUser()
  const { period } = await getPeriod()
  if (!period) notFound()
  const supabase = createClient()

  const [{ data: tech }, { data: criteria }, { data: ev }] = await Promise.all([
    supabase.from('technicians').select('*').eq('id', params.tecnicoId).single(),
    supabase.from('criteria').select('*').eq('period_id', period.id).order('position'),
    supabase.from('evaluations').select('*')
      .eq('period_id', period.id).eq('engineer_id', profile.id).eq('technician_id', params.tecnicoId)
      .maybeSingle(),
  ])
  if (!tech) notFound()

  return (
    <Shell profile={profile}>
      <div className="mx-auto max-w-2xl">
        <Link href="/avaliar" className="text-sm text-slate-500 hover:text-slate-800">← Voltar</Link>
        <div className="card mt-3 overflow-hidden">
          <div className="h-2 bg-brand-600" />
          <div className="p-4 sm:p-6">
            <h1 className="text-xl sm:text-2xl font-semibold">{tech.name}</h1>
            <p className="text-sm text-slate-500 mt-1">
              {period.name} · {isOpen(period) ? `editável até ${formatDate(period.deadline)}` : 'período fechado'}
            </p>
          </div>
        </div>
        <EvalForm
          periodId={period.id}
          technicianId={tech.id}
          criteria={(criteria as Criterion[]) ?? []}
          initial={(ev as Evaluation | null) ?? null}
          readOnly={!isOpen(period)}
        />
      </div>
    </Shell>
  )
}
