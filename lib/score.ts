import type { Criterion, CriterionScore } from './types'

// Escala da folha Excel: 0 / 25 / 50 / 75 / 100
export const LEVELS = [
  { label: 'Mau', value: 0, color: '#ef4444' },
  { label: 'Fraco', value: 25, color: '#f97316' },
  { label: 'Médio', value: 50, color: '#eab308' },
  { label: 'Bom', value: 75, color: '#22c55e' },
  { label: 'Excelente', value: 100, color: '#3b82f6' },
] as const

export const MAX_SCORE = 7

// Mesma fórmula da folha: Σ(desempenho × peso / 100) × 7 / 100
export function computeScore(criteria: Criterion[], scores: Record<string, CriterionScore>) {
  let total = 0
  for (const c of criteria) {
    const level = scores[c.id]?.level
    if (level == null) return null
    total += (LEVELS[level].value * c.weight) / 100
  }
  return (total * MAX_SCORE) / 100
}

export function isComplete(criteria: Criterion[], scores: Record<string, CriterionScore>) {
  return criteria.every((c) => scores[c.id]?.level != null)
}

export function average(values: number[]) {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null
}

export function formatScore(score: number | null) {
  return score == null ? '—' : score.toFixed(2).replace('.', ',')
}

export function levelForScore(score: number) {
  // Score /7 → nível mais próximo, para dar cor
  return Math.min(4, Math.max(0, Math.round((score / MAX_SCORE) * 4)))
}
