import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// Отдельный конфиг: в тестах не нужны seo-плагин и manualChunks,
// зато нужен DOM и алиасы, совпадающие с прод-сборкой.
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        additionalData: `@use "@/app/styles/variables.scss" as *;`,
      },
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
    // Стили в тестах не собираем — проверяем поведение, а не CSS.
    css: false,
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage',
      include: ['src/**/*.{ts,vue}', 'vite-plugins/**/*.ts'],
      exclude: ['src/main.ts', 'src/**/*.d.ts', 'src/shared/ui/icons/Icon*.vue'],
      reporter: ['text-summary', 'html'],
    },
  },
})
