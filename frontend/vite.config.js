import { defineConfig } from 'vite'

// For Vercel deployment - use relative paths
export default defineConfig({
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
