import { LEVELS } from '@/lib/score'

// Distribuição de respostas por nível, ao estilo dos resultados do Google Forms
export default function LevelBars({ levels }: { levels: number[] }) {
  const counts = LEVELS.map((_, i) => levels.filter((l) => l === i).length)
  const max = Math.max(1, ...counts)
  return (
    <div className="space-y-1.5">
      {LEVELS.map((l, i) => (
        <div key={l.label} className="flex items-center gap-3 text-sm">
          <span className="w-20 text-slate-600">{l.label}</span>
          <div className="flex-1 h-5 rounded bg-slate-100 overflow-hidden">
            <div className="h-full rounded transition-all" style={{ width: `${(counts[i] / max) * 100}%`, backgroundColor: l.color }} />
          </div>
          <span className="w-16 text-right tabular-nums text-slate-500">
            {counts[i]} {levels.length ? `(${Math.round((counts[i] / levels.length) * 100)}%)` : ''}
          </span>
        </div>
      ))}
    </div>
  )
}
