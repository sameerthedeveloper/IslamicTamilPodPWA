import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        id: '/',
        name: 'Tamil Islamic Podcast',
        short_name: 'Tamil Islamic',
        description: 'Tamil Islamic lectures, Quran recitations, and admin content management.',
        theme_color: '#0F766E',
        background_color: '#FAFAF9',
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone'],
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        lang: 'en',
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'Browse', short_name: 'Browse', url: '/browse', icons: [{ src: '/pwa-192.png', sizes: '192x192' }] },
          { name: 'Library', short_name: 'Library', url: '/library', icons: [{ src: '/pwa-192.png', sizes: '192x192' }] },
          { name: 'Admin', short_name: 'Admin', url: '/admin', icons: [{ src: '/pwa-192.png', sizes: '192x192' }] },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        runtimeCaching: [
          {
            // Uploaded audio files (Storage path audio/{episodeId}/...,
            // -> .../o/audio%2F... in the download URL). NetworkOnly, not
            // cached — <audio> streams/seeks these via HTTP Range requests,
            // which Workbox's CacheFirst/other cache-based strategies don't
            // serve correctly out of the box (no workbox-range-requests
            // plugin available in generateSW mode). Caching them anyway was
            // silently breaking seeking and stalling resume after the app
            // was backgrounded — let the browser hit the network directly
            // instead, same as it would with no service worker at all.
            urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*\/o\/audio%2F.*/i,
            handler: 'NetworkOnly',
          },
          {
            // Everything else on Firebase Storage (thumbnails, cover art) —
            // small, whole-file image responses with no Range requests
            // involved, safe to cache-first since a re-upload always writes
            // a new path rather than overwriting one in place.
            urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'firebase-storage',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-stylesheets' },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
})
