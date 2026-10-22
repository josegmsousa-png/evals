'use server'
import { revalidatePath } from 'next/cache'
import { isGlobalAdmin, requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import type { Criterion } from '@/lib/types'

// Fim do dia para uma data "AAAA-MM-DD"
function endOfDay(date: string) {
  return new Date(`${date}T23:59:59`).toISOString()
}

export async function createPeriod(formData: FormData) {
  const me = await requireAdmin()
  const supabase = createClient()
  const name = String(formData.get('name') ?? '').trim()
  const deadline = String(formData.get('deadline') ?? '')
  if (!name || !deadline) return

  // O admin global pode criar o mesmo período em todas as equipas de uma vez
  const teamIds = formData.get('all_teams') === 'on' && isGlobalAdmin(me)
    ? ((await supabase.from('teams').select('id')).data ?? []).map((t) => t.id as string)
    : [String(formData.get('team_id'))]

  for (const teamId of teamIds) {
    // Copia os critérios do período mais recente da mesma equipa
    const { data: last } = await supabase.from('periods').select('id')
      .eq('team_id', teamId).order('deadline', { ascending: false }).limit(1).maybeSingle()
    const { data: created, error } = await supabase.from('periods')
      .insert({ name, deadline: endOfDay(deadline), team_id: teamId }).select().single()
    if (error) throw new Error(error.message)

    if (last) {
      const { data: crit } = await supabase.from('criteria').select('*').eq('period_id', last.id)
      if (crit?.length) {
        await supabase.from('criteria').insert(
          (crit as Criterion[]).map(({ position, name, description, weight }) => ({
            period_id: created.id, position, name, description, weight,
          })),
        )
      }
    }
  }
  revalidatePath('/', 'layout')
}

export async function updatePeriod(formData: FormData) {
  await requireAdmin()
  const name = String(formData.get('name') ?? '').trim()
  const deadline = String(formData.get('deadline') ?? '')
  if (!name || !deadline) return
  await createClient().from('periods')
    .update({ name, deadline: endOfDay(deadline) })
    .eq('id', String(formData.get('id')))
  revalidatePath('/', 'layout')
}

// Apaga o período com os seus critérios e avaliações (on delete cascade)
export async function deletePeriod(formData: FormData) {
  await requireAdmin()
  await createClient().from('periods').delete().eq('id', String(formData.get('id')))
  revalidatePath('/', 'layout')
}

export async function saveCriteria(formData: FormData) {
  await requireAdmin()
  const supabase = createClient()
  const ids = formData.getAll('cid').map(String)
  const rows = ids.map((id) => ({
    id,
    name: String(formData.get(`name-${id}`) ?? '').trim(),
    description: String(formData.get(`desc-${id}`) ?? '').trim(),
    weight: Number(formData.get(`weight-${id}`) ?? 0),
  }))
  // O editor já impede guardar se os pesos não somarem 100
  if (rows.reduce((n, r) => n + r.weight, 0) !== 100) return
  for (const r of rows) {
    await supabase.from('criteria').update({ name: r.name, description: r.description, weight: r.weight }).eq('id', r.id)
  }
  revalidatePath('/', 'layout')
}

export async function addCriterion(formData: FormData) {
  await requireAdmin()
  const supabase = createClient()
  const periodId = String(formData.get('period_id'))
  const name = String(formData.get('name') ?? '').trim()
  if (!name) return
  const { data: last } = await supabase.from('criteria').select('position')
    .eq('period_id', periodId).order('position', { ascending: false }).limit(1).maybeSingle()
  await supabase.from('criteria').insert({
    period_id: periodId,
    position: (last?.position ?? 0) + 1,
    name,
    description: String(formData.get('description') ?? '').trim(),
    weight: 0,
  })
  // Avaliações já submetidas ficam incompletas: voltam a rascunho para o engenheiro completar
  await supabase.from('evaluations').update({ submitted: false }).eq('period_id', periodId)
  revalidatePath('/', 'layout')
}

export async function deleteCriterion(formData: FormData) {
  await requireAdmin()
  await createClient().from('criteria').delete().eq('id', String(formData.get('delete_id')))
  revalidatePath('/', 'layout')
}
