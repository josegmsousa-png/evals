import { createClient } from './supabase/server'
import type { Period } from './types'

export async function getPeriods(teamId: string): Promise<Period[]> {
  const { data } = await createClient().from('periods').select('*')
    .eq('team_id', teamId).order('deadline', { ascending: false })
  return data ?? []
}

// Período mais recente da equipa, ou o escolhido por ?periodo=
export async function getPeriod(teamId: string | undefined, id?: string): Promise<{ period: Period | null; periods: Period[] }> {
  if (!teamId) return { period: null, periods: [] }
  const periods = await getPeriods(teamId)
  return { period: periods.find((p) => p.id === id) ?? periods[0] ?? null, periods }
}

export function isOpen(period: Period) {
  return new Date(period.deadline) > new Date()
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })
}
