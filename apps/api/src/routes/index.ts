import express from 'express';
import { authRateLimit } from '../middleware/rateLimiting.js';
import { nodeRoutes } from './nodes.js';

export function setupRoutes(app: express.Application): void {
  // Health check route
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    });
  });

  // API routes
  const apiRouter = express.Router();

  // Node routes
  apiRouter.use('/nodes', nodeRoutes);

  // Example protected route
  apiRouter.get('/protected', (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ message: 'This is a protected route', user: req.user });
    } else {
      res.status(401).json({ error: 'Authentication required' });
    }
  });

  // Example public route
  apiRouter.get('/public', (req, res) => {
    res.json({ message: 'This is a public route' });
  });

  // Mount API routes
  app.use('/api', apiRouter);

  // Root route
  app.get('/', (req, res) => {
    res.json({
      message: 'White Pine API',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      endpoints: {
        health: '/health',
        api: '/api',
        auth: {
          google: '/auth/google',
          logout: '/auth/logout',
          me: '/auth/me',
        },
        nodes: {
          list: '/api/nodes',
          create: '/api/nodes',
          get: '/api/nodes/:id',
          update: '/api/nodes/:id',
          delete: '/api/nodes/:id',
          restore: '/api/nodes/:id/restore',
          kinds: '/api/nodes/kinds',
          stats: '/api/nodes/stats',
          bulk: '/api/nodes/bulk',
        },
      },
    });
  });
}
