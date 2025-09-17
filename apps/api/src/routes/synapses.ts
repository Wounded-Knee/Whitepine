import { Router } from 'express';
import { SynapseController } from '../controllers/synapseController.js';
import { authRateLimit } from '../middleware/rateLimiting.js';
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
  createSynapseSchema,
  updateSynapseSchema,
  synapseQuerySchema,
  synapseIdSchema,
  bulkSynapseOperationsSchema,
} from '../validation/nodeValidation.js';

const router = Router();

// Apply rate limiting to all synapse routes
router.use(authRateLimit);

// Apply node ID middleware to all routes for automatic encoding/decoding
// Temporarily disabled to test FK field removal
// router.use(decodeNodeIdParams);
// router.use(decodeNodeIdQuery);
// router.use(decodeNodeIdBody);
// router.use(encodeNodeIdResponseByType(DEFAULT_NODE_ID_CONFIG));

// Synapse routes with validation
router.post('/', 
  validateRequest(createSynapseSchema),
  SynapseController.createSynapse
); // Create synapse

router.get('/', 
  validateQuery(synapseQuerySchema),
  SynapseController.listSynapses
); // List synapses

router.get('/stats', SynapseController.getSynapseStats);     // Get synapse statistics

router.post('/bulk', 
  validateRequest(bulkSynapseOperationsSchema),
  SynapseController.bulkOperations
); // Bulk operations

// Synapse by ID routes with validation
router.get('/:id', 
  validateParams(synapseIdSchema),
  SynapseController.getSynapse
); // Get synapse by ID

router.put('/:id', 
  validateParams(synapseIdSchema),
  validateRequest(updateSynapseSchema),
  SynapseController.updateSynapse
); // Update synapse

router.delete('/:id', 
  validateParams(synapseIdSchema),
  SynapseController.deleteSynapse
); // Soft delete synapse

router.post('/:id/restore', 
  validateParams(synapseIdSchema),
  SynapseController.restoreSynapse
); // Restore synapse

// Node-specific synapse routes
router.get('/node/:nodeId', 
  validateParams({ nodeId: synapseIdSchema.shape.id }),
  validateQuery(synapseQuerySchema.pick({ role: true, dir: true, includeDeleted: true })),
  SynapseController.getNodeSynapses
); // Get synapses for a specific node

export { router as synapseRoutes };
