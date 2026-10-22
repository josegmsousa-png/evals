'use server'
import { revalidatePath } from 'next/cache'
import { canAdminTeam, isGlobalAdmin, requireAdmin } from '@/lib/auth'
import { MIN_PASSWORD } from '@/lib/password'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/types'

// As acções com a service role passam por cima das regras da base de dados,
// por isso a permissão sobre a pessoa é verificada aqui
async function assertCanManage(me: Profile, targetId: string) {
  const { data: target } = await createServiceClient().from('profiles').select('team_id').eq('id', targetId).single()
  if (!target || targetId === me.id || !canAdminTeam(me, target.team_id)) throw new Error('Sem permissão.')
}

export async function addPerson(formData: FormData) {
  const me = await requireAdmin()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const name = String(formData.get('name') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const roleInput = String(formData.get('role'))
  if (!email || password.length < MIN_PASSWORD) return

  // "global" = administrador sem equipa; só um admin global o pode criar
  const global = roleInput === 'global' && isGlobalAdmin(me)
  const role = roleInput === 'engineer' ? 'engineer' : 'admin'
  const teamId = global ? null : String(formData.get('team_id'))
  if (!global && !canAdminTeam(me, teamId)) throw new Error('Sem permissão.')

  const service = createServiceClient()
  const { data, error } = await service.auth.admin.createUser({
    email, password, email_confirm: true, user_metadata: { name, role, team_id: teamId ?? '' },
  })
  if (error) throw new Error(error.message)
  // Palavra-passe temporária: tem de a mudar na primeira entrada
  await service.from('profiles').update({ must_change_password: true }).eq('id', data.user.id)
  revalidatePath('/admin/equipa')
}

export async function resetPassword(formData: FormData) {
  const me = await requireAdmin()
  const id = String(formData.get('id'))
  const password = String(formData.get('password') ?? '')
  if (password.length < MIN_PASSWORD) return
  await assertCanManage(me, id)
  const service = createServiceClient()
  const { error } = await service.auth.admin.updateUserById(id, { password })
  if (error) throw new Error(error.message)
  await service.from('profiles').update({ must_change_password: true }).eq('id', id)
  revalidatePath('/admin/equipa')
}

// Apaga a conta; o perfil e as avaliações dessa pessoa vão em cascata
export async function deletePerson(formData: FormData) {
  const me = await requireAdmin()
  const id = String(formData.get('id'))
  await assertCanManage(me, id)
  const { error } = await createServiceClient().auth.admin.deleteUser(id)
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}

export async function addTechnician(formData: FormData) {
  await requireAdmin()
  const name = String(formData.get('name') ?? '').trim()
  if (!name) return
  // A base de dados só aceita equipas que este admin gere
  await createClient().from('technicians').insert({ name, team_id: String(formData.get('team_id')) })
  revalidatePath('/admin/equipa')
}

export async function deleteTechnician(formData: FormData) {
  await requireAdmin()
  await createClient().from('technicians').delete().eq('id', String(formData.get('id')))
  revalidatePath('/', 'layout')
}
