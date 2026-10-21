'use server'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import type { Criterion } from '@/lib/types'

// Fim do dia em Lisboa para uma data "AAAA-MM-DD"
function endOfDay(date: string) {
  return new Date(`${date}T23:59:59`).toISOString()
}

export async function createPeriod(formData: FormData) {
  await requireAdmin()
  const supabase = createClient()
  const name = String(formData.get('name') ?? '').trim()
  const deadline = String(formData.get('deadline') ?? '')
  if (!name || !deadline) return

  // Copia os critérios do período mais recente
  const { data: last } = await supabase.from('periods').select('id').order('deadline', { ascending: false }).limit(1).maybeSingle()
  const { data: created, error } = await supabase.from('periods')
    .insert({ name, deadline: endOfDay(deadline) }).select().single()
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
  revalidatePath('/admin', 'layout')
}

export async function updateDeadline(formData: FormData) {
  await requireAdmin()
  await createClient().from('periods')
    .update({ deadline: endOfDay(String(formData.get('deadline'))) })
    .eq('id', String(formData.get('id')))
  revalidatePath('/admin', 'layout')
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
  const total = rows.reduce((n, r) => n + r.weight, 0)
  if (total !== 100) throw new Error(`Os pesos têm de somar 100% (actual: ${total}%).`)
  for (const r of rows) {
    await supabase.from('criteria').update({ name: r.name, description: r.description, weight: r.weight }).eq('id', r.id)
  }
  revalidatePath('/admin', 'layout')
}
