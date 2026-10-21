import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = { title: 'Avaliações', description: 'Avaliação anual dos técnicos' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body>{children}</body>
    </html>
  )
}
