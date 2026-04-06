import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// For Vercel deployment - use relative paths
export default defineConfig({
  plugins: [react()],
  base: '',
  css: {
    transformer: 'postcss'
  },
  build: {
    cssMinify: false, // KEEP: intentional to avoid minification issues
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      }
    }
  }
})
