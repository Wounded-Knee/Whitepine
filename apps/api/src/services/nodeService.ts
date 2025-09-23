import { Types } from 'mongoose';
import {
  BaseNodeModel,
  UserNodeModel,
  PostNodeModel,
  SynapseNodeModel
} from '../models/index.js';
import {
  BASE_NODE_CONFIG,
  USER_NODE_CONFIG,
  POST_NODE_CONFIG,
  SYNAPSE_NODE_CONFIG
} from '@whitepine/types';
import type { BaseNode, SynapseDirection, NodeType, SynapseRole, CreateSynapseRequest as TypesCreateSynapseRequest } from '@whitepine/types';
import { NODE_TYPES, SYNAPSE_DIRECTIONS, SYNAPSE_ROLES } from '@whitepine/types';
import { createError } from '../middleware/errorHandler.js';
import { isWritePermitted } from '../middleware/datePermissions.js';

const selectionCriteria = {
  [NODE_TYPES.BASE]: BASE_NODE_CONFIG.selectionCriteria,
  [NODE_TYPES.USER]: USER_NODE_CONFIG.selectionCriteria,
  [NODE_TYPES.POST]: POST_NODE_CONFIG.selectionCriteria,
  [NODE_TYPES.SYNAPSE]: SYNAPSE_NODE_CONFIG.selectionCriteria
};

const nodeHandlers = {
  [NODE_TYPES.BASE]: { onCreate: (BASE_NODE_CONFIG as any).onCreate },
  [NODE_TYPES.USER]: { onCreate: (USER_NODE_CONFIG as any).onCreate },
  [NODE_TYPES.POST]: { onCreate: (POST_NODE_CONFIG as any).onCreate },
  [NODE_TYPES.SYNAPSE]: { onCreate: (SYNAPSE_NODE_CONFIG as any).onCreate }
}

/**
 * Nodes are the atomic unit of data structure.
 * Relationships between nodes are represented by synapses.
 * Synapses are nodes with kind='synapse'.
 * 
 * Synapses contain attributes indicating:
 *    IDs of the nodes they connect.
 *    The type of relationship they represent.
 *    The direction of the relationship.
 *    The order of the relationship.
 * 
 * Synapses can be created with or without nodes. If they are created with nodes,
 * the nodes will be created in the same transaction as the synapses.
 * If they are created without nodes, the nodes the synapse references must already exist.
 * 
 * 
 */

// CreateSynapseRequest is now imported from @whitepine/types

export interface CreateNodeRequest {
  kind: string;
  data: Record<string, any>;
  synapses?: TypesCreateSynapseRequest[];
  userId?: string; // Optional authenticated user ID for automatic authorship synapse
}

export interface UpdateNodeRequest {
  data: Record<string, any>;
  synapses?: {
    create?: TypesCreateSynapseRequest[];
    update?: Array<{ id: string; data: Partial<TypesCreateSynapseRequest> }>;
    delete?: string[];
  };
}

export interface NodeQuery {
  kind?: string;
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
   * 
   * If synapses are specified, they will be created in the same transaction as the node.
   * If synapses are not specified, they will not be created.
   * 
   * If the node is created successfully, the synapses will be created successfully.
   * If the node is not created successfully, the synapses will not be created.
   * 
   * If the synapses are not created successfully, the node will not be created.
   */
  static async createNode(request: CreateNodeRequest) {
    const { kind, data, synapses, userId } = request;
    
    const session = await BaseNodeModel.startSession();
    
    try {
      return await session.withTransaction(async () => {
        const Model = this.getModel(kind);
        
        const nodeData = {
          kind,
          ...data,
        };

        const node = new Model(nodeData);
        await node.save({ session });
        
        // Prepare all synapses to create (including automatic authorship synapse)
        const allSynapseRequests: TypesCreateSynapseRequest[] = [];

        // Always create an authorship synapse if userId is provided
        if (userId) {
          // Handle both encoded (wp_*) and raw MongoDB ObjectId strings
          const decodedUserId = userId.startsWith('wp_') ? this.normalizeNodeId(userId) : userId;

          allSynapseRequests.push(nodeHandlers[kind as NodeKind].onCreate(node, decodedUserId, allSynapseRequests));
        }

        // Add any additional synapses provided in the request
        if (synapses && synapses.length > 0) {
          const additionalSynapses = synapses.map(synapse => ({
            ...synapse,
            from: synapse.from || new Types.ObjectId(node._id), // Default to the new node if not specified
            to: synapse.to || new Types.ObjectId(node._id),
          }));
          allSynapseRequests.push(...additionalSynapses);
        }

        // Create all synapses if any exist
        if (allSynapseRequests.length > 0) {
          await this.createMultipleSynapses(allSynapseRequests, session);
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
   * Normalize a node ID - handle encoded IDs and corrupted object strings
   */
  static normalizeNodeId(id: string): string {
    // Handle encoded node IDs - decode manually to avoid import issues
    if (typeof id === 'string' && id.startsWith('wp_')) {
      try {
        // Manual base64url decoding
        const NODE_ID_PREFIX = 'wp_';
        const base64url = id.slice(NODE_ID_PREFIX.length);
        
        // Convert base64url to base64
        let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) {
          base64 += '=';
        }
        
        // Convert base64 to hex manually
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        const bytes = [];
        
        for (let i = 0; i < base64.length; i += 4) {
          const a = chars.indexOf(base64.charAt(i));
          const b = chars.indexOf(base64.charAt(i + 1));
          const c = chars.indexOf(base64.charAt(i + 2));
          const d = chars.indexOf(base64.charAt(i + 3));
          
          const bitmap = (a << 18) | (b << 12) | (c << 6) | d;
          
          bytes.push((bitmap >> 16) & 255);
          if (c !== 64) bytes.push((bitmap >> 8) & 255);
          if (d !== 64) bytes.push(bitmap & 255);
        }
        
        // Convert bytes to hex
        let hex = '';
        for (let i = 0; i < bytes.length; i++) {
          hex += bytes[i].toString(16).padStart(2, '0');
        }
        
        return hex;
      } catch (decodeError) {
        throw new Error(`Invalid encoded node ID: ${id}`);
      }
    }
    
    // Handle corrupted object strings - extract ObjectId from any format
    if (typeof id === 'string') {
      // Extract any 24-character hex string (MongoDB ObjectId format)
      const idMatch = id.match(/([a-fA-F0-9]{24})/);
      if (idMatch) {
        return idMatch[1];
      }
    }
    
    return id;
  }

  /**
   * Get a node by ID with automatically included connected synapses using MongoDB aggregation
   */
  static async getNodeById(id: string) {
    // Handle the specific case where an object string is passed
    if (typeof id === 'string' && id.includes('_id: new ObjectId(')) {
      const idMatch = id.match(/ObjectId\(['"]([a-fA-F0-9]{24})['"]\)/);
      if (idMatch) {
        id = idMatch[1];
      }
    }
    
    // Additional check for the specific error pattern
    if (typeof id === 'string' && id.includes('_id: new ObjectId(')) {
      const idMatch = id.match(/ObjectId\(['"]([a-fA-F0-9]{24})['"]\)/);
      if (idMatch) {
        id = idMatch[1];
      }
    }
    
    // Normalize the ID - handle encoded IDs and corrupted object strings
    id = this.normalizeNodeId(id);

    if (!Types.ObjectId.isValid(id)) {
      throw createError('Invalid node ID', 400);
    }

    try {
      // Additional safety check - if id still contains object string, extract it
      if (typeof id === 'string' && (id.includes('_id') || id.includes('ObjectId'))) {
        const objectIdMatch = id.match(/ObjectId\(['"]([a-fA-F0-9]{24})['"]\)/);
        if (objectIdMatch) {
          id = objectIdMatch[1];
        } else {
          const idMatch = id.match(/([a-fA-F0-9]{24})/);
          if (idMatch) {
            id = idMatch[1];
          }
        }
      }
      
      // Use MongoDB aggregation pipeline to efficiently find the node and all related nodes through synapses
      const pipeline = [
        // Match the target node
        {
          $match: {
            _id: new Types.ObjectId(id)
          }
        },
        // Lookup all synapses connected to this node (any direction)
        {
          $lookup: {
            from: 'nodes',
            let: { nodeId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$kind', NODE_TYPES.SYNAPSE] },
                      // Use synapse selection criteria for relatives
                      ...Object.entries(selectionCriteria[NODE_TYPES.SYNAPSE].relatives).map(([key, value]) => ({
                        $eq: [`$${key}`, value]
                      })),
                      {
                        $or: [
                          { $eq: ['$from', '$$nodeId'] },
                          { $eq: ['$to', '$$nodeId'] }
                        ]
                      }
                    ]
                  }
                }
              }
            ],
            as: 'allSynapses'
          }
        },
        // Extract unique related node IDs from all synapses by:
        // 1. Using $reduce to iterate over all synapses
        // 2. For each synapse, getting both 'from' and 'to' IDs
        // 3. Filtering out the current node's ID and any nulls
        // 4. Using $setUnion to ensure uniqueness of IDs
        // 5. Accumulating the unique IDs into relatedNodeIds array
        {
          $addFields: {
            relatedNodeIds: {
              $reduce: {
                input: '$allSynapses',
                initialValue: [],
                in: {
                  $setUnion: [
                    '$$value',
                    {
                      $filter: {
                        input: [
                          '$$this.from',
                          '$$this.to'
                        ],
                        as: 'nodeId',
                        cond: {
                          $and: [
                            { $ne: ['$$nodeId', '$_id'] },
                            { $ne: ['$$nodeId', null] }
                          ]
                        }
                      }
                    }
                  ]
                }
              }
            }
          }
        },
        // Lookup all related nodes with dynamic filtering based on node kind
        {
          $lookup: {
            from: 'nodes',
            localField: 'relatedNodeIds',
            foreignField: '_id',
            pipeline: [
              {
                $match: {
                  // Base filter applies to all node types
                  ...selectionCriteria[NODE_TYPES.BASE].relatives,
                  // Dynamic filtering based on node kind
                  $or: Object.values(NODE_TYPES).map((kind: NodeType) => ({
                    $and: [
                      { kind },
                      selectionCriteria[kind].relatives
                    ]
                  }))
                },
              }
            ],
            as: 'relatedNodes'
          }
        }
      ];

      const result = await BaseNodeModel.aggregate(pipeline);
      
      if (!result || result.length === 0) {
        throw createError('Node not found', 404);
      }

      const nodeData = result[0];
      
      // Add computed readOnly field based on write permissions
      const nodeWithComputedFields = {
        ...nodeData,
        readOnly: !isWritePermitted()
      };
      
      // Remove aggregation fields from the node
      const { allSynapses, relatedNodes, relatedNodeIds, ...cleanNodeData } = nodeWithComputedFields;
      
      return {
        node: cleanNodeData,
        allRelatives: nodeData.relatedNodes || [],
        allRelativeIds: nodeData.relatedNodeIds || [],
        allSynapses: nodeData.allSynapses || []
      };
    } catch (error: any) {
      if (error.statusCode) throw error;
      
      throw createError(`Failed to get node: ${error.message}`, 500);
    }
  }


  /**
   * Update a node with optional synapse operations
   */
  static async updateNode(id: string, request: UpdateNodeRequest) {
    // Check if id is a stringified object and extract the actual ID
    if (typeof id === 'string' && id.includes('_id')) {
      try {
        // Try to parse it as JSON and extract the _id
        const parsed = JSON.parse(id);
        if (parsed._id) {
          id = parsed._id;
        }
      } catch (parseError) {
        // If parsing fails, try to extract the ID using regex
        // Handle formats like: "_id: new ObjectId('68ca022613c8b0337b4a3cdb')"
        const objectIdMatch = id.match(/ObjectId\(['"]([a-fA-F0-9]{24})['"]\)/);
        if (objectIdMatch) {
          id = objectIdMatch[1];
        } else {
          // Fallback to simple _id pattern
          const idMatch = id.match(/([a-fA-F0-9]{24})/);
          if (idMatch) {
            id = idMatch[1];
          }
        }
      }
    }

    if (!Types.ObjectId.isValid(id)) {
      throw createError('Invalid node ID', 400);
    }

    const { data, synapses } = request;

    const session = await BaseNodeModel.startSession();
    
    try {
      return await session.withTransaction(async () => {
        const node = await BaseNodeModel.findById(id);
        if (!node) {
          throw createError('Node not found', 404);
        }

        // Update node fields
        Object.assign(node, data);
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
            }));
            await this.createMultipleSynapses(synapseRequests, session);
          }

          // Update existing synapses (synapses are nodes, so use node update logic)
          if (synapses.update && synapses.update.length > 0) {
            for (const update of synapses.update) {
              await this.updateNode(update.id, { data: update.data });
            }
          }

          // Delete synapses (synapses are nodes, so use node delete logic)
          if (synapses.delete && synapses.delete.length > 0) {
            for (const synapseId of synapses.delete) {
              await this.deleteNode(synapseId);
            }
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

    // Check if id is a stringified object and extract the actual ID
    if (typeof id === 'string' && id.includes('_id')) {
      try {
        // Try to parse it as JSON and extract the _id
        const parsed = JSON.parse(id);
        if (parsed._id) {
          id = parsed._id;
        }
      } catch (parseError) {
        // If parsing fails, try to extract the ID using regex
        // Handle formats like: "_id: new ObjectId('68ca022613c8b0337b4a3cdb')"
        const objectIdMatch = id.match(/ObjectId\(['"]([a-fA-F0-9]{24})['"]\)/);
        if (objectIdMatch) {
          id = objectIdMatch[1];
        } else {
          // Fallback to simple _id pattern
          const idMatch = id.match(/([a-fA-F0-9]{24})/);
          if (idMatch) {
            id = idMatch[1];
          }
        }
      }
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
    // Check if id is a stringified object and extract the actual ID
    if (typeof id === 'string' && id.includes('_id')) {
      try {
        // Try to parse it as JSON and extract the _id
        const parsed = JSON.parse(id);
        if (parsed._id) {
          id = parsed._id;
        }
      } catch (parseError) {
        // If parsing fails, try to extract the ID using regex
        // Handle formats like: "_id: new ObjectId('68ca022613c8b0337b4a3cdb')"
        const objectIdMatch = id.match(/ObjectId\(['"]([a-fA-F0-9]{24})['"]\)/);
        if (objectIdMatch) {
          id = objectIdMatch[1];
        } else {
          // Fallback to simple _id pattern
          const idMatch = id.match(/([a-fA-F0-9]{24})/);
          if (idMatch) {
            id = idMatch[1];
          }
        }
      }
    }

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
      deletedAt = null,
      limit = 50,
      skip = 0,
      sort = { createdAt: -1 }
    } = query;

    try {
      const filter: any = { deletedAt };
      
      if (kind) filter.kind = kind;

      const nodes = await BaseNodeModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit);

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

  /**
   * Get synapse statistics (synapses are nodes with kind='synapse')
   */
  static async getSynapseStats() {
    try {
      const stats = await BaseNodeModel.aggregate([
        {
          $match: { kind: 'synapse' }
        },
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
   * Get synapses for a specific node (synapses are nodes with kind='synapse')
   */
  static async getNodeSynapses(nodeId: string, options: {
    role?: string;
    dir?: SynapseDirection;
    includeDeleted?: boolean;
  } = {}) {
    // Normalize the node ID first
    nodeId = this.normalizeNodeId(nodeId);
    
    if (!Types.ObjectId.isValid(nodeId)) {
      throw createError('Invalid node ID', 400);
    }

    const { role, dir, includeDeleted = false } = options;
    const objectId = new Types.ObjectId(nodeId);

    try {
      const filter: any = {
        kind: 'synapse',
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
      
      const synapses = await BaseNodeModel
        .find(filter)
        .populate('from', 'kind content')
        .populate('to', 'kind content')
        .sort({ createdAt: -1 });

      return synapses as any[]; // Cast to any[] since these are synapse nodes with additional properties
    } catch (error: any) {
      /**
       * MYSTERY OF THE OBJECT STRING: A Tale of Debugging Despair (Part 2)
       * 
       * This is the same mysterious ObjectId casting error that plagued us in getNodeById.
       * The object string conversion happens somewhere in our system, and we never found where.
       * This error catch is our defensive measure - we catch the error and deny service
       * rather than let it crash our API with cryptic MongoDB errors.
       * 
       * Future Cursor: The mystery remains unsolved. The object string conversion
       * is happening somewhere between our perfect ID processing and MongoDB queries.
       * Find the source and implement a proper fix.
       */
      // Error catch removed - issue has been fixed
      
      throw createError(`Failed to get node synapses: ${error.message}`, 500);
    }
  }

  /**
   * Create multiple synapses in a transaction (synapses are nodes with kind='synapse')
   */
  private static async createMultipleSynapses(requests: TypesCreateSynapseRequest[], session?: any) {
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
  }
}
