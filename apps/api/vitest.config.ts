import { defineConfig } from 'vitest/config'
import path from 'path'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    setupFiles: ['./test/setup.ts'],
    globals: true,
    // Configure test file patterns
    include: ['test/**/*.test.ts'],
    exclude: ['node_modules/**', 'dist/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../../packages/types/src'),
      '@api': path.resolve(__dirname, './src'),
      '@whitepine/types': path.resolve(__dirname, '../../packages/types/src'),
    },
  },
})
