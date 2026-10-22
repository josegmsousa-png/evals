import type { Metadata, Viewport } from 'next'
import { APP_NAME, DEPARTMENT } from '@/lib/config'
import './globals.css'

// URL absoluto para a imagem de pré-visualização ao partilhar o link
const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${APP_NAME} · ${DEPARTMENT}`, template: `%s · ${APP_NAME}` },
  description: `Avaliação anual dos técnicos · ${DEPARTMENT}`,
  applicationName: APP_NAME,
  appleWebApp: { capable: true, title: APP_NAME, statusBarStyle: 'default' },
  openGraph: {
    title: `${APP_NAME} · ${DEPARTMENT}`,
    description: 'Avaliação anual dos técnicos',
    type: 'website',
    locale: 'pt_PT',
  },
}

export const viewport: Viewport = { themeColor: '#3b55e6' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body>{children}</body>
    </html>
  )
}
