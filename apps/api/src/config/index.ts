import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const configSchema = z.object({
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  port: z.coerce.number().default(4000),
  logLevel: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  
  // Database
  mongoUri: z.string().min(1, 'MongoDB URI is required'),
  
  // CORS
  corsOrigins: z.string().transform(val => 
    val.split(',').map(origin => origin.trim())
  ).default('http://localhost:3000,http://localhost:3001'),
  
  // Authentication
  sessionSecret: z.string().min(32, 'Session secret must be at least 32 characters'),
  googleClientId: z.string().optional(),
  googleClientSecret: z.string().optional(),
  jwtSecret: z.string().min(32, 'JWT secret must be at least 32 characters'),
  
  // AWS
  awsRegion: z.string().default('us-east-1'),
  awsAccessKeyId: z.string().optional(),
  awsSecretAccessKey: z.string().optional(),
  s3BucketName: z.string().optional(),
  
  // Rate limiting
  rateLimitWindowMs: z.coerce.number().default(15 * 60 * 1000), // 15 minutes
  rateLimitMax: z.coerce.number().default(100), // requests per window
});

const envConfig = {
  nodeEnv: process.env.NODE_ENV,
  port: process.env.PORT,
  logLevel: process.env.LOG_LEVEL,
  mongoUri: process.env.MONGODB_URI,
  corsOrigins: process.env.CORS_ORIGINS,
  sessionSecret: process.env.SESSION_SECRET,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  jwtSecret: process.env.JWT_SECRET,
  awsRegion: process.env.AWS_REGION,
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  s3BucketName: process.env.S3_BUCKET_NAME,
  rateLimitWindowMs: process.env.RATE_LIMIT_WINDOW_MS,
  rateLimitMax: process.env.RATE_LIMIT_MAX,
};

export const config = configSchema.parse(envConfig);

// Type-safe config export
export type Config = z.infer<typeof configSchema>;
