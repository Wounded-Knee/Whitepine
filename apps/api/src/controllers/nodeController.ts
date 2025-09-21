import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { NodeService } from '../services/nodeService.js';
import { createError } from '../middleware/errorHandler.js';
import type { ApiResponse, PaginationParams } from '@whitepine/types';
import { encodeNodeResponse, encodeNodesResponse, decodeNodeId, encodeNodeId } from '@whitepine/types';

// Define our user type
type AuthUser = {
  id: string;
  email?: string;
  name?: string;
  picture?: string;
  provider?: string;
};

export class NodeController {
  /**
   * Create a new node
   * POST /api/nodes
   */
  static async createNode(req: Request, res: Response, next: NextFunction) {
    try {
      const { kind, ...data } = req.body;
      const userId = (req.user as AuthUser)?.id;


      if (!kind) {
        throw createError('Node kind is required', 400);
      }

      const node = await NodeService.createNode({
        kind,
        data,
        userId, // Pass the authenticated user ID for automatic authorship synapse
      });

      const response: ApiResponse = {
        success: true,
        data: encodeNodeResponse(node.toObject()),
        message: 'Node created successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a node by ID with automatically included connected synapses and nodes
   * GET /api/nodes/:id
   */
  static async getNode(req: Request, res: Response, next: NextFunction) {
    try {
      let { id } = req.params;
      
      // Safety check: extract ObjectId from corrupted object strings
      if (typeof id === 'string' && (id.includes('_id') || id.includes('ObjectId'))) {
        const idMatch = id.match(/([a-fA-F0-9]{24})/);
        if (idMatch) {
          id = idMatch[1];
        }
      }
      
      const result = await NodeService.getNodeById(id);

      // Encode the node and relatives first
      const encodedNode = encodeNodeResponse(result.node);
      const encodedRelatives = encodeNodesResponse(result.allRelatives);
      
      // Build relativesByRole mapping using encoded IDs
      const relativesByRole: Record<string, Record<string, string[]>> = {};
      
      if (result.allSynapses && result.allSynapses.length > 0) {
        result.allSynapses.forEach((synapse: any) => {
          const role = synapse.role;
          const dir = synapse.dir;
          
          if (!relativesByRole[role]) {
            relativesByRole[role] = {};
          }
          if (!relativesByRole[role][dir]) {
            relativesByRole[role][dir] = [];
          }
          
          // Add the related node ID (either from or to, whichever is not the current node)
          const relatedRawId = synapse.from.toString() === id ? synapse.to.toString() : synapse.from.toString();
          
          // Find the corresponding relative node and use its encoded ID
          const relative = result.allRelatives?.find((rel: any) => {
            return rel._id?.toString() === relatedRawId;
          });
          
          if (relative && relative._id) {
            const encodedId = encodeNodeId(relative._id);
            if (!relativesByRole[role][dir].includes(encodedId)) {
              relativesByRole[role][dir].push(encodedId);
            }
          }
        });
      }
      
      // Encode the allRelativeIds array
      const encodedRelativeIds = result.allRelativeIds?.map((id: any) => encodeNodeId(id)) || [];

      const response: ApiResponse = {
        success: true,
        data: {
          node: encodedNode,
          allRelatives: encodedRelatives,
          allRelativeIds: encodedRelativeIds,
          relativesByRole: relativesByRole
        },
        message: 'Node retrieved with connected synapses and nodes',
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
      const userId = (req.user as AuthUser)?.id;
      const decodedId = decodeNodeId(id);

      const node = await NodeService.updateNode(decodedId.toString(), {
        data: req.body,
      });

      const response: ApiResponse = {
        success: true,
        data: encodeNodeResponse(node.toObject()),
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
      const decodedId = decodeNodeId(id);
      const result = await NodeService.deleteNode(decodedId.toString());

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
      const decodedId = decodeNodeId(id);
      const node = await NodeService.restoreNode(decodedId.toString());

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
        ...(kind && { kind: kind as string }),
        deletedAt: includeDeleted === 'true' ? undefined : null,
        limit: limitNum,
        skip: skipNum,
        sort: { [sortBy as string]: sortOrderNum } as Record<string, 1 | -1>,
      };

      const result = await NodeService.listNodes(query);

      // Encode nodes with appropriate fields based on node type
      const encodedNodes = result.nodes.map((node: any) => {
        if (node.kind === 'synapse') {
          return encodeNodeResponse(node, ['_id', 'from', 'to']);
        }
        return encodeNodeResponse(node, ['_id']);
      });

      const response = {
        success: true,
        data: encodedNodes,
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
      const userId = (req.user as AuthUser)?.id;

      if (!operation || !nodeIds || !Array.isArray(nodeIds)) {
        throw createError('Invalid bulk operation request', 400);
      }

      const results = [];
      const errors = [];

      for (const nodeId of nodeIds) {
        try {
          const decodedId = decodeNodeId(nodeId);
          let result;
          switch (operation) {
            case 'delete':
              result = await NodeService.deleteNode(decodedId.toString());
              break;
            case 'restore':
              result = await NodeService.restoreNode(decodedId.toString());
              break;
            case 'update':
              if (!data) {
                throw createError('Data is required for update operation', 400);
              }
              result = await NodeService.updateNode(decodedId.toString(), {
                data,
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
          errorCount: errors.length,
          results,
          errors,
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get PostNodes that have no synapses connected to them
   * GET /api/nodes/isolated-posts
   */
  static async getIsolatedPostNodes(req: Request, res: Response, next: NextFunction) {
    try {
      const isolatedPostNodes = await NodeService.getIsolatedPostNodes();

      const response: ApiResponse = {
        success: true,
        data: encodeNodesResponse(isolatedPostNodes),
        message: 'Isolated post nodes retrieved successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // ===== SYNAPSE METHODS (synapses are nodes with kind='synapse') =====

  /**
   * List synapses (nodes with kind='synapse')
   * GET /api/nodes/synapses
   */
  static async listSynapses(req: Request, res: Response, next: NextFunction) {
    try {
      const { from, to, role, dir, includeDeleted = 'false' } = req.query;
      
      const query: any = {
        kind: 'synapse',
        deletedAt: includeDeleted === 'true' ? undefined : null
      };
      
      if (from) query.from = from;
      if (to) query.to = to;
      if (role) query.role = role;
      if (dir) query.dir = dir;

      const result = await NodeService.listNodes(query);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Synapses retrieved successfully',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get synapse statistics
   * GET /api/nodes/synapses/stats
   */
  static async getSynapseStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await NodeService.getSynapseStats();

      const response: ApiResponse = {
        success: true,
        data: stats,
        message: 'Synapse statistics retrieved successfully',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get synapses for a specific node
   * GET /api/nodes/synapses/node/:nodeId
   */
  static async getNodeSynapses(req: Request, res: Response, next: NextFunction) {
    try {
      const { nodeId } = req.params;
      const { role, dir, includeDeleted = 'false' } = req.query;

      const synapses = await NodeService.getNodeSynapses(nodeId, {
        role: role as string,
        dir: dir as any,
        includeDeleted: includeDeleted === 'true'
      });

      const response: ApiResponse = {
        success: true,
        data: synapses,
        message: 'Node synapses retrieved successfully',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}
