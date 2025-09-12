import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['esm'],
  dts: false, // Disable DTS generation for now
  splitting: true,
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  target: 'es2022',
  minify: process.env.NODE_ENV === 'production',
  env: {
    NODE_ENV: process.env.NODE_ENV || 'development',
  },
})
