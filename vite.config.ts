import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Bind IPv4 loopback explicitly: Vite's default "localhost" resolved to ::1
  // only on this machine, which some local clients could not reach.
  server: { host: '127.0.0.1', port: 5173, strictPort: true, open: false },
  preview: { host: '127.0.0.1', port: 4173, strictPort: true },
  // The auth background is a ~2.4 MB PNG exported from Figma; keep it a real
  // file request rather than inlining it as a data URI.
  build: {
    assetsInlineLimit: 0,
    target: 'es2020',
    cssMinify: true,
    reportCompressedSize: true,
  },
})
