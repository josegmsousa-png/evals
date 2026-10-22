import { cookies } from 'next/headers'
import { isGlobalAdmin } from './auth'
import { createClient } from './supabase/server'
import type { Profile, Team } from './types'

export const TEAM_COOKIE = 'equipa'

export async function getTeams(): Promise<Team[]> {
  const { data } = await createClient().from('teams').select('*').order('position')
  return data ?? []
}

// Equipa em que se está a trabalhar: a da pessoa, ou a escolhida pelo admin global
export async function getCurrentTeam(profile: Profile): Promise<{ team: Team | null; teams: Team[] }> {
  const teams = await getTeams()
  if (!isGlobalAdmin(profile)) {
    return { team: teams.find((t) => t.id === profile.team_id) ?? null, teams }
  }
  const chosen = cookies().get(TEAM_COOKIE)?.value
  return { team: teams.find((t) => t.id === chosen) ?? teams[0] ?? null, teams }
}
