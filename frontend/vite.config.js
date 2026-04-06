import { defineConfig } from 'vite'

// Relative base ensures built CSS/JS resolve when the app is served from a
// subfolder (common in monorepo deployments). Harmless in local dev.
export default defineConfig({
  base: './',
  css: {
    transformer: 'postcss'
  },
  build: {
    cssMinify: false // KEEP: intentional to avoid minification issues
  }
})
