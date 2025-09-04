import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'IVINFLAMEX',
        short_name: 'IVINFLAMEX',
        description: 'IVINFLAMEX – Addiction control, wellness tracking, and AI voice coach',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    proxy: {
      // Proxy AI API requests to the advanced AI server
      '/api/coach': (() => {
        // Prefer a dedicated AI server port if provided, else fall back to the main server port
        const aiPort = Number(env.VITE_AI_SERVER_PORT || env.VITE_SERVER_PORT || env.PORT || 5174)
        return {
          target: `http://localhost:${aiPort}`,
          changeOrigin: true,
          ws: true
        }
      })(),
      // Fallback proxy for other API routes
      '/api': (() => {
        const apiPort = Number(env.VITE_SERVER_PORT || env.PORT || 5174)
        return {
          target: `http://localhost:${apiPort}`,
          changeOrigin: true,
          ws: true
        }
      })(),
      '/ws': (() => {
        const apiPort = Number(env.VITE_SERVER_PORT || env.PORT || 5174)
        return {
          target: `ws://localhost:${apiPort}`,
          changeOrigin: true,
          ws: true
        }
      })()
    }
  }
}})
