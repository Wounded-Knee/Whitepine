import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@shared': path.resolve(__dirname, '../../packages/types/src'),
      '@api': path.resolve(__dirname, '../api/src'),
      '@web': path.resolve(__dirname, './'),
      '@whitepine/types': path.resolve(__dirname, '../../packages/types/src'),
      '@whitepine/types/*': path.resolve(__dirname, '../../packages/types/src/*'),
    },
  },
})
