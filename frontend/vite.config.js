import { defineConfig } from 'vite'

export default defineConfig({
  css: {
    transformer: 'postcss'
  },
  build: {
    cssMinify: false   // 🔥 VERY IMPORTANT
  }
})
