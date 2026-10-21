import { createClient } from './supabase/server'
import { average, computeScore } from './score'
import type { Criterion, Evaluation, Period, Profile, Technician } from './types'

export type TechResult = {
  technician: Technician
  evaluations: Evaluation[]       // só submetidas
  score: number | null            // média das classificações /7
  criterionAvg: Record<string, number | null> // média do nível (0..4) por critério
}

export async function loadResults(period: Period) {
  const supabase = createClient()
  const [{ data: techs }, { data: criteria }, { data: evals }, { data: engineers }] = await Promise.all([
    supabase.from('technicians').select('*').order('name'),
    supabase.from('criteria').select('*').eq('period_id', period.id).order('position'),
    supabase.from('evaluations').select('*').eq('period_id', period.id).eq('submitted', true),
    supabase.from('profiles').select('*').eq('active', true).order('name'),
  ])
  const crit = (criteria as Criterion[]) ?? []
  const all = (evals as Evaluation[]) ?? []
  const evaluators = ((engineers as Profile[]) ?? []).filter((p) => p.role === 'engineer')

  const results: TechResult[] = ((techs as Technician[]) ?? [])
    .map((t) => {
      const mine = all.filter((e) => e.technician_id === t.id)
      const scores = mine.map((e) => computeScore(crit, e.scores)).filter((s): s is number => s != null)
      const criterionAvg = Object.fromEntries(crit.map((c) => [
        c.id,
        average(mine.map((e) => e.scores[c.id]?.level).filter((l): l is number => l != null)),
      ]))
      return { technician: t, evaluations: mine, score: average(scores), criterionAvg }
    })
    // técnicos inactivos só aparecem se tiverem avaliações neste período
    .filter((r) => r.technician.active || r.evaluations.length > 0)

  return { criteria: crit, results, evaluators, profiles: (engineers as Profile[]) ?? [] }
}
