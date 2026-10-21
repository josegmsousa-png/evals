'use client'
import { usePathname, useRouter } from 'next/navigation'
import type { Period } from '@/lib/types'

export default function PeriodPicker({ periods, current }: { periods: Period[]; current: string }) {
  const router = useRouter()
  const path = usePathname()
  if (periods.length < 2) return null
  return (
    <select className="input w-auto" value={current} onChange={(e) => router.push(`${path}?periodo=${e.target.value}`)}>
      {periods.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
    </select>
  )
}
