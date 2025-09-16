import express from 'express';
import { authRateLimit } from '../middleware/rateLimiting.js';
import { nextAuthMiddleware } from '../middleware/nextAuthMiddleware.js';
import { nodeRoutes } from './nodes.js';
import { synapseRoutes } from './synapses.js';
import { isolatedPostsRoutes } from './isolatedPosts.js';

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

  // Add NextAuth middleware to handle X-User-ID header
  apiRouter.use(nextAuthMiddleware);

  // Isolated posts routes (must come before /nodes to avoid /:id conflict)
  apiRouter.use('/nodes/isolated-posts', isolatedPostsRoutes);

  // Node routes
  apiRouter.use('/nodes', nodeRoutes);

  // Synapse routes
  apiRouter.use('/synapses', synapseRoutes);

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

  // Development test route for node creation (bypasses auth)
  if (process.env.NODE_ENV === 'development') {
    apiRouter.post('/test/create-node', async (req, res) => {
      try {
        const { NodeController } = await import('../controllers/nodeController.js');
        // Create a mock authenticated user for testing
        req.user = { id: '507f1f77bcf86cd799439011' }; // Mock UserNode ID
        await NodeController.createNode(req, res, (err) => {
          if (err) {
            res.status(500).json({ error: err.message });
          }
        });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });
  }

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
        synapses: {
          list: '/api/synapses',
          create: '/api/synapses',
          get: '/api/synapses/:id',
          update: '/api/synapses/:id',
          delete: '/api/synapses/:id',
          restore: '/api/synapses/:id/restore',
          stats: '/api/synapses/stats',
          bulk: '/api/synapses/bulk',
          nodeSynapses: '/api/synapses/node/:nodeId',
        },
      },
    });
  });
}
