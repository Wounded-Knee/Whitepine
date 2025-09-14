import { z } from 'zod';

// Base node validation schema
const baseNodeSchema = z.object({
  kind: z.string().min(1, 'Node kind is required'),
});

// User node validation schema
const userNodeSchema = baseNodeSchema.extend({
  kind: z.literal('User'),
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

// Create node validation schema (union of all node types)
export const createNodeSchema = z.discriminatedUnion('kind', [
  userNodeSchema,
  // Add more node type schemas here as they're created
]);

// Update user node validation schema (partial of userNodeSchema)
export const updateUserNodeSchema = userNodeSchema.partial().omit({ kind: true });

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
