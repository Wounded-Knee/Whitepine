import mongoose from 'mongoose';
import pino from 'pino';
import { config } from '../config/index.js';

const logger = pino({
  name: 'database',
  level: config.logLevel,
});

export async function connectDatabase(): Promise<void> {
  try {
    // Configure mongoose options
    const options = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
    };

    // Connect to MongoDB
    await mongoose.connect(config.mongoUri, options);
    
    logger.info('Connected to MongoDB successfully');

    // Handle connection events
    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    logger.error({ error }, 'Failed to connect to MongoDB');
    logger.error({ uriSet: !!config.mongoUri }, 'MongoDB URI status');
    logger.error({ 
      maskedUri: config.mongoUri ? config.mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@') : 'Not set' 
    }, 'MongoDB URI (masked)');
    logger.error({ 
      errorMessage: (error as Error).message,
      errorCode: (error as any).code,
      errorName: (error as Error).name
    }, 'Error details');
    console.log('DEBUG - Full MongoDB URI:', config.mongoUri);
    console.log('DEBUG - Full error:', JSON.stringify(error, null, 2));
    throw error;
  }
}
