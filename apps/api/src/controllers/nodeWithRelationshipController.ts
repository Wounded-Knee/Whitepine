import { Request, Response } from 'express';
import { NodeService } from '../services/nodeService.js';
import { createError } from '../middleware/errorHandler.js';
import { validateNodeCreation } from '../validation/nodeValidation.js';
import { Types } from 'mongoose';
import { validateRelationshipCreation } from '@whitepine/types';

// Define our user type
type AuthUser = {
  id: string;
  email?: string;
};

export class NodeWithRelationshipController {
  /**
   * Create a new node with a relationship (synapse) to an existing node
   */
  static async createNodeWithRelationship(req: Request, res: Response) {
    try {
      const { node: nodeData, synapse: synapseData } = req.body;

      if (!nodeData || !synapseData) {
        throw createError('Both node and synapse data are required', 400);
      }


      // Validate node data
      const validationResult = validateNodeCreation(nodeData);
      if (!validationResult.success) {
        throw createError(`Invalid node data: ${validationResult.error}`, 400);
      }

      // Validate synapse data
      if (!synapseData.role) {
        throw createError('Synapse role is required', 400);
      }

      if (!synapseData.from && !synapseData.to) {
        throw createError('Synapse must have either from or to node ID', 400);
      }

      // Get the source node to validate the relationship
      let sourceNodeId = synapseData.from || synapseData.to;
      if (!sourceNodeId) {
        throw createError('Source node ID is required', 400);
      }
      
      // Check if sourceNodeId is a stringified object and extract the actual ID
      if (typeof sourceNodeId === 'string' && sourceNodeId.includes('_id')) {
        try {
          // Try to parse it as JSON and extract the _id
          const parsed = JSON.parse(sourceNodeId);
          if (parsed._id) {
            sourceNodeId = parsed._id;
          }
        } catch (parseError) {
          // If parsing fails, try to extract the ID using regex
          const idMatch = sourceNodeId.match(/([a-f0-9]{24})/);
          if (idMatch) {
            sourceNodeId = idMatch[1];
          }
        }
      }
      
      // Validate the relationship configuration
      try {
        const sourceNode = await NodeService.getNodeById(sourceNodeId);
        
        if (!sourceNode || !sourceNode.node) {
          throw createError('Source node not found', 404);
        }

        // Validate the relationship configuration
        const relationshipValidation = validateRelationshipCreation(
          sourceNode.node.kind,
          nodeData.kind,
          synapseData.role,
          synapseData.dir || 'out'
        );
        
        if (!relationshipValidation.valid) {
          throw createError(`Invalid relationship: ${relationshipValidation.error}`, 400);
        }
      } catch (validationError) {
        if (validationError.statusCode) {
          throw validationError;
        }
        throw createError(`Relationship validation failed: ${validationError.message}`, 500);
      }

      // Handle publishing logic for posts
      if (nodeData.kind === 'post' && nodeData.publishImmediately) {
        nodeData.publishedAt = new Date();
      }
      // Remove the publishImmediately flag as it's not part of the node schema
      delete nodeData.publishImmediately;

      // Create the node first
      const createNodeRequest = {
        kind: nodeData.kind,
        data: nodeData
      };
      
      const newNode = await NodeService.createNode(createNodeRequest);

      // Create the synapse connecting the new node to the existing node
      const synapse = {
        from: synapseData.from ? new Types.ObjectId(synapseData.from) : new Types.ObjectId(newNode._id),
        to: synapseData.to ? new Types.ObjectId(synapseData.to) : new Types.ObjectId(newNode._id),
        role: synapseData.role,
        dir: synapseData.dir || 'out',
        props: synapseData.props || {}
      };

      const newSynapse = await NodeService.createNode({
        kind: 'synapse',
        data: synapse
      });

      // Return both the new node and synapse
      res.status(201).json({
        success: true,
        data: {
          node: newNode,
          synapse: newSynapse
        }
      });

    } catch (error: any) {
      console.error('Error creating node with relationship:', error);
      
      if (error.statusCode) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        });
      }
    }
  }

  /**
   * Create multiple nodes with relationships in a batch
   */
  static async createNodesWithRelationships(req: Request, res: Response) {
    try {
      const { relationships } = req.body;

      if (!Array.isArray(relationships)) {
        throw createError('Relationships must be an array', 400);
      }

      const results = [];

      for (const { node: nodeData, synapse: synapseData } of relationships) {
        // Validate node data
        const validationResult = validateNodeCreation(nodeData);
        if (!validationResult.success) {
          throw createError(`Invalid node data: ${validationResult.error}`, 400);
        }

        // Create the node
        const createNodeRequest = {
          kind: nodeData.kind,
          data: nodeData
        };
        
        const newNode = await NodeService.createNode(createNodeRequest);

        // Create the synapse
        const synapse = {
          from: synapseData.from ? new Types.ObjectId(synapseData.from) : new Types.ObjectId(newNode._id),
          to: synapseData.to ? new Types.ObjectId(synapseData.to) : new Types.ObjectId(newNode._id),
          role: synapseData.role,
          dir: synapseData.dir || 'out',
          props: synapseData.props || {}
        };

        const newSynapse = await NodeService.createNode({
          kind: 'synapse',
          data: synapse
        });

        results.push({
          node: newNode,
          synapse: newSynapse
        });
      }

      res.status(201).json({
        success: true,
        data: results
      });

    } catch (error: any) {
      console.error('Error creating nodes with relationships:', error);
      
      if (error.statusCode) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        });
      }
    }
  }
}
