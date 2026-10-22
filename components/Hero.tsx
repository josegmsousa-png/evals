// Faixa de topo ao estilo da imagem de partilha: símbolo, título e departamento
export default function Hero({ title, department, subtitle, children }: {
  title: string
  department: string
  subtitle?: string
  children?: React.ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-brand-100 p-5 sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
        <div className="flex items-center gap-4 sm:gap-6 min-w-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.svg" alt="" className="h-16 w-16 shrink-0 drop-shadow-[0_10px_20px_rgba(47,67,196,0.35)] sm:h-24 sm:w-24" />
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-[#1e2a78] sm:text-4xl">{title}</h1>
            <div className="mt-0.5 text-base font-semibold text-brand-600 sm:mt-1 sm:text-xl">{department}</div>
            {subtitle && <p className="mt-1 text-sm text-slate-600 sm:mt-2">{subtitle}</p>}
          </div>
        </div>
        {children && <div className="sm:ml-auto">{children}</div>}
      </div>
    </section>
  )
}
