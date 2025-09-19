import { z } from 'zod';
import { NODE_TYPES, NODE_TYPE_VALUES, isValidEncodedNodeId } from '@whitepine/types';

// Custom validation for encoded node IDs only
const nodeIdValidation = z.string().refine((id) => {
  return isValidEncodedNodeId(id);
}, 'Invalid encoded node ID');

// Base node validation schema
const baseNodeSchema = z.object({
  kind: z.enum(NODE_TYPE_VALUES as [string, ...string[]], {
    errorMap: () => ({ message: `Node kind must be one of: ${NODE_TYPE_VALUES.join(', ')}` })
  }),
});

// User node validation schema
const userNodeSchema = baseNodeSchema.extend({
  kind: z.literal(NODE_TYPES.USER),
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  avatar: z.string().url('Invalid avatar URL').optional(),
  bio: z.string().max(500, 'Bio too long').optional(),
  isActive: z.boolean().optional(),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'auto']).optional(),
    language: z.string().optional(),
    notifications: z.object({
      email: z.boolean().optional(),
      push: z.boolean().optional(),
    }).optional(),
  }).optional(),
});

// Post node validation schema (for user input - publishedAt is handled by API)
const postNodeSchema = baseNodeSchema.extend({
  kind: z.literal(NODE_TYPES.POST),
  content: z.string().min(1, 'Content is required').max(10000, 'Content too long'),
  publishImmediately: z.boolean().optional(), // UI flag, not stored in DB
});

// Synapse node validation schema
const synapseNodeSchema = baseNodeSchema.extend({
  kind: z.literal(NODE_TYPES.SYNAPSE),
  from: z.union([
    z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid from node ID'),
    z.any() // Allow ObjectID objects from middleware
  ]),
  to: z.union([
    z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid to node ID'),
    z.any() // Allow ObjectID objects from middleware
  ]),
  role: z.string().min(1, 'Role is required').max(100, 'Role too long'),
  dir: z.enum(['out', 'in', 'undirected']).optional(),
  order: z.number().int().optional(),
  weight: z.number().optional(),
  props: z.record(z.any()).optional(),
});

// Synapse creation schema for use in node creation
const synapseCreateSchema = z.object({
  from: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid from node ID').optional(),
  to: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid to node ID').optional(),
  role: z.string().min(1, 'Role is required').max(100, 'Role too long'),
  dir: z.enum(['out', 'in', 'undirected']).optional(),
  order: z.number().int().optional(),
  weight: z.number().optional(),
  props: z.record(z.any()).optional(),
});

// Enhanced node creation schemas with synapse support
const userNodeWithSynapsesSchema = userNodeSchema.extend({
  synapses: z.array(synapseCreateSchema).optional(),
});

const postNodeWithSynapsesSchema = postNodeSchema.extend({
  synapses: z.array(synapseCreateSchema).optional(),
});

const synapseNodeWithSynapsesSchema = synapseNodeSchema.extend({
  synapses: z.array(synapseCreateSchema).optional(),
});

// Create node validation schema (union of all node types)
export const createNodeSchema = z.discriminatedUnion('kind', [
  userNodeWithSynapsesSchema,
  postNodeWithSynapsesSchema,
  synapseNodeWithSynapsesSchema,
]);

// Update schemas for each node type
export const updateUserNodeSchema = userNodeSchema.partial();

export const updatePostNodeSchema = postNodeSchema.partial();

export const updateSynapseNodeSchema = synapseNodeSchema.partial();

// Synapse operations for node updates
const synapseUpdateSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid synapse ID'),
  data: synapseCreateSchema.partial(),
});

const synapseOperationsSchema = z.object({
  create: z.array(synapseCreateSchema).optional(),
  update: z.array(synapseUpdateSchema).optional(),
  delete: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid synapse ID')).optional(),
});

// Enhanced update schemas with synapse operations
export const updateUserNodeWithSynapsesSchema = updateUserNodeSchema.extend({
  synapses: synapseOperationsSchema.optional(),
});

export const updatePostNodeWithSynapsesSchema = updatePostNodeSchema.extend({
  synapses: synapseOperationsSchema.optional(),
});

export const updateSynapseNodeWithSynapsesSchema = updateSynapseNodeSchema.extend({
  synapses: synapseOperationsSchema.optional(),
});

// General update schema (union of all update types)
// Update schemas that don't require kind field (since it shouldn't be changed)
export const updateNodeSchema = z.union([
  updateUserNodeSchema.extend({
    synapses: synapseOperationsSchema.optional(),
  }),
  updatePostNodeSchema.extend({
    synapses: synapseOperationsSchema.optional(),
  }),
  updateSynapseNodeSchema.extend({
    synapses: synapseOperationsSchema.optional(),
  }),
]);

// Query parameters validation schema
export const listNodesQuerySchema = z.object({
  kind: z.enum(NODE_TYPE_VALUES as [string, ...string[]], {
    errorMap: () => ({ message: `Node kind must be one of: ${NODE_TYPE_VALUES.join(', ')}` })
  }).optional(),
  includeDeleted: z.enum(['true', 'false']).optional(),
  limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
  skip: z.string().regex(/^\d+$/, 'Skip must be a number').optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Bulk operations validation schema
export const bulkOperationsSchema = z.object({
  operation: z.enum(['delete', 'restore', 'update']),
  nodeIds: z.array(nodeIdValidation).min(1, 'At least one node ID is required'),
  data: z.record(z.any()).optional(),
});

// Node ID parameter validation schema
export const nodeIdSchema = z.object({
  id: nodeIdValidation,
});

// Synapse-specific validation schemas
export const createSynapseSchema = synapseCreateSchema;

export const updateSynapseSchema = synapseCreateSchema.partial();

export const synapseQuerySchema = z.object({
  from: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid from node ID').optional(),
  to: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid to node ID').optional(),
  role: z.string().optional(),
  dir: z.enum(['out', 'in', 'undirected']).optional(),
  includeDeleted: z.enum(['true', 'false']).optional(),
  limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
  skip: z.string().regex(/^\d+$/, 'Skip must be a number').optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const synapseIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid synapse ID'),
});

export const bulkSynapseOperationsSchema = z.object({
  operation: z.enum(['delete', 'restore']),
  synapseIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid synapse ID')).min(1, 'At least one synapse ID is required'),
});

// Node creation validation function
export function validateNodeCreation(nodeData: any): { success: boolean; error?: string } {
  try {
    // Determine which schema to use based on node kind
    let schema;
    switch (nodeData.kind) {
      case NODE_TYPES.USER:
        schema = userNodeSchema;
        break;
      case NODE_TYPES.POST:
        schema = postNodeSchema;
        break;
      case NODE_TYPES.SYNAPSE:
        schema = synapseNodeSchema;
        break;
      default:
        return { success: false, error: 'Unknown node kind' };
    }
    
    schema.parse(nodeData);
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join(', ');
      return { success: false, error: errorMessage };
    }
    return { success: false, error: 'Validation failed' };
  }
}

// Validation middleware factory
export function validateRequest(schema: z.ZodSchema) {
  return (req: any, res: any, next: any) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: {
            message: 'Validation Error',
            details: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
              code: err.code,
            })),
          },
        });
      }
      next(error);
    }
  };
}

// Query validation middleware
export function validateQuery(schema: z.ZodSchema) {
  return (req: any, res: any, next: any) => {
    try {
      const validatedQuery = schema.parse(req.query);
      req.query = validatedQuery;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: {
            message: 'Query Validation Error',
            details: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
              code: err.code,
            })),
          },
        });
      }
      next(error);
    }
  };
}

// Params validation middleware
export function validateParams(schema: z.ZodSchema) {
  return (req: any, res: any, next: any) => {
    try {
      const validatedParams = schema.parse(req.params);
      req.params = validatedParams;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: {
            message: 'Parameter Validation Error',
            details: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
              code: err.code,
            })),
          },
        });
      }
      next(error);
    }
  };
}
