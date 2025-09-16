import { Router } from 'express';
import { NodeController } from '../controllers/nodeController.js';
import { authRateLimit } from '../middleware/rateLimiting.js';
import { requireWritePermissions } from '../middleware/datePermissions.js';
import {
  validateRequest,
  validateQuery,
  validateParams,
  createNodeSchema,
  updateUserNodeSchema,
  listNodesQuerySchema,
  bulkOperationsSchema,
  nodeIdSchema,
} from '../validation/nodeValidation.js';

const router = Router();

// Apply rate limiting to all node routes
router.use(authRateLimit);

// Node routes with validation
router.post('/', 
  requireWritePermissions,
  validateRequest(createNodeSchema),
  NodeController.createNode
); // Create node

router.get('/', 
  validateQuery(listNodesQuerySchema),
  NodeController.listNodes
); // List nodes

router.get('/kinds', NodeController.getNodeKinds);     // Get available kinds
router.get('/stats', NodeController.getNodeStats);     // Get node statistics

router.post('/bulk', 
  requireWritePermissions,
  validateRequest(bulkOperationsSchema),
  NodeController.bulkOperations
); // Bulk operations

// Node by ID routes with validation
router.get('/:id', 
  validateParams(nodeIdSchema),
  NodeController.getNode
); // Get node by ID

router.put('/:id', 
  requireWritePermissions,
  validateParams(nodeIdSchema),
  validateRequest(updateUserNodeSchema),
  NodeController.updateNode
); // Update node

router.delete('/:id', 
  requireWritePermissions,
  validateParams(nodeIdSchema),
  NodeController.deleteNode
); // Soft delete node

router.post('/:id/restore', 
  requireWritePermissions,
  validateParams(nodeIdSchema),
  NodeController.restoreNode
); // Restore node

export { router as nodeRoutes };
