// web/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Habilitar el visualizer sólo si corres: ANALYZE=1 npm run build
const analyze = process.env.ANALYZE === '1'
let extraPlugins: any[] = []
if (analyze) {
  // npm i -D rollup-plugin-visualizer
  const { visualizer } = require('rollup-plugin-visualizer')
  extraPlugins.push(
    visualizer({
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
      open: true,
    })
  )
}

export default defineConfig({
  base: './',
  plugins: [react(), ...extraPlugins],
  server: {
    host: true,          // accesible desde la LAN (celu)
    port: 5173,
    strictPort: true,
    // Descomentar si el HMR no conecta en el celular:
    // hmr: { host: 'TU.IP.LOCAL', protocol: 'ws', port: 5173 },
  },
  build: {
    target: 'es2018',
    sourcemap: false,
    chunkSizeWarningLimit: 1200, // sube el umbral del warning (opcional)
    rollupOptions: {
      output: {
        // separa dependencias pesadas para mejor caché
        manualChunks: {
          react: ['react', 'react-dom'],
          router: ['react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          player: ['react-player'], // usá `react-player/lazy` en el código
          icons: ['lucide-react'],
        },
      },
    },
  },
})
