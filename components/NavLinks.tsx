'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/avaliar', label: 'Avaliar', admin: false },
  { href: '/admin', label: 'Resultados', admin: true },
  { href: '/admin/equipa', label: 'Equipa', admin: true },
  { href: '/admin/periodos', label: 'Períodos', admin: true },
]

function isActive(path: string, href: string) {
  if (href === '/admin') return path === '/admin' || path.startsWith('/admin/tecnico')
  return path.startsWith(href)
}

// Desktop: links no topo. Telemóvel: barra de separadores por baixo do cabeçalho
export default function NavLinks({ isAdmin, mobile = false }: { isAdmin: boolean; mobile?: boolean }) {
  const path = usePathname()
  const links = LINKS.filter((l) => isAdmin || !l.admin)
  if (mobile && links.length < 2) return null

  return (
    <nav className={mobile
      ? 'sm:hidden flex overflow-x-auto border-t border-slate-100 px-2'
      : 'hidden sm:flex gap-1 text-sm'}>
      {links.map((l) => {
        const active = isActive(path, l.href)
        return (
          <Link key={l.href} href={l.href}
            className={mobile
              ? `flex-1 whitespace-nowrap px-3 py-2.5 text-center text-sm border-b-2 ${active ? 'border-brand-600 text-brand-700 font-medium' : 'border-transparent text-slate-500'}`
              : `rounded-lg px-3 py-1.5 ${active ? 'bg-brand-50 text-brand-700 font-medium' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
            {l.label}
          </Link>
        )
      })}
    </nav>
  )
}
