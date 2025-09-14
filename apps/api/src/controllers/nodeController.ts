import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { NodeService } from '../services/nodeService.js';
import { createError } from '../middleware/errorHandler.js';
import type { ApiResponse, PaginationParams } from '@whitepine/types';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        email: string;
        name: string;
      };
    }
  }
}

export class NodeController {
  /**
   * Create a new node
   * POST /api/nodes
   */
  static async createNode(req: Request, res: Response, next: NextFunction) {
    try {
      const { kind, ...data } = req.body;
      const userId = req.user?._id;

      if (!kind) {
        throw createError('Node kind is required', 400);
      }

      const node = await NodeService.createNode({
        kind,
        data,
        createdBy: userId ? new Types.ObjectId(userId) : undefined,
        ownerId: userId ? new Types.ObjectId(userId) : undefined,
      });

      const response: ApiResponse = {
        success: true,
        data: node,
        message: 'Node created successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a node by ID
   * GET /api/nodes/:id
   */
  static async getNode(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const node = await NodeService.getNodeById(id);

      const response: ApiResponse = {
        success: true,
        data: node,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a node
   * PUT /api/nodes/:id
   */
  static async updateNode(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?._id;

      const node = await NodeService.updateNode(id, {
        data: req.body,
        updatedBy: userId ? new Types.ObjectId(userId) : undefined,
      });

      const response: ApiResponse = {
        success: true,
        data: node,
        message: 'Node updated successfully',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Soft delete a node
   * DELETE /api/nodes/:id
   */
  static async deleteNode(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await NodeService.deleteNode(id);

      const response: ApiResponse = {
        success: true,
        data: result,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Restore a soft-deleted node
   * POST /api/nodes/:id/restore
   */
  static async restoreNode(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const node = await NodeService.restoreNode(id);

      const response: ApiResponse = {
        success: true,
        data: node,
        message: 'Node restored successfully',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * List nodes with filtering and pagination
   * GET /api/nodes
   */
  static async listNodes(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        kind,
        createdBy,
        ownerId,
        includeDeleted = 'false',
        limit = '50',
        skip = '0',
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      // Parse pagination parameters
      const limitNum = Math.min(parseInt(limit as string) || 50, 100); // Max 100
      const skipNum = parseInt(skip as string) || 0;
      const sortOrderNum = sortOrder === 'asc' ? 1 : -1;

      const query = {
        kind: kind as string,
        createdBy: createdBy ? new Types.ObjectId(createdBy as string) : undefined,
        ownerId: ownerId ? new Types.ObjectId(ownerId as string) : undefined,
        deletedAt: includeDeleted === 'true' ? undefined : null,
        limit: limitNum,
        skip: skipNum,
        sort: { [sortBy as string]: sortOrderNum },
      };

      const result = await NodeService.listNodes(query);

      const response: ApiResponse = {
        success: true,
        data: result.nodes,
        pagination: {
          page: Math.floor(skipNum / limitNum) + 1,
          limit: limitNum,
          total: result.pagination.total,
          totalPages: Math.ceil(result.pagination.total / limitNum),
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get available node kinds
   * GET /api/nodes/kinds
   */
  static async getNodeKinds(req: Request, res: Response, next: NextFunction) {
    try {
      const kinds = NodeService.getAvailableKinds();

      const response: ApiResponse = {
        success: true,
        data: kinds,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get node statistics
   * GET /api/nodes/stats
   */
  static async getNodeStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await NodeService.getNodeStats();

      const response: ApiResponse = {
        success: true,
        data: stats,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Bulk operations on nodes
   * POST /api/nodes/bulk
   */
  static async bulkOperations(req: Request, res: Response, next: NextFunction) {
    try {
      const { operation, nodeIds, data } = req.body;
      const userId = req.user?._id;

      if (!operation || !nodeIds || !Array.isArray(nodeIds)) {
        throw createError('Invalid bulk operation request', 400);
      }

      const results = [];
      const errors = [];

      for (const nodeId of nodeIds) {
        try {
          let result;
          switch (operation) {
            case 'delete':
              result = await NodeService.deleteNode(nodeId);
              break;
            case 'restore':
              result = await NodeService.restoreNode(nodeId);
              break;
            case 'update':
              if (!data) {
                throw createError('Data is required for update operation', 400);
              }
              result = await NodeService.updateNode(nodeId, {
                data,
                updatedBy: userId ? new Types.ObjectId(userId) : undefined,
              });
              break;
            default:
              throw createError(`Unknown operation: ${operation}`, 400);
          }
          results.push({ nodeId, result });
        } catch (error: any) {
          errors.push({ nodeId, error: error.message });
        }
      }

      const response: ApiResponse = {
        success: true,
        data: {
          operation,
          processed: results.length,
          errors: errors.length,
          results,
          errors,
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}
