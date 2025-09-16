import { Router } from 'express';
import { NodeController } from '../controllers/nodeController.js';
import { authRateLimit } from '../middleware/rateLimiting.js';

const router = Router();

// Apply rate limiting
router.use(authRateLimit);

// Get isolated PostNodes
router.get('/', NodeController.getIsolatedPostNodes);

export { router as isolatedPostsRoutes };
