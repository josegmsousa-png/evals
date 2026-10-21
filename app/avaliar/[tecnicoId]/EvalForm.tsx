'use client'
import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { LEVELS, MAX_SCORE, computeScore, formatScore, isComplete } from '@/lib/score'
import type { Criterion, CriterionScore, Evaluation } from '@/lib/types'
import { saveEvaluation } from './actions'

type Props = {
  periodId: string
  technicianId: string
  criteria: Criterion[]
  initial: Evaluation | null
  readOnly: boolean
}

export default function EvalForm({ periodId, technicianId, criteria, initial, readOnly }: Props) {
  const router = useRouter()
  const [scores, setScores] = useState<Record<string, CriterionScore>>(initial?.scores ?? {})
  const [submitted, setSubmitted] = useState(initial?.submitted ?? false)
  const [status, setStatus] = useState<'saved' | 'dirty' | 'saving' | 'error'>('saved')
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()
  const firstRender = useRef(true)

  const score = computeScore(criteria, scores)
  const complete = isComplete(criteria, scores)
  const answered = criteria.filter((c) => scores[c.id]?.level != null).length

  function update(id: string, patch: Partial<CriterionScore>) {
    setScores((s) => ({ ...s, [id]: { level: s[id]?.level ?? null, comment: s[id]?.comment ?? '', ...patch } }))
  }

  // Gravação automática do rascunho (mantém o estado "submetida" se já estava)
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return }
    if (readOnly) return
    setStatus('dirty')
    const t = setTimeout(async () => {
      setStatus('saving')
      const res = await saveEvaluation(periodId, technicianId, scores, submitted && complete)
      if (res.ok) { setStatus('saved'); if (submitted && !complete) setSubmitted(false) }
      else { setStatus('error'); setError(res.error ?? '') }
    }, 1200)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scores])

  function submit() {
    setError('')
    startTransition(async () => {
      const res = await saveEvaluation(periodId, technicianId, scores, true)
      if (res.ok) { setSubmitted(true); setStatus('saved'); router.push('/avaliar'); router.refresh() }
      else setError(res.error ?? 'Erro ao submeter.')
    })
  }

  return (
    <div className="pb-32">
      {criteria.map((c, i) => {
        const s = scores[c.id]
        return (
          <section key={c.id} className="card mt-4 p-4 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-semibold">
                <span className="text-slate-400 mr-2">{i + 1}.</span>{c.name}
              </h2>
              <span className="chip bg-slate-100 text-slate-600 shrink-0">peso {c.weight}%</span>
            </div>
            {c.description && <p className="mt-1 text-sm text-slate-500">{c.description}</p>}

            {/* Telemóvel: lista vertical tipo escolha múltipla. Desktop: 5 botões lado a lado */}
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-5">
              {LEVELS.map((l, idx) => {
                const active = s?.level === idx
                return (
                  <button key={l.label} type="button" disabled={readOnly}
                    onClick={() => update(c.id, { level: idx })}
                    className="flex items-center gap-3 rounded-lg border-2 px-3 py-2.5 text-left text-sm font-medium transition disabled:cursor-default sm:justify-center sm:px-1 sm:text-center"
                    style={active
                      ? { borderColor: l.color, backgroundColor: l.color, color: 'white' }
                      : { borderColor: '#e2e8f0', color: '#475569' }}>
                    <span className="sm:hidden h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center"
                      style={{ borderColor: active ? 'white' : '#cbd5e1' }}>
                      {active && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </span>
                    {l.label}
                  </button>
                )
              })}
            </div>

            <textarea className="input mt-4 min-h-[80px]" placeholder="Comentário (opcional)"
              disabled={readOnly} value={s?.comment ?? ''}
              onChange={(e) => update(c.id, { comment: e.target.value })} />
          </section>
        )
      })}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center gap-3 sm:gap-4">
          <div>
            <div className="text-xs text-slate-500">Classificação</div>
            <div className="text-xl font-bold tabular-nums">
              {formatScore(score)} <span className="text-sm font-normal text-slate-400">/ {MAX_SCORE}</span>
            </div>
          </div>
          <div className="min-w-0 text-xs text-slate-500">
            {answered}/{criteria.length} critérios
            <br />
            {readOnly ? 'Só leitura'
              : status === 'saving' ? 'A gravar…'
              : status === 'dirty' ? 'Alterações por gravar'
              : status === 'error' ? <span className="text-red-600">{error}</span>
              : submitted ? 'Submetida · gravado' : 'Rascunho gravado'}
          </div>
          {!readOnly && (
            <button className="btn-primary ml-auto shrink-0" disabled={!complete || pending} onClick={submit}>
              {pending ? 'A submeter…' : submitted ? 'Actualizar' : 'Submeter'}
            </button>
          )}
        </div>
        {error && status !== 'error' && <p className="mx-auto max-w-2xl px-4 pb-3 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  )
}
