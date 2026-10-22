'use client'
import { useState } from 'react'
import ConfirmButton from '@/components/ConfirmButton'
import { CheckIcon, KeyIcon, PencilIcon, TrashIcon, XIcon, iconBtnGray, iconBtnRed } from '@/components/Icons'
import type { Profile } from '@/lib/types'
import { deletePerson, resetPassword, updatePerson } from './actions'

export default function PersonRow({ person: p, isMe, evalCount, suggestedPassword }: {
  person: Profile
  isMe: boolean
  evalCount: number
  suggestedPassword: string
}) {
  const [editing, setEditing] = useState(false)
  const [resetting, setResetting] = useState(false)
  const global = p.role === 'admin' && !p.team_id

  if (editing) {
    return (
      <li className="py-3">
        <form action={async (fd) => { await updatePerson(fd); setEditing(false) }} className="space-y-2">
          <input type="hidden" name="id" value={p.id} />
          <input name="name" className="input" defaultValue={p.name} placeholder="Nome" required autoFocus />
          <input name="email" type="email" className="input" defaultValue={p.email} required />
          <div className="flex items-center gap-2">
            {!global && (
              <select name="role" className="input" defaultValue={p.role}>
                <option value="engineer">Engenheiro</option>
                <option value="admin">Administrador da equipa</option>
              </select>
            )}
            <button className="btn-primary ml-auto shrink-0"><CheckIcon /> Guardar</button>
            <button type="button" className="btn-ghost shrink-0" onClick={() => setEditing(false)}><XIcon /></button>
          </div>
        </form>
      </li>
    )
  }

  return (
    <li className="py-3">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium truncate">{p.name || p.email}</span>
            {p.role === 'admin' && <span className="chip bg-brand-100 text-brand-700">{global ? 'admin global' : 'admin'}</span>}
            {p.must_change_password && <span className="chip bg-amber-100 text-amber-700">1.ª entrada</span>}
          </div>
          <div className="text-xs text-slate-500 truncate">{p.email}</div>
        </div>
        {!isMe && (
          <div className="flex shrink-0 items-center">
            <button className={iconBtnGray} title="Editar" aria-label="Editar" onClick={() => setEditing(true)}><PencilIcon /></button>
            <button className={iconBtnGray} title="Repor palavra-passe" aria-label="Repor palavra-passe"
              onClick={() => setResetting((r) => !r)}><KeyIcon /></button>
            <form action={deletePerson}>
              <input type="hidden" name="id" value={p.id} />
              <ConfirmButton className={iconBtnRed} title="Eliminar" aria-label="Eliminar"
                message={`Eliminar ${p.name || p.email}?${evalCount ? ` Também apaga as ${evalCount} avaliações associadas.` : ''} Não é possível desfazer.`}>
                <TrashIcon />
              </ConfirmButton>
            </form>
          </div>
        )}
      </div>
      {resetting && (
        <form action={async (fd) => { await resetPassword(fd); setResetting(false) }}
          className="mt-2 flex flex-wrap items-end gap-2 rounded-lg bg-slate-50 p-3">
          <input type="hidden" name="id" value={p.id} />
          <div className="flex-1 min-w-[180px]">
            <label className="label">Nova palavra-passe temporária</label>
            <input name="password" className="input font-mono" defaultValue={suggestedPassword} minLength={8} required />
          </div>
          <button className="btn-primary">Repor</button>
          <p className="w-full text-xs text-slate-500">Terá de a mudar na próxima entrada.</p>
        </form>
      )}
    </li>
  )
}
