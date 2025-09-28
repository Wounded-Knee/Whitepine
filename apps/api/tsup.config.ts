import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['cjs'], // Use CommonJS instead of ESM
  dts: false, // Disable DTS generation for now
  splitting: false, // Disable splitting to bundle everything together
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  target: 'es2022',
  minify: process.env.NODE_ENV === 'production',
  env: {
    NODE_ENV: process.env.NODE_ENV || 'development',
  },
  // Bundle all dependencies to avoid module resolution issues
  noExternal: ['express', 'cors', 'helmet', 'compression', 'cookie-session', 'passport', 'passport-google-oauth20', 'bcryptjs', 'jsonwebtoken', 'mongoose', 'mongodb', 'multer', 'node-cron', 'pino', 'rate-limiter-flexible', 'zod', '@aws-sdk/client-s3', '@aws-sdk/s3-request-presigner', 'dotenv', 'bcryptjs', 'cookie-session', 'compression', 'helmet', 'cors', '@whitepine/types'],
  // Ensure tsup respects TypeScript path aliases
  esbuildOptions(options) {
    options.alias = {
      '@shared': '../../packages/types/src',
      '@api': './src',
      '@web': '../web',
    }
  },
})
