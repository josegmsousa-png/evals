'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

export default function UserMenu({ name, email }: { name: string; email: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Fecha ao clicar fora ou carregar em Esc
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const label = name || email
  const initials = label.split(/[\s@.]+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open}
        className="flex items-center gap-2 rounded-lg px-2 py-1 text-slate-600 hover:bg-slate-100 hover:text-slate-900">
        <span className="h-7 w-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-semibold">
          {initials}
        </span>
        <span className="hidden sm:inline">{label}</span>
        <svg className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-56 card py-1 shadow-lg">
          <div className="px-4 py-2 border-b border-slate-100">
            <div className="font-medium truncate">{label}</div>
            {name && <div className="text-xs text-slate-500 truncate">{email}</div>}
          </div>
          <Link href="/palavra-passe" onClick={() => setOpen(false)}
            className="block px-4 py-2 text-slate-700 hover:bg-slate-50">
            Mudar palavra-passe
          </Link>
          <form action="/auth/signout" method="post">
            <button className="block w-full px-4 py-2 text-left text-red-600 hover:bg-red-50">Sair</button>
          </form>
        </div>
      )}
    </div>
  )
}
