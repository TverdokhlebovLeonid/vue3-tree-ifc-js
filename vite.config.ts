/// <reference types="vitest" />
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vitest/config'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      sass: {
        api: 'modern-compiler',
        additionalData: `@use "@/assets/style/base" as *;\n`,
      },
    },
  },
  plugins: [
    vue(),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    dir: '__tests__',
    setupFiles: ['./__tests__/setup.ts'],
    server: {
      deps: {
        inline: ['element-plus'],
      },
    },
  },
})
