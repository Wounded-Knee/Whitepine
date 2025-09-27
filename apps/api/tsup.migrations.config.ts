import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/migrations/20241201120000-create-user-indexes.ts',
    'src/migrations/20241201120100-create-session-ttl-index.ts',
    'src/migrations/20241201120200-create-token-ttl-index.ts',
    'src/migrations/20241201120300-create-audit-log-indexes.ts',
    'src/migrations/20241201120400-migrate-user-schema.ts',
    'src/migrations/20250914052426-create-nodes-collection.ts',
    'src/migrations/template.ts',
    'src/migrations/utils.ts'
  ],
  format: ['cjs'], // CJS for migrate-mongo compatibility
  outDir: 'migrations',
  target: 'node18',
  clean: false, // Don't clean existing migrations
  sourcemap: false,
  minify: false,
  dts: false,
  // Ensure tsup respects TypeScript path aliases for migrations
  esbuildOptions(options) {
    options.alias = {
      '@shared': '../../packages/types/src',
      '@api': './src',
      '@web': '../web',
    }
  },
  // Ensure proper module resolution for migrations
  external: ['mongodb'],
})
