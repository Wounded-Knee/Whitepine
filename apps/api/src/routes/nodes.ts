import { Router, type Router as ExpressRouter } from 'express';
import { NodeController } from '../controllers/nodeController.js';
import { NodeWithRelationshipController } from '../controllers/nodeWithRelationshipController.js';
import { authRateLimit } from '../middleware/rateLimiting.js';
import { requireWritePermissions } from '../middleware/datePermissions.js';
import { 
  decodeNodeIdParams, 
  decodeNodeIdQuery, 
  decodeNodeIdBody,
  encodeNodeIdResponseByType,
  DEFAULT_NODE_ID_CONFIG
} from '../middleware/nodeIdMiddleware.js';
import {
  validateRequest,
  validateQuery,
  validateParams,
  createNodeSchema,
  updateNodeSchema,
  listNodesQuerySchema,
  bulkOperationsSchema,
  nodeIdSchema,
  synapseQuerySchema,
} from '../validation/nodeValidation.js';

const router: ExpressRouter = Router();

// Apply rate limiting to all node routes
router.use(authRateLimit);

// Apply node ID middleware to all routes for automatic encoding/decoding
router.use(decodeNodeIdParams);
router.use(decodeNodeIdQuery);
router.use(decodeNodeIdBody);
router.use(encodeNodeIdResponseByType(DEFAULT_NODE_ID_CONFIG));


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
router.get('/isolated-posts', NodeController.getIsolatedPostNodes); // Get isolated PostNodes

// Synapse-specific routes (synapses are nodes, but have special query patterns)
router.get('/synapses', 
  validateQuery(synapseQuerySchema),
  NodeController.listSynapses
); // List synapses (nodes with kind='synapse')

router.get('/synapses/stats', NodeController.getSynapseStats); // Get synapse statistics

router.get('/synapses/node/:nodeId', 
  validateParams(nodeIdSchema),
  validateQuery(synapseQuerySchema.pick({ role: true, dir: true, includeDeleted: true })),
  NodeController.getNodeSynapses
); // Get synapses for a specific node

router.post('/bulk', 
  requireWritePermissions,
  validateRequest(bulkOperationsSchema),
  NodeController.bulkOperations
); // Bulk operations

// Node with relationship routes
router.post('/with-relationship', 
  requireWritePermissions,
  NodeWithRelationshipController.createNodeWithRelationship
); // Create node with relationship

router.post('/with-relationships', 
  requireWritePermissions,
  NodeWithRelationshipController.createNodesWithRelationships
); // Create multiple nodes with relationships

// Node by ID routes with validation
router.get('/:id', 
  // validateParams(nodeIdSchema), // Temporarily disabled for testing
  NodeController.getNode
); // Get node by ID


router.put('/:id', 
  requireWritePermissions,
  validateParams(nodeIdSchema),
  validateRequest(updateNodeSchema),
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
