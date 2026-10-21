import { LEVELS, MAX_SCORE, formatScore, levelForScore } from '@/lib/score'

export default function ScoreBadge({ score, size = 'md' }: { score: number | null; size?: 'md' | 'lg' }) {
  const color = score == null ? '#94a3b8' : LEVELS[levelForScore(score)].color
  if (size === 'lg') {
    return (
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-bold" style={{ color }}>{formatScore(score)}</span>
        <span className="text-slate-400">/ {MAX_SCORE}</span>
      </div>
    )
  }
  return (
    <span className="chip text-white tabular-nums" style={{ backgroundColor: color }}>
      {formatScore(score)}
    </span>
  )
}
