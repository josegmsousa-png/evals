// Ícones simples (traço), herdam a cor do texto
type P = { className?: string }
const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', viewBox: '0 0 24 24' } as const

export const PencilIcon = ({ className = 'h-4 w-4' }: P) => (
  <svg {...base} className={className} aria-hidden><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" /></svg>
)
export const TrashIcon = ({ className = 'h-4 w-4' }: P) => (
  <svg {...base} className={className} aria-hidden><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /></svg>
)
export const KeyIcon = ({ className = 'h-4 w-4' }: P) => (
  <svg {...base} className={className} aria-hidden><circle cx="7.5" cy="15.5" r="4.5" /><path d="M10.7 12.3L21 2" /><path d="M16 7l3 3" /><path d="M18 5l2 2" /></svg>
)
export const CheckIcon = ({ className = 'h-4 w-4' }: P) => (
  <svg {...base} className={className} aria-hidden><path d="M20 6L9 17l-5-5" /></svg>
)
export const XIcon = ({ className = 'h-4 w-4' }: P) => (
  <svg {...base} className={className} aria-hidden><path d="M18 6L6 18M6 6l12 12" /></svg>
)

// Botão redondo só com ícone; o título aparece ao passar o rato e é lido pelos leitores de ecrã
export const iconBtn = 'inline-flex h-8 w-8 items-center justify-center rounded-lg transition'
export const iconBtnGray = `${iconBtn} text-slate-500 hover:bg-slate-100 hover:text-slate-900`
export const iconBtnRed = `${iconBtn} text-red-500 hover:bg-red-50 hover:text-red-700`
