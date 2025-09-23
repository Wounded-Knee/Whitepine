import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import pino from 'pino';
import { config } from './config/index.js';
import { connectDatabase } from './database/index.js';
import { setupAuth } from './auth/index.js';
import { setupRateLimiting } from './middleware/rateLimiting.js';
import { setupRoutes } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { AvatarService } from './services/avatarService.js';
import { SchedulerService } from './services/schedulerService.js';

const logger = pino({
  level: config.logLevel,
  // Simplified logging for now - can add pino-pretty later
});

const app = express();

// Trust proxy for rate limiting and IP detection
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration - simplified approach
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001', 
  'http://localhost:4000',
  'http://localhost:5000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:4000',
  'http://127.0.0.1:5000'
];

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-User-ID', 'X-User-Email', 'X-User-Name', 'X-User-Picture']
};

// Log CORS configuration for debugging
logger.info('CORS origins configured:', allowedOrigins);

app.use(cors(corsOptions));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
setupRateLimiting(app);

// Authentication
setupAuth(app);

// Routes
setupRoutes(app);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    logger.info('Database connected successfully');

    // Initialize avatar service
    await AvatarService.initialize();
    logger.info('Avatar service initialized successfully');

    // Initialize scheduler service
    SchedulerService.initialize();
    logger.info('Scheduler service initialized successfully');

    // Start server
    const server = app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
      logger.info(`Health check available at http://localhost:${config.port}/health`);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();
