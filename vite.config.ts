import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@vue/devtools-kit': fileURLToPath(new URL('./src/shared/lib/devtools-stub.ts', import.meta.url))
    }
  },
  build: {
    cssMinify: false
  }
})
