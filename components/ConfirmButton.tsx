'use client'

// Botão de submit que pede confirmação antes de enviar o formulário
export default function ConfirmButton({
  message, className, children, ...props
}: { message: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className={className}
      onClick={(e) => { if (!confirm(message)) e.preventDefault() }}>
      {children}
    </button>
  )
}
