import { z } from 'zod';
import { NODE_TYPES } from '@whitepine/types';

// Base node validation schema
const baseNodeSchema = z.object({
  kind: z.string().min(1, 'Node kind is required'),
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

// Post node validation schema
const postNodeSchema = baseNodeSchema.extend({
  kind: z.literal(NODE_TYPES.POST),
  content: z.string().min(1, 'Content is required').max(10000, 'Content too long'),
  publishedAt: z.date().optional().nullable(),
});

// Synapse node validation schema
const synapseNodeSchema = baseNodeSchema.extend({
  kind: z.literal(NODE_TYPES.SYNAPSE),
  from: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid from node ID'),
  to: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid to node ID'),
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
// Note: For discriminated unions, we need the kind field to be required
const updateUserNodeWithKindSchema = updateUserNodeSchema.extend({
  kind: z.literal(NODE_TYPES.USER),
  synapses: synapseOperationsSchema.optional(),
});

const updatePostNodeWithKindSchema = updatePostNodeSchema.extend({
  kind: z.literal(NODE_TYPES.POST),
  synapses: synapseOperationsSchema.optional(),
});

const updateSynapseNodeWithKindSchema = updateSynapseNodeSchema.extend({
  kind: z.literal(NODE_TYPES.SYNAPSE),
  synapses: synapseOperationsSchema.optional(),
});

export const updateNodeSchema = z.discriminatedUnion('kind', [
  updateUserNodeWithKindSchema,
  updatePostNodeWithKindSchema,
  updateSynapseNodeWithKindSchema,
]);

// Query parameters validation schema
export const listNodesQuerySchema = z.object({
  kind: z.string().optional(),
  createdBy: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid createdBy ID').optional(),
  ownerId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ownerId ID').optional(),
  includeDeleted: z.enum(['true', 'false']).optional(),
  limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
  skip: z.string().regex(/^\d+$/, 'Skip must be a number').optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Bulk operations validation schema
export const bulkOperationsSchema = z.object({
  operation: z.enum(['delete', 'restore', 'update']),
  nodeIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid node ID')).min(1, 'At least one node ID is required'),
  data: z.record(z.any()).optional(),
});

// Node ID parameter validation schema
export const nodeIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid node ID'),
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
