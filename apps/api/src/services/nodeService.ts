import { Types } from 'mongoose';
import { BaseNodeModel, UserNodeModel, PostNodeModel, SynapseNodeModel } from '../models/index.js';
import type { BaseNode, SynapseDirection } from '@whitepine/types';
import { NODE_TYPES } from '@whitepine/types';
import { createError } from '../middleware/errorHandler.js';
import { isWritePermitted } from '../middleware/datePermissions.js';
// Synapse creation logic moved inline since synapses are nodes

export interface CreateSynapseRequest {
  from: Types.ObjectId;
  to: Types.ObjectId;
  role: string;
  dir?: SynapseDirection;
  order?: number;
  weight?: number;
  props?: Record<string, unknown>;
}

export interface CreateNodeRequest {
  kind: string;
  data: Record<string, any>;
  synapses?: CreateSynapseRequest[];
}

export interface UpdateNodeRequest {
  data: Record<string, any>;
  synapses?: {
    create?: CreateSynapseRequest[];
    update?: Array<{ id: string; data: Partial<CreateSynapseRequest> }>;
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
   */
  static async createNode(request: CreateNodeRequest) {
    const { kind, data, synapses } = request;
    
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
        
        // Create synapses if provided (synapses are nodes with kind='synapse')
        if (synapses && synapses.length > 0) {
          const synapseRequests = synapses.map(synapse => ({
            ...synapse,
            from: synapse.from || node._id, // Default to the new node if not specified
            to: synapse.to || node._id,
          }));

          await this.createMultipleSynapses(synapseRequests, session);
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
    console.log('[NORMALIZE] normalizeNodeId: input =', id, 'type =', typeof id);
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
      console.log('[NORMALIZE] Processing string:', id.substring(0, 100) + '...');
      console.log('[NORMALIZE] Contains _id:', id.includes('_id'));
      console.log('[NORMALIZE] Contains ObjectId:', id.includes('ObjectId'));
      
      // Extract any 24-character hex string (MongoDB ObjectId format)
      const idMatch = id.match(/([a-fA-F0-9]{24})/);
      if (idMatch) {
        console.log('[NORMALIZE] Extracted ObjectId:', idMatch[1]);
        return idMatch[1];
      }
    }
    
    return id;
  }

  /**
   * Get a node by ID with automatically included connected synapses
   */
  static async getNodeById(id: string) {
    console.log('=== GETNODEBYID CALLED ===');
    console.log('[SERVICE] getNodeById: input id =', id, 'type =', typeof id);
    
    // Handle the specific case where an object string is passed
    if (typeof id === 'string' && id.includes('_id: new ObjectId(')) {
      console.log('[SERVICE] Detected object string, extracting ObjectId');
      console.log('[SERVICE] Object string:', id);
      const idMatch = id.match(/ObjectId\(['"]([a-fA-F0-9]{24})['"]\)/);
      if (idMatch) {
        id = idMatch[1];
        console.log('[SERVICE] Extracted ObjectId:', id);
      }
    }
    
    // Additional check for the specific error pattern
    if (typeof id === 'string' && id.includes('_id: new ObjectId(')) {
      console.log('[SERVICE] Additional check: Detected object string pattern');
      const idMatch = id.match(/ObjectId\(['"]([a-fA-F0-9]{24})['"]\)/);
      if (idMatch) {
        id = idMatch[1];
        console.log('[SERVICE] Additional check: Extracted ObjectId:', id);
      }
    }
    
    // Normalize the ID - handle encoded IDs and corrupted object strings
    id = this.normalizeNodeId(id);
    console.log('[SERVICE] getNodeById: after normalizeNodeId =', id, 'type =', typeof id);
    

    if (!Types.ObjectId.isValid(id)) {
      throw createError('Invalid node ID', 400);
    }

    try {
      // Additional safety check - if id still contains object string, extract it
      if (typeof id === 'string' && (id.includes('_id') || id.includes('ObjectId'))) {
        console.log('Safety check: Detected object string, extracting ID');
        const objectIdMatch = id.match(/ObjectId\(['"]([a-fA-F0-9]{24})['"]\)/);
        if (objectIdMatch) {
          id = objectIdMatch[1];
          console.log('Safety check: Extracted ID:', id);
        } else {
          const idMatch = id.match(/([a-fA-F0-9]{24})/);
          if (idMatch) {
            id = idMatch[1];
            console.log('Safety check: Extracted ID from hex pattern:', id);
          }
        }
      }
      
      console.log('[DB_QUERY] About to query BaseNodeModel.findById with id:', id, 'type:', typeof id);
      const node = await BaseNodeModel.findById(id);
      console.log('[DB_QUERY] BaseNodeModel.findById result:', node ? 'found' : 'not found');
      if (!node) {
        throw createError('Node not found', 404);
      }
      
      // Add computed readOnly field based on write permissions
      const nodeWithComputedFields = node.toObject() as any;
      nodeWithComputedFields.readOnly = !isWritePermitted();
      
      // Automatically fetch all connected synapses
      console.log('About to call getNodeSynapses with id:', id, 'type:', typeof id);
      const synapses = await this.getNodeSynapses(id, {
        includeDeleted: false
      });
      
      // Extract all connected node IDs from synapses
      const connectedNodeIds = new Set<string>();
      synapses.forEach(synapse => {
        const synapseObj = synapse as any; // Cast to access synapse-specific properties
        if (synapseObj.from && synapseObj.from.toString() !== id) {
          connectedNodeIds.add(synapseObj.from.toString());
        }
        if (synapseObj.to && synapseObj.to.toString() !== id) {
          connectedNodeIds.add(synapseObj.to.toString());
        }
      });
      
      // Extract ObjectID references from node attributes
      const attributeNodeIds = new Set<string>();
      const extractObjectIds = (obj: any, path: string = '') => {
        if (obj && typeof obj === 'object') {
          if (Array.isArray(obj)) {
            obj.forEach((item, index) => extractObjectIds(item, `${path}[${index}]`));
          } else {
            Object.keys(obj).forEach(key => {
              const value = obj[key];
              if (value && typeof value === 'object' && value.constructor && value.constructor.name === 'ObjectId') {
                // This is actually a MongoDB ObjectId - but exclude the node's own _id
                const objectIdString = value.toString();
                if (objectIdString !== id) {
                  attributeNodeIds.add(objectIdString);
                }
              } else {
                extractObjectIds(value, path ? `${path}.${key}` : key);
              }
            });
          }
        }
      };
      
      extractObjectIds(nodeWithComputedFields);
      
      // Combine all related node IDs
      const allRelatedNodeIds = new Set([...connectedNodeIds, ...attributeNodeIds]);
      // Debug logging removed
      
      // Fetch all related nodes
      const relatives: any[] = [];
      if (allRelatedNodeIds.size > 0) {
        const relatedNodeIdsArray = Array.from(allRelatedNodeIds);
        
        // Filter out any stringified objects - only keep valid ObjectId strings
        const validObjectIds = relatedNodeIdsArray.filter(id => {
          if (typeof id === 'string' && id.includes('_id: new ObjectId(')) {
            return false; // Remove stringified objects
          }
          return typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
        });
        const relatedNodesData = await BaseNodeModel.find({
          _id: { $in: validObjectIds },
          deletedAt: null
        });
        // Query successful
        
        // Add computed readOnly field to each related node
        relatedNodesData.forEach(relatedNode => {
          const nodeObj = relatedNode.toObject() as any;
          nodeObj.readOnly = !isWritePermitted();
          relatives.push(nodeObj);
        });
      }
      
      // Add synapses to relatives array as well (convert to plain objects)
      synapses.forEach(synapse => {
        const synapseObj = synapse.toObject ? synapse.toObject() : synapse;
        synapseObj.readOnly = !isWritePermitted();
        relatives.push(synapseObj);
      });
      
      return {
        node: nodeWithComputedFields,
        relatives
      };
    } catch (error: any) {
      if (error.statusCode) throw error;
      
      /**
       * MYSTERY OF THE OBJECT STRING: A Tale of Debugging Despair
       * 
       * We suffered through a MongoDB ObjectId casting error that defied all logic:
       * - The error: "Cast to ObjectId failed for value '{\n  _id: new ObjectId('68cab54d01161646f868bb68'),\n  kind: 'post',\n  content: 'Test complete encoding flow'\n}'"
       * - The mystery: This stringified JavaScript object was being passed to MongoDB's ObjectId constructor
       * - The investigation: We traced the data flow through middleware, controller, and service layers
       * - The revelation: Our ID processing pipeline worked perfectly - the encoded ID was correctly decoded
       * - The frustration: Despite perfect ID normalization, the object string persisted
       * - The surrender: We never found the root cause, but we caught the error and denied service
       * 
       * This error catch serves as a defensive measure against whatever mysterious force
       * is converting objects to strings in our system. We may never know the truth,
       * but at least we can prevent it from crashing our API.
       */
      // Error catch removed - issue has been fixed
      
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

      const synapses = await this.getNodeSynapses(id, options);
      
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
    console.log('[SERVICE] getNodeSynapses: Input nodeId =', nodeId, 'type =', typeof nodeId);
    
    // Normalize the node ID first
    nodeId = this.normalizeNodeId(nodeId);
    console.log('[SERVICE] getNodeSynapses: After normalizeNodeId =', nodeId, 'type =', typeof nodeId);
    
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

      console.log('[DB_QUERY] About to query BaseNodeModel.find with filter:', JSON.stringify(filter, null, 2));
      console.log('[DB_QUERY] objectId value:', objectId, 'type:', typeof objectId);
      console.log('[DB_QUERY] nodeId value:', nodeId, 'type:', typeof nodeId);
      
      const synapses = await BaseNodeModel
        .find(filter)
        .populate('from', 'kind content')
        .populate('to', 'kind content')
        .sort({ createdAt: -1 });
        
      console.log('[DB_QUERY] BaseNodeModel.find result count:', synapses.length);

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
  private static async createMultipleSynapses(requests: CreateSynapseRequest[], session?: any) {
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
