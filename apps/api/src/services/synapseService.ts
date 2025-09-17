import { Types } from 'mongoose';
import { SynapseNodeModel } from '../models/index.js';
import type { SynapseNode, SynapseDirection } from '@whitepine/types';
import { NODE_TYPES } from '@whitepine/types';
import { createError } from '../middleware/errorHandler.js';

export interface CreateSynapseRequest {
  from: Types.ObjectId;
  to: Types.ObjectId;
  role: string;
  dir?: SynapseDirection;
  order?: number;
  weight?: number;
  props?: Record<string, unknown>;
}

export interface UpdateSynapseRequest {
  role?: string;
  dir?: SynapseDirection;
  order?: number;
  weight?: number;
  props?: Record<string, unknown>;
}

export interface SynapseQuery {
  from?: Types.ObjectId;
  to?: Types.ObjectId;
  role?: string;
  dir?: SynapseDirection;
  deletedAt?: Date | null;
  limit?: number;
  skip?: number;
  sort?: Record<string, 1 | -1>;
}

export class SynapseService {
  /**
   * Create a new synapse
   */
  static async createSynapse(request: CreateSynapseRequest) {
    const { from, to, role, dir = 'out', order, weight, props } = request;
    
    try {
      // Validate that from and to are different
      if (from.equals(to)) {
        throw createError('Synapse cannot connect a node to itself', 400);
      }

      const synapseData = {
        kind: NODE_TYPES.SYNAPSE,
        from,
        to,
        role,
        dir,
        order,
        weight,
        props,
      };

      const synapse = new SynapseNodeModel(synapseData);
      await synapse.save();
      
      return synapse;
    } catch (error: any) {
      if (error.code === 11000) {
        throw createError('A synapse with this relationship already exists', 409);
      }
      if (error.statusCode) throw error;
      throw createError(`Failed to create synapse: ${error.message}`, 400);
    }
  }

  /**
   * Create multiple synapses in a transaction
   */
  static async createMultipleSynapses(requests: CreateSynapseRequest[]) {
    const session = await SynapseNodeModel.startSession();
    
    try {
      await session.withTransaction(async () => {
        const synapses = [];
        
        for (const request of requests) {
          const { from, to, role, dir = 'out', order, weight, props } = request;
          
          // Validate that from and to are different
          if (from.equals(to)) {
            throw createError('Synapse cannot connect a node to itself', 400);
          }

          const synapseData = {
            kind: NODE_TYPES.SYNAPSE,
            from,
            to,
            role,
            dir,
            order,
            weight,
            props,
          };

          const synapse = new SynapseNodeModel(synapseData);
          await synapse.save({ session });
          synapses.push(synapse);
        }
        
        return synapses;
      });
    } finally {
      await session.endSession();
    }
  }

  /**
   * Get a synapse by ID
   */
  static async getSynapseById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw createError('Invalid synapse ID', 400);
    }

    try {
      const synapse = await SynapseNodeModel.findById(id)
        .populate('from', 'kind content')
        .populate('to', 'kind content');
      
      if (!synapse) {
        throw createError('Synapse not found', 404);
      }
      return synapse;
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw createError(`Failed to get synapse: ${error.message}`, 500);
    }
  }

  /**
   * Update a synapse
   */
  static async updateSynapse(id: string, request: UpdateSynapseRequest) {
    if (!Types.ObjectId.isValid(id)) {
      throw createError('Invalid synapse ID', 400);
    }

    const { role, dir, order, weight, props } = request;

    try {
      const synapse = await SynapseNodeModel.findById(id);
      if (!synapse) {
        throw createError('Synapse not found', 404);
      }

      // Update fields
      if (role !== undefined) synapse.role = role;
      if (dir !== undefined) synapse.dir = dir;
      if (order !== undefined) synapse.order = order;
      if (weight !== undefined) synapse.weight = weight;
      if (props !== undefined) synapse.props = props;

      await synapse.save();
      return synapse;
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw createError(`Failed to update synapse: ${error.message}`, 500);
    }
  }

  /**
   * Soft delete a synapse
   */
  static async deleteSynapse(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw createError('Invalid synapse ID', 400);
    }

    try {
      const synapse = await SynapseNodeModel.findById(id);
      if (!synapse) {
        throw createError('Synapse not found', 404);
      }

      synapse.deletedAt = new Date();
      await synapse.save();
      return { message: 'Synapse deleted successfully' };
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw createError(`Failed to delete synapse: ${error.message}`, 500);
    }
  }

  /**
   * Restore a soft-deleted synapse
   */
  static async restoreSynapse(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw createError('Invalid synapse ID', 400);
    }

    try {
      const synapse = await SynapseNodeModel.findById(id);
      if (!synapse) {
        throw createError('Synapse not found', 404);
      }

      synapse.deletedAt = null;
      await synapse.save();
      return synapse;
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw createError(`Failed to restore synapse: ${error.message}`, 500);
    }
  }

  /**
   * List synapses with filtering and pagination
   */
  static async listSynapses(query: SynapseQuery) {
    const {
      from,
      to,
      role,
      dir,
      deletedAt = null,
      limit = 50,
      skip = 0,
      sort = { createdAt: -1 }
    } = query;

    try {
      const filter: any = { deletedAt };
      
      if (from) filter.from = from;
      if (to) filter.to = to;
      if (role) filter.role = role;
      if (dir) filter.dir = dir;

      const synapses = await SynapseNodeModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('from', 'kind content')
        .populate('to', 'kind content');

      const total = await SynapseNodeModel.countDocuments(filter);

      return {
        synapses,
        pagination: {
          total,
          limit,
          skip,
          hasMore: skip + limit < total,
        }
      };
    } catch (error: any) {
      throw createError(`Failed to list synapses: ${error.message}`, 500);
    }
  }

  /**
   * Get synapses for a specific node (both incoming and outgoing)
   */
  static async getNodeSynapses(nodeId: string, options: {
    role?: string;
    dir?: SynapseDirection;
    includeDeleted?: boolean;
  } = {}) {
    if (!Types.ObjectId.isValid(nodeId)) {
      throw createError('Invalid node ID', 400);
    }

    const { role, dir, includeDeleted = false } = options;
    const objectId = new Types.ObjectId(nodeId);

    try {
      const filter: any = {
        $or: [
          { from: objectId },
          { to: objectId }
        ]
      };

      if (!includeDeleted) {
        filter.deletedAt = null;
      }

      if (role) filter.role = role;
      if (dir) filter.dir = dir;

      const synapses = await SynapseNodeModel
        .find(filter)
        .populate('from', 'kind content')
        .populate('to', 'kind content')
        .sort({ createdAt: -1 });

      return synapses;
    } catch (error: any) {
      throw createError(`Failed to get node synapses: ${error.message}`, 500);
    }
  }

  /**
   * Get synapse statistics
   */
  static async getSynapseStats() {
    try {
      const stats = await SynapseNodeModel.aggregate([
        {
          $group: {
            _id: {
              role: '$role',
              dir: '$dir'
            },
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
      throw createError(`Failed to get synapse stats: ${error.message}`, 500);
    }
  }

  /**
   * Bulk delete synapses
   */
  static async bulkDeleteSynapses(synapseIds: string[]) {
    const session = await SynapseNodeModel.startSession();
    
    try {
      await session.withTransaction(async () => {
        const results = [];
        const errors = [];

        for (const synapseId of synapseIds) {
          try {
            if (!Types.ObjectId.isValid(synapseId)) {
              throw createError('Invalid synapse ID', 400);
            }

            const synapse = await SynapseNodeModel.findById(synapseId);
            if (!synapse) {
              throw createError('Synapse not found', 404);
            }

            synapse.deletedAt = new Date();
      await synapse.save();
            results.push({ synapseId, result: 'deleted' });
          } catch (error: any) {
            errors.push({ synapseId, error: error.message });
          }
        }

        return { results, errors };
      });
    } finally {
      await session.endSession();
    }
  }
}
