import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/migrations/*.ts'],
  format: ['cjs'], // CJS for migrate-mongo compatibility
  outDir: 'migrations',
  target: 'node18',
  clean: false, // Don't clean existing migrations
  sourcemap: false,
  minify: false,
  dts: false,
})
