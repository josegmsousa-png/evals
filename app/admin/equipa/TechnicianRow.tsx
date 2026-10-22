'use client'
import { useState } from 'react'
import ConfirmButton from '@/components/ConfirmButton'
import { CheckIcon, PencilIcon, TrashIcon, XIcon, iconBtnGray, iconBtnRed } from '@/components/Icons'
import type { Technician } from '@/lib/types'
import { deleteTechnician, updateTechnician } from './actions'

export default function TechnicianRow({ technician: t, evalCount }: { technician: Technician; evalCount: number }) {
  const [editing, setEditing] = useState(false)

  if (editing) {
    return (
      <li className="py-2">
        <form action={async (fd) => { await updateTechnician(fd); setEditing(false) }} className="flex items-center gap-2">
          <input type="hidden" name="id" value={t.id} />
          <input name="name" className="input" defaultValue={t.name} required autoFocus />
          <button className={iconBtnGray} title="Guardar" aria-label="Guardar"><CheckIcon /></button>
          <button type="button" className={iconBtnGray} title="Cancelar" aria-label="Cancelar" onClick={() => setEditing(false)}><XIcon /></button>
        </form>
      </li>
    )
  }

  return (
    <li className="py-2 flex items-center gap-3">
      <span className="min-w-0 flex-1 truncate font-medium">{t.name}</span>
      <button className={iconBtnGray} title="Editar" aria-label="Editar" onClick={() => setEditing(true)}><PencilIcon /></button>
      <form action={deleteTechnician}>
        <input type="hidden" name="id" value={t.id} />
        <ConfirmButton className={iconBtnRed} title="Eliminar" aria-label="Eliminar"
          message={`Eliminar ${t.name}?${evalCount ? ` Também apaga as ${evalCount} avaliações associadas.` : ''} Não é possível desfazer.`}>
          <TrashIcon />
        </ConfirmButton>
      </form>
    </li>
  )
}
