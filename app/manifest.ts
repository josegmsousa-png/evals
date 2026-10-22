import type { MetadataRoute } from 'next'
import { APP_NAME, AREA } from '@/lib/config'

// Permite "Adicionar ao ecrã principal" no Android com ícone próprio
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${APP_NAME} · ${AREA}`,
    short_name: APP_NAME,
    description: 'Avaliação anual dos técnicos',
    start_url: '/',
    display: 'standalone',
    background_color: '#f1f5f9',
    theme_color: '#3b55e6',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
