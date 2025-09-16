import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { SynapseService } from '../services/synapseService.js';
import { createError } from '../middleware/errorHandler.js';
import type { ApiResponse, PaginationParams } from '@whitepine/types';

// Define our user type
type AuthUser = {
  id: string;
  email?: string;
  name?: string;
  picture?: string;
  provider?: string;
};

export class SynapseController {
  /**
   * Create a new synapse
   * POST /api/synapses
   */
  static async createSynapse(req: Request, res: Response, next: NextFunction) {
    try {
      const { from, to, role, dir, order, weight, props } = req.body;
      const userId = (req.user as any)?.id;

      // Ensure createdBy is always set for authenticated users
      if (!userId) {
        throw createError('Authentication required to create synapses', 401);
      }

      const synapse = await SynapseService.createSynapse({
        from: new Types.ObjectId(from),
        to: new Types.ObjectId(to),
        role,
        dir,
        order,
        weight,
        props,
        createdBy: new Types.ObjectId(userId), // UserNode's MongoDB ObjectId
        ownerId: new Types.ObjectId(userId),   // UserNode's MongoDB ObjectId
      });

      const response: ApiResponse = {
        success: true,
        data: synapse,
        message: 'Synapse created successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a synapse by ID
   * GET /api/synapses/:id
   */
  static async getSynapse(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const synapse = await SynapseService.getSynapseById(id);

      const response: ApiResponse = {
        success: true,
        data: synapse,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a synapse
   * PUT /api/synapses/:id
   */
  static async updateSynapse(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req.user as any)?.id;

      const synapse = await SynapseService.updateSynapse(id, {
        ...req.body,
        ...(userId && { updatedBy: new Types.ObjectId(userId) }),
      });

      const response: ApiResponse = {
        success: true,
        data: synapse,
        message: 'Synapse updated successfully',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Soft delete a synapse
   * DELETE /api/synapses/:id
   */
  static async deleteSynapse(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await SynapseService.deleteSynapse(id);

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
   * Restore a soft-deleted synapse
   * POST /api/synapses/:id/restore
   */
  static async restoreSynapse(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const synapse = await SynapseService.restoreSynapse(id);

      const response: ApiResponse = {
        success: true,
        data: synapse,
        message: 'Synapse restored successfully',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * List synapses with filtering and pagination
   * GET /api/synapses
   */
  static async listSynapses(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        from,
        to,
        role,
        dir,
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
        from: from ? new Types.ObjectId(from as string) : undefined,
        to: to ? new Types.ObjectId(to as string) : undefined,
        role: role as string,
        dir: dir as 'out' | 'in' | 'undirected',
        deletedAt: includeDeleted === 'true' ? undefined : null,
        limit: limitNum,
        skip: skipNum,
        sort: { [sortBy as string]: sortOrderNum },
      };

      const result = await SynapseService.listSynapses(query);

      const response: ApiResponse = {
        success: true,
        data: result.synapses,
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
   * Get synapses for a specific node
   * GET /api/synapses/node/:nodeId
   */
  static async getNodeSynapses(req: Request, res: Response, next: NextFunction) {
    try {
      const { nodeId } = req.params;
      const { role, dir, includeDeleted = 'false' } = req.query;

      const synapses = await SynapseService.getNodeSynapses(nodeId, {
        role: role as string,
        dir: dir as 'out' | 'in' | 'undirected',
        includeDeleted: includeDeleted === 'true',
      });

      const response: ApiResponse = {
        success: true,
        data: synapses,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get synapse statistics
   * GET /api/synapses/stats
   */
  static async getSynapseStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await SynapseService.getSynapseStats();

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
   * Bulk operations on synapses
   * POST /api/synapses/bulk
   */
  static async bulkOperations(req: Request, res: Response, next: NextFunction) {
    try {
      const { operation, synapseIds } = req.body;

      if (!operation || !synapseIds || !Array.isArray(synapseIds)) {
        throw createError('Invalid bulk operation request', 400);
      }

      const results = [];
      const errors = [];

      for (const synapseId of synapseIds) {
        try {
          let result;
          switch (operation) {
            case 'delete':
              result = await SynapseService.deleteSynapse(synapseId);
              break;
            case 'restore':
              result = await SynapseService.restoreSynapse(synapseId);
              break;
            default:
              throw createError(`Unknown operation: ${operation}`, 400);
          }
          results.push({ synapseId, result });
        } catch (error: any) {
          errors.push({ synapseId, error: error.message });
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
