'use server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { requireAdmin, isGlobalAdmin } from './auth'
import { TEAM_COOKIE } from './team'

export async function selectTeam(teamId: string) {
  const profile = await requireAdmin()
  if (!isGlobalAdmin(profile)) return
  cookies().set(TEAM_COOKIE, teamId, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })
  revalidatePath('/', 'layout')
}
