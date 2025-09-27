import express from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import pino from 'pino';
import { config } from '../config/index.js';

const logger = pino({
  name: 'rate-limiter',
  level: config.logLevel,
});

// Create rate limiter instance
const rateLimiter = new RateLimiterMemory({
  keyPrefix: 'middleware',
  points: config.nodeEnv === 'development' ? 10000 : config.rateLimitMax, // Much more lenient in development
  duration: config.nodeEnv === 'development' ? 60 : config.rateLimitWindowMs / 1000, // 1 minute in dev
});

// Rate limiting middleware
export function setupRateLimiting(app: express.Application): void {
  app.use(async (req, res, next) => {
    try {
      const key = req.ip || 'unknown';
      await rateLimiter.consume(key);
      next();
    } catch (rejRes: any) {
      const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
      
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method
      });

      res.set('Retry-After', String(secs));
      res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Try again in ${secs} seconds.`,
        retryAfter: secs
      });
    }
  });
}

// Strict rate limiter for auth endpoints
const authRateLimiter = new RateLimiterMemory({
  keyPrefix: 'auth',
  points: config.nodeEnv === 'development' ? 1000 : 5, // More lenient in development
  duration: config.nodeEnv === 'development' ? 60 : 900, // 1 minute in dev, 15 minutes in prod
  blockDuration: config.nodeEnv === 'development' ? 60 : 900, // 1 minute block in dev
});

export const authRateLimit = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const key = req.ip || 'unknown';
    await authRateLimiter.consume(key);
    next();
  } catch (rejRes: any) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path
    });

    res.set('Retry-After', String(secs));
    res.status(429).json({
      error: 'Too Many Requests',
      message: `Authentication rate limit exceeded. Try again in ${secs} seconds.`,
      retryAfter: secs
    });
  }
};
