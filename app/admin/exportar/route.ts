import { NextResponse, type NextRequest } from 'next/server'
import * as XLSX from 'xlsx'
import { getProfile } from '@/lib/auth'
import { getPeriod } from '@/lib/period'
import { loadResults } from '@/lib/results'
import { LEVELS, computeScore } from '@/lib/score'

export async function GET(request: NextRequest) {
  const profile = await getProfile()
  if (profile?.role !== 'admin') return new NextResponse('Forbidden', { status: 403 })
  const { period } = await getPeriod(request.nextUrl.searchParams.get('periodo') ?? undefined)
  if (!period) return new NextResponse('Not found', { status: 404 })

  const { criteria, results, profiles } = await loadResults(period)
  const nameOf = (id: string) => profiles.find((p) => p.id === id)?.name || id
  const round = (n: number | null) => (n == null ? '' : Math.round(n * 100) / 100)

  const resumo = results.map((r) => ({
    'Técnico': r.technician.name,
    'Média /4': round(r.score),
    'Respostas': r.evaluations.length,
    ...Object.fromEntries(criteria.map((c) => {
      const avg = r.criterionAvg[c.id]
      return [`${c.name} (${c.weight}%)`, avg == null ? '' : `${Math.round(avg * 25)}%`]
    })),
  }))

  const detalhe = results.flatMap((r) => r.evaluations.map((e) => ({
    'Técnico': r.technician.name,
    'Engenheiro': nameOf(e.engineer_id),
    'Nota /4': round(computeScore(criteria, e.scores)),
    ...Object.fromEntries(criteria.flatMap((c) => {
      const s = e.scores[c.id]
      return [
        [c.name, s?.level != null ? LEVELS[s.level].label : ''],
        [`${c.name} — comentário`, s?.comment ?? ''],
      ]
    })),
  })))

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(resumo), 'Resumo')
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(detalhe), 'Detalhe')
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${period.name.replace(/[^\w\- ]/g, '')}.xlsx"`,
    },
  })
}
