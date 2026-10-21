import { redirect } from 'next/navigation'
import { createClient } from './supabase/server'
import type { Profile } from './types'

export async function getProfile(): Promise<Profile | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  return data
}

export async function requireUser(): Promise<Profile> {
  const profile = await getProfile()
  if (!profile || !profile.active) redirect('/login')
  return profile
}

export async function requireAdmin(): Promise<Profile> {
  const profile = await requireUser()
  if (profile.role !== 'admin') redirect('/avaliar')
  return profile
}
