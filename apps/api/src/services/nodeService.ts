import { Types } from 'mongoose';
import { BaseNodeModel, UserNodeModel } from '../models/index.js';
import type { BaseNode } from '@whitepine/types';
import { createError } from '../middleware/errorHandler.js';

export interface CreateNodeRequest {
  kind: string;
  data: Record<string, any>;
  createdBy?: Types.ObjectId;
  ownerId?: Types.ObjectId;
}

export interface UpdateNodeRequest {
  data: Record<string, any>;
  updatedBy?: Types.ObjectId;
}

export interface NodeQuery {
  kind?: string;
  createdBy?: Types.ObjectId;
  ownerId?: Types.ObjectId;
  deletedAt?: Date | null;
  limit?: number;
  skip?: number;
  sort?: Record<string, 1 | -1>;
}

// Registry of available node models
const nodeModels = {
  User: UserNodeModel,
  // Add more node types here as they're created
} as const;

type NodeKind = keyof typeof nodeModels;

export class NodeService {
  /**
   * Get the appropriate model for a given node kind
   */
  private static getModel(kind: string) {
    const model = nodeModels[kind as NodeKind];
    if (!model) {
      throw createError(`Unknown node kind: ${kind}`, 400);
    }
    return model;
  }

  /**
   * Create a new node
   */
  static async createNode(request: CreateNodeRequest) {
    const { kind, data, createdBy, ownerId } = request;
    
    try {
      const Model = this.getModel(kind);
      
      const nodeData = {
        kind,
        ...data,
        createdBy,
        ownerId: ownerId || createdBy,
      };

      const node = new Model(nodeData);
      await node.save();
      
      return node;
    } catch (error: any) {
      if (error.code === 11000) {
        throw createError('A node with this data already exists', 409);
      }
      throw createError(`Failed to create node: ${error.message}`, 400);
    }
  }

  /**
   * Get a node by ID
   */
  static async getNodeById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw createError('Invalid node ID', 400);
    }

    try {
      const node = await BaseNodeModel.findById(id);
      if (!node) {
        throw createError('Node not found', 404);
      }
      return node;
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw createError(`Failed to get node: ${error.message}`, 500);
    }
  }

  /**
   * Update a node
   */
  static async updateNode(id: string, request: UpdateNodeRequest) {
    if (!Types.ObjectId.isValid(id)) {
      throw createError('Invalid node ID', 400);
    }

    const { data, updatedBy } = request;

    try {
      const node = await BaseNodeModel.findById(id);
      if (!node) {
        throw createError('Node not found', 404);
      }

      // Update fields
      Object.assign(node, data);
      if (updatedBy) {
        node.updatedBy = updatedBy;
      }

      await node.save();
      return node;
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw createError(`Failed to update node: ${error.message}`, 500);
    }
  }

  /**
   * Soft delete a node
   */
  static async deleteNode(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw createError('Invalid node ID', 400);
    }

    try {
      const node = await BaseNodeModel.findById(id);
      if (!node) {
        throw createError('Node not found', 404);
      }

      await node.softDelete();
      return { message: 'Node deleted successfully' };
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw createError(`Failed to delete node: ${error.message}`, 500);
    }
  }

  /**
   * Restore a soft-deleted node
   */
  static async restoreNode(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw createError('Invalid node ID', 400);
    }

    try {
      const node = await BaseNodeModel.findById(id);
      if (!node) {
        throw createError('Node not found', 404);
      }

      await node.restore();
      return node;
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw createError(`Failed to restore node: ${error.message}`, 500);
    }
  }

  /**
   * List nodes with filtering and pagination
   */
  static async listNodes(query: NodeQuery) {
    const {
      kind,
      createdBy,
      ownerId,
      deletedAt = null,
      limit = 50,
      skip = 0,
      sort = { createdAt: -1 }
    } = query;

    try {
      const filter: any = { deletedAt };
      
      if (kind) filter.kind = kind;
      if (createdBy) filter.createdBy = createdBy;
      if (ownerId) filter.ownerId = ownerId;

      const nodes = await BaseNodeModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .populate('ownerId', 'name email');

      const total = await BaseNodeModel.countDocuments(filter);

      return {
        nodes,
        pagination: {
          total,
          limit,
          skip,
          hasMore: skip + limit < total,
        }
      };
    } catch (error: any) {
      throw createError(`Failed to list nodes: ${error.message}`, 500);
    }
  }

  /**
   * Get available node kinds
   */
  static getAvailableKinds() {
    return Object.keys(nodeModels);
  }

  /**
   * Get node statistics
   */
  static async getNodeStats() {
    try {
      const stats = await BaseNodeModel.aggregate([
        {
          $group: {
            _id: '$kind',
            count: { $sum: 1 },
            active: {
              $sum: {
                $cond: [{ $eq: ['$deletedAt', null] }, 1, 0]
              }
            },
            deleted: {
              $sum: {
                $cond: [{ $ne: ['$deletedAt', null] }, 1, 0]
              }
            }
          }
        }
      ]);

      return stats;
    } catch (error: any) {
      throw createError(`Failed to get node stats: ${error.message}`, 500);
    }
  }
}
