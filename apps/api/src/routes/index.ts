import express from 'express';
import { authRateLimit } from '../middleware/rateLimiting.js';
import { nextAuthMiddleware } from '../middleware/nextAuthMiddleware.js';
import { nodeRoutes } from './nodes.js';
import { avatarRoutes } from './avatars.js';

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

  // Node routes (includes synapse routes since synapses are nodes)
  apiRouter.use('/nodes', nodeRoutes);

  // Avatar routes
  apiRouter.use('/avatars', avatarRoutes);

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

  // User count endpoint (public)
  apiRouter.get('/users/count', async (req, res) => {
    try {
      const { model: BaseNodeModel } = await import('../models/BaseNode.js');
      const count = await BaseNodeModel.countDocuments({ 
        kind: 'user', 
        deletedAt: null 
      });
      res.json({ count });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Development test route for node creation (bypasses auth)
  if (process.env.NODE_ENV === 'development') {
    apiRouter.post('/test/create-node', async (req, res) => {
      try {
        const { NodeController } = await import('../controllers/nodeController.js');
        // Create a mock authenticated user for testing
        req.user = { id: 'wp_UH8fd7z4bNeZQ5AR' }; // Mock UserNode ID (branded)
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
          isolatedPosts: '/api/nodes/isolated-posts',
          bulk: '/api/nodes/bulk',
          // Synapse routes (synapses are nodes with kind='synapse')
          synapses: {
            list: '/api/nodes/synapses',
            stats: '/api/nodes/synapses/stats',
            nodeSynapses: '/api/nodes/synapses/node/:nodeId',
          },
        },
        avatars: {
          serve: '/api/avatars/:filename',
          getUser: '/api/avatars/user/:userId',
          upload: '/api/avatars/upload',
          update: '/api/avatars/update',
          refresh: '/api/avatars/refresh/:userId',
          remove: '/api/avatars/remove',
          cleanup: '/api/avatars/cleanup',
          refreshAll: '/api/avatars/refresh-all',
        },
      },
    });
  });
}
