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

// allowTempPassword: só a página de mudar a palavra-passe pode ser vista antes de a definir
export async function requireUser({ allowTempPassword = false } = {}): Promise<Profile> {
  const profile = await getProfile()
  if (!profile || !profile.active) redirect('/login')
  if (profile.must_change_password && !allowTempPassword) redirect('/palavra-passe')
  return profile
}

export async function requireAdmin(): Promise<Profile> {
  const profile = await requireUser()
  if (profile.role !== 'admin') redirect('/avaliar')
  return profile
}
