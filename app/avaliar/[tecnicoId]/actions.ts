'use server'
import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { isOpen } from '@/lib/period'
import { isComplete } from '@/lib/score'
import type { Criterion, CriterionScore } from '@/lib/types'

export async function saveEvaluation(
  periodId: string,
  technicianId: string,
  scores: Record<string, CriterionScore>,
  submit: boolean,
): Promise<{ ok: boolean; error?: string }> {
  const profile = await requireUser()
  const supabase = createClient()

  const { data: period } = await supabase.from('periods').select('*').eq('id', periodId).single()
  if (!period || !isOpen(period)) return { ok: false, error: 'O prazo de avaliação terminou.' }

  if (submit) {
    const { data: criteria } = await supabase.from('criteria').select('*').eq('period_id', periodId)
    if (!isComplete((criteria as Criterion[]) ?? [], scores)) {
      return { ok: false, error: 'Preenche todos os critérios antes de submeter.' }
    }
  }

  const { error } = await supabase.from('evaluations').upsert(
    {
      period_id: periodId,
      engineer_id: profile.id,
      technician_id: technicianId,
      scores,
      submitted: submit,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'period_id,engineer_id,technician_id' },
  )
  if (error) return { ok: false, error: error.message }
  revalidatePath('/avaliar')
  return { ok: true }
}
