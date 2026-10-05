import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'AnimalTrack',
        short_name: 'AnimalTrack',
        description: 'Evidenta crescatoriei de papagali: pasari, perechi, cuibarit si arbore genealogic.',
        theme_color: '#2e7d32',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Codul aplicatiei (JS/CSS/HTML) se cacheaza pentru pornire rapida si functionare
        // offline a interfetei. API-ul (backend.onrender.com) e pe alt domeniu, deci
        // cererile catre el nu sunt "navigatii" si nu intra sub incidenta cache-ului de
        // mai jos - datele despre pasari raman mereu proaspete, luate direct de la server.
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
})
