'use server'
import { requireUser } from '@/lib/auth'
import { MIN_PASSWORD } from '@/lib/password'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function changePassword(password: string): Promise<{ ok: boolean; error?: string }> {
  const profile = await requireUser({ allowTempPassword: true })
  if (password.length < MIN_PASSWORD) {
    return { ok: false, error: `A palavra-passe tem de ter pelo menos ${MIN_PASSWORD} caracteres.` }
  }
  const { error } = await createClient().auth.updateUser({ password })
  if (error) {
    return { ok: false, error: error.message.includes('different')
      ? 'A nova palavra-passe tem de ser diferente da actual.'
      : error.message }
  }
  // O perfil só é editável pelo admin (RLS), por isso o aviso é limpo com a service role
  await createServiceClient().from('profiles').update({ must_change_password: false }).eq('id', profile.id)
  return { ok: true }
}
