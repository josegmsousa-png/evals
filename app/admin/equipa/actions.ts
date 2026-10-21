'use server'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function addPerson(formData: FormData) {
  await requireAdmin()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const name = String(formData.get('name') ?? '').trim()
  const role = formData.get('role') === 'admin' ? 'admin' : 'engineer'
  if (!email) return
  // Cria a conta já confirmada; a pessoa entra depois pedindo o link no ecrã de login
  const { error } = await createServiceClient().auth.admin.createUser({
    email, email_confirm: true, user_metadata: { name, role },
  })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/equipa')
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
