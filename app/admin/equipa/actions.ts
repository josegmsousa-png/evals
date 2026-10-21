'use server'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { MIN_PASSWORD } from '@/lib/password'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function addPerson(formData: FormData) {
  await requireAdmin()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const name = String(formData.get('name') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const role = formData.get('role') === 'admin' ? 'admin' : 'engineer'
  if (!email || password.length < MIN_PASSWORD) return
  const service = createServiceClient()
  const { data, error } = await service.auth.admin.createUser({
    email, password, email_confirm: true, user_metadata: { name, role },
  })
  if (error) throw new Error(error.message)
  // Palavra-passe temporária: tem de a mudar na primeira entrada
  await service.from('profiles').update({ must_change_password: true }).eq('id', data.user.id)
  revalidatePath('/admin/equipa')
}

export async function resetPassword(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id'))
  const password = String(formData.get('password') ?? '')
  if (password.length < MIN_PASSWORD) return
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
  if (id === me.id) return
  const { error } = await createServiceClient().auth.admin.deleteUser(id)
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}

export async function updatePerson(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id'))
  const patch: Record<string, unknown> = {}
  if (formData.has('active')) patch.active = formData.get('active') === 'true'
  if (formData.has('role')) patch.role = formData.get('role') === 'admin' ? 'admin' : 'engineer'
  await createClient().from('profiles').update(patch).eq('id', id)
  revalidatePath('/admin/equipa')
}

export async function addTechnician(formData: FormData) {
  await requireAdmin()
  const name = String(formData.get('name') ?? '').trim()
  if (!name) return
  await createClient().from('technicians').insert({ name })
  revalidatePath('/admin/equipa')
}

export async function setTechnicianActive(formData: FormData) {
  await requireAdmin()
  await createClient().from('technicians')
    .update({ active: formData.get('active') === 'true' })
    .eq('id', String(formData.get('id')))
  revalidatePath('/admin/equipa')
}

export async function deleteTechnician(formData: FormData) {
  await requireAdmin()
  await createClient().from('technicians').delete().eq('id', String(formData.get('id')))
  revalidatePath('/', 'layout')
}
