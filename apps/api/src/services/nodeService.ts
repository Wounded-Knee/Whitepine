import { Types } from 'mongoose';
import { BaseNodeModel, UserNodeModel, PostNodeModel, SynapseNodeModel } from '../models/index.js';
import type { BaseNode, SynapseDirection } from '@whitepine/types';
import { NODE_TYPES } from '@whitepine/types';
import { createError } from '../middleware/errorHandler.js';
import { isWritePermitted } from '../middleware/datePermissions.js';
import { SynapseService, CreateSynapseRequest } from './synapseService.js';

export interface CreateNodeRequest {
  kind: string;
  data: Record<string, any>;
  createdBy?: Types.ObjectId;
  ownerId?: Types.ObjectId;
  synapses?: CreateSynapseRequest[];
}

export interface UpdateNodeRequest {
  data: Record<string, any>;
  updatedBy?: Types.ObjectId;
  synapses?: {
    create?: CreateSynapseRequest[];
    update?: Array<{ id: string; data: Partial<CreateSynapseRequest> }>;
    delete?: string[];
  };
}

export interface NodeQuery {
  kind?: string;
  createdBy?: Types.ObjectId;
  ownerId?: Types.ObjectId;
  deletedAt?: Date | null | undefined;
  limit?: number;
  skip?: number;
  sort?: Record<string, 1 | -1>;
}

// Registry of available node models
const nodeModels = {
  [NODE_TYPES.USER]: UserNodeModel,
  [NODE_TYPES.POST]: PostNodeModel,
  [NODE_TYPES.SYNAPSE]: SynapseNodeModel,
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
   * Create a new node with optional synapses
   */
  static async createNode(request: CreateNodeRequest) {
    const { kind, data, createdBy, ownerId, synapses } = request;
    
    const session = await BaseNodeModel.startSession();
    
    try {
      return await session.withTransaction(async () => {
        const Model = this.getModel(kind);
        
        const nodeData = {
          kind,
          ...data,
          createdBy,
          ownerId: ownerId || createdBy,
        };

        const node = new Model(nodeData);
        await node.save({ session });
        
        // Create synapses if provided
        if (synapses && synapses.length > 0) {
          const synapseRequests = synapses.map(synapse => ({
            ...synapse,
            from: synapse.from || node._id, // Default to the new node if not specified
            to: synapse.to || node._id,
            createdBy: synapse.createdBy || createdBy || undefined,
            ownerId: synapse.ownerId || ownerId || createdBy || undefined,
          }));

          await SynapseService.createMultipleSynapses(synapseRequests);
        }
        
        return node;
      });
    } catch (error: any) {
      if (error.code === 11000) {
        throw createError('A node with this data already exists', 409);
      }
      if (error.statusCode) throw error;
      throw createError(`Failed to create node: ${error.message}`, 400);
    } finally {
      await session.endSession();
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
      
      // Add computed readOnly field based on write permissions
      const nodeWithComputedFields = node.toObject() as any;
      nodeWithComputedFields.readOnly = !isWritePermitted();
      
      return nodeWithComputedFields;
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw createError(`Failed to get node: ${error.message}`, 500);
    }
  }

  /**
   * Get a node by ID with its synapses
   */
  static async getNodeWithSynapses(id: string, options: {
    role?: string;
    dir?: SynapseDirection;
    includeDeleted?: boolean;
  } = {}) {
    if (!Types.ObjectId.isValid(id)) {
      throw createError('Invalid node ID', 400);
    }

    try {
      const node = await BaseNodeModel.findById(id);
      if (!node) {
        throw createError('Node not found', 404);
      }

      const synapses = await SynapseService.getNodeSynapses(id, options);
      
      return {
        node,
        synapses,
      };
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw createError(`Failed to get node with synapses: ${error.message}`, 500);
    }
  }

  /**
   * Update a node with optional synapse operations
   */
  static async updateNode(id: string, request: UpdateNodeRequest) {
    if (!Types.ObjectId.isValid(id)) {
      throw createError('Invalid node ID', 400);
    }

    const { data, updatedBy, synapses } = request;

    const session = await BaseNodeModel.startSession();
    
    try {
      return await session.withTransaction(async () => {
        const node = await BaseNodeModel.findById(id);
        if (!node) {
          throw createError('Node not found', 404);
        }

        // Update node fields
        Object.assign(node, data);
        if (updatedBy) {
          node.updatedBy = updatedBy;
        }
        await node.save({ session });

        // Handle synapse operations if provided
        if (synapses) {
          const nodeId = new Types.ObjectId(id);

          // Create new synapses
          if (synapses.create && synapses.create.length > 0) {
            const synapseRequests = synapses.create.map(synapse => ({
              ...synapse,
              from: synapse.from || nodeId,
              to: synapse.to || nodeId,
              createdBy: synapse.createdBy || updatedBy || undefined,
              ownerId: synapse.ownerId || node.ownerId || undefined,
            }));
            await SynapseService.createMultipleSynapses(synapseRequests);
          }

          // Update existing synapses
          if (synapses.update && synapses.update.length > 0) {
            for (const update of synapses.update) {
              await SynapseService.updateSynapse(update.id, {
                ...update.data,
                updatedBy: updatedBy || undefined,
              });
            }
          }

          // Delete synapses
          if (synapses.delete && synapses.delete.length > 0) {
            await SynapseService.bulkDeleteSynapses(synapses.delete);
          }
        }

        return node;
      });
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw createError(`Failed to update node: ${error.message}`, 500);
    } finally {
      await session.endSession();
    }
  }

  /**
   * Soft delete a node
   */
  static async deleteNode(id: string) {
    // Check write permissions
    if (!isWritePermitted()) {
      throw createError('Write operations are only permitted on the 15th of any month', 403);
    }

    if (!Types.ObjectId.isValid(id)) {
      throw createError('Invalid node ID', 400);
    }

    try {
      const node = await BaseNodeModel.findById(id);
      if (!node) {
        throw createError('Node not found', 404);
      }

      node.deletedAt = new Date();
      await node.save();
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

      node.deletedAt = null;
      await node.save();
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

      // Add computed readOnly field to each node
      const nodesWithComputedFields = nodes.map(node => {
        const nodeObj = node.toObject() as any;
        nodeObj.readOnly = !isWritePermitted();
        return nodeObj;
      });

      const total = await BaseNodeModel.countDocuments(filter);

      return {
        nodes: nodesWithComputedFields,
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

  /**
   * Get PostNodes that have no synapses connected to them
   */
  static async getIsolatedPostNodes() {
    try {
      // Get all PostNodes
      const postNodes = await PostNodeModel.find({ deletedAt: null }).lean();
      
      // Get all synapses that reference PostNodes
      const synapseFromIds = await SynapseNodeModel.distinct('from', { deletedAt: null });
      const synapseToIds = await SynapseNodeModel.distinct('to', { deletedAt: null });
      
      // Combine all synapse-referenced node IDs
      const connectedNodeIds = new Set([
        ...synapseFromIds.map(id => id.toString()),
        ...synapseToIds.map(id => id.toString())
      ]);
      
      // Filter out PostNodes that are referenced by synapses
      const isolatedPostNodes = postNodes.filter(postNode => 
        !connectedNodeIds.has(postNode._id.toString())
      );
      
      return isolatedPostNodes;
    } catch (error: any) {
      throw createError(`Failed to get isolated post nodes: ${error.message}`, 500);
    }
  }
}
