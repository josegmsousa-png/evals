'use client'
import { useState } from 'react'
import ConfirmButton from '@/components/ConfirmButton'
import type { Criterion } from '@/lib/types'
import { addCriterion, deleteCriterion, saveCriteria } from './actions'

export default function CriteriaEditor({ periodId, criteria }: { periodId: string; criteria: Criterion[] }) {
  const [weights, setWeights] = useState<Record<string, number>>(
    Object.fromEntries(criteria.map((c) => [c.id, c.weight])),
  )
  const total = criteria.reduce((n, c) => n + (weights[c.id] ?? c.weight), 0)
  const ok = total === 100

  return (
    <div className="mt-4 space-y-4">
      <form action={saveCriteria} className="space-y-3">
        {criteria.map((c, i) => (
          <div key={c.id} className="rounded-lg border border-slate-200 p-3 space-y-2">
            <input type="hidden" name="cid" value={c.id} />
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400 w-5">{i + 1}.</span>
              <input name={`name-${c.id}`} className="input font-medium" defaultValue={c.name} required />
              <input name={`weight-${c.id}`} type="number" min={0} max={100} className="input w-20"
                defaultValue={c.weight}
                onChange={(e) => setWeights((w) => ({ ...w, [c.id]: Number(e.target.value) || 0 }))} />
              <span className="text-sm text-slate-500">%</span>
              <ConfirmButton formAction={deleteCriterion} name="delete_id" value={c.id}
                message={`Remover o critério "${c.name}"? As respostas a este critério deixam de contar.`}
                className="text-xs text-red-600 hover:text-red-800 shrink-0 ml-1">
                Remover
              </ConfirmButton>
            </div>
            <textarea name={`desc-${c.id}`} className="input" rows={2} defaultValue={c.description} placeholder="Descrição" />
          </div>
        ))}
        <div className="flex items-center gap-3">
          <button className="btn-primary" disabled={!ok}>Guardar critérios</button>
          <span className={`text-sm font-medium ${ok ? 'text-green-700' : 'text-red-600'}`}>
            Total dos pesos: {total}%{ok ? ' ✓' : ' — tem de ser 100%'}
          </span>
        </div>
      </form>

      <form action={addCriterion} className="rounded-lg border border-dashed border-slate-300 p-3 space-y-2">
        <input type="hidden" name="period_id" value={periodId} />
        <div className="label">Novo critério</div>
        <input name="name" className="input" placeholder="Nome do critério" required />
        <textarea name="description" className="input" rows={2} placeholder="Descrição (opcional)" />
        <div className="flex flex-wrap items-center gap-3">
          <ConfirmButton className="btn-ghost"
            message="Adicionar este critério? Começa com peso 0% — depois ajusta os pesos para somarem 100%. Avaliações já submetidas voltam a rascunho para os engenheiros preencherem o novo critério.">
            Adicionar critério
          </ConfirmButton>
          <span className="text-xs text-slate-500">Começa com peso 0%; ajusta os pesos depois.</span>
        </div>
      </form>
    </div>
  )
}
