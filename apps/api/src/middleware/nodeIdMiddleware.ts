/**
 * Node ID Middleware for Express.js
 * 
 * This module provides middleware functions for automatically handling
 * node ID encoding/decoding in Express.js applications.
 */

import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { NODE_TYPES, discriminatorKey } from '@whitepine/types';
import { 
  encodeNodeId, 
  decodeNodeId, 
  isValidEncodedNodeId, 
  normalizeToObjectId,
  encodeObjectIds,
  decodeObjectIds,
  type NodeIdEncodingConfig,
  BASE_NODE_CONFIG,
  USER_NODE_CONFIG,
  POST_NODE_CONFIG,
  SYNAPSE_NODE_CONFIG
} from '@whitepine/types';


/**
 * Helper function to extract ID fields from node configs based on viewSchema.id property
 */
function getNodeIdFieldsFromConfig(nodeType: string): string[] {
  const nodeConfigs = {
    [NODE_TYPES.BASE]: BASE_NODE_CONFIG,
    [NODE_TYPES.USER]: USER_NODE_CONFIG,
    [NODE_TYPES.POST]: POST_NODE_CONFIG,
    [NODE_TYPES.SYNAPSE]: SYNAPSE_NODE_CONFIG,
  };

  const config = nodeConfigs[nodeType as keyof typeof nodeConfigs];
  if (!config || !(config as any).viewSchema) {
    return ['_id']; // Default fallback
  }

  const idFields: string[] = [];
  for (const [fieldName, fieldConfig] of Object.entries((config as any).viewSchema)) {
    if (fieldConfig && typeof fieldConfig === 'object' && 'id' in fieldConfig && fieldConfig.id === true) {
      idFields.push(fieldName);
    }
  }

  return idFields.length > 0 ? idFields : ['_id']; // Fallback to _id if no ID fields found
}

/**
 * Generate node ID configuration dynamically from node configs
 */
export function generateNodeIdConfig(): NodeIdEncodingConfig {
  const config: NodeIdEncodingConfig = {};
  
  // Get ID fields for each node type
  Object.values(NODE_TYPES).forEach(nodeType => {
    config[nodeType] = getNodeIdFieldsFromConfig(nodeType);
  });
  
  // Add wildcard fallback
  config['*'] = ['_id'];
  
  return config;
}

/**
 * Middleware to decode node IDs from URL parameters
 * Automatically converts encoded node IDs in req.params back to ObjectIDs
 * for database operations
 */
export function decodeNodeIdParams(req: Request, res: Response, next: NextFunction) {
  try {    
    // Decode any node IDs in the params
    const decodedParams = { ...req.params };
    
    for (const [key, value] of Object.entries(req.params)) {
      if (typeof value === 'string' && isValidEncodedNodeId(value)) {
        decodedParams[key] = decodeNodeId(value).toString();
      }
    }
    
    req.params = decodedParams;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware to decode node IDs from query parameters
 * Automatically converts encoded node IDs in req.query back to ObjectIDs
 * for database operations
 */
export function decodeNodeIdQuery(req: Request, res: Response, next: NextFunction) {
  try {
    // Decode any node IDs in the query
    const decodedQuery = { ...req.query };
    
    for (const [key, value] of Object.entries(req.query)) {
      if (typeof value === 'string' && isValidEncodedNodeId(value)) {
        decodedQuery[key] = decodeNodeId(value).toString();
      }
    }
    
    req.query = decodedQuery;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware to decode node IDs from request body
 * Automatically converts encoded node IDs in req.body back to ObjectIDs
 * for database operations
 */
export function decodeNodeIdBody(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.body && typeof req.body === 'object') {
      // Common fields that might contain node IDs
      const nodeIdFields = ['_id', 'id', 'from', 'to'];
      
      req.body = decodeObjectIds(req.body, nodeIdFields);
    }
    
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware to encode node IDs in response data
 * Automatically converts ObjectIDs in response data to encoded node IDs
 * for API responses
 */
export function encodeNodeIdResponse(req: Request, res: Response, next: NextFunction) {
  const originalJson = res.json;
  
  res.json = function(data: any) {
    if (data && typeof data === 'object') {
      // Encode node IDs in the response
      data = encodeResponseNodeIds(data);
    }
    
    return originalJson.call(this, data);
  };
  
  next();
}

/**
 * Conservative middleware that only encodes specific known ObjectID fields
 * Use this if you want more control over which fields get encoded
 */
export function encodeNodeIdResponseConservative(req: Request, res: Response, next: NextFunction) {
  const originalJson = res.json;
  
  // Fields that are known to contain ObjectIDs
  const objectIdFields = ['_id', 'id', 'from', 'to'];
  
  res.json = function(data: any) {
    if (data && typeof data === 'object') {
      // Only encode specific fields that we know contain ObjectIDs
      data = encodeObjectIds(data, objectIdFields);
    }
    
    return originalJson.call(this, data);
  };
  
  next();
}

/**
 * Advanced middleware that encodes ObjectID fields based on node type configuration
 * @param config - Configuration mapping node types to their ObjectID fields
 */
export function encodeNodeIdResponseByType(config: NodeIdEncodingConfig = generateNodeIdConfig()) {
  return function(req: Request, res: Response, next: NextFunction) {
    const originalJson = res.json;
    
    res.json = function(data: any) {
      if (data && typeof data === 'object') {
        // Encode based on node type configuration
        data = encodeResponseNodeIdsByType(data, config);
      }
      
      return originalJson.call(this, data);
    };
    
    next();
  };
}

/**
 * Helper function to check if a value is a valid ObjectID that should be encoded
 */
function isEncodableObjectId(value: any): boolean {
  // Must be a string or ObjectId instance
  if (!value) return false;
  
  // Check if it's an ObjectId instance
  if (value instanceof Types.ObjectId) {
    return true;
  }
  
  // Check if it's a string that looks like an ObjectID
  if (typeof value === 'string') {
    // Must be exactly 24 characters (MongoDB ObjectID length)
    if (value.length !== 24) return false;
    
    // Must be valid hex
    if (!Types.ObjectId.isValid(value)) return false;
    
    // Additional check: must contain only hex characters
    if (!/^[0-9a-fA-F]{24}$/.test(value)) return false;
    
    return true;
  }
  
  return false;
}

/**
 * Recursively encodes ObjectIDs in response data
 */
function encodeResponseNodeIds(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(encodeResponseNodeIds);
  }
  
  // Handle objects
  const result: any = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (isEncodableObjectId(value)) {
      // This is a valid ObjectID, encode it
      result[key] = encodeNodeId(value as string | Types.ObjectId);
    } else if (value && typeof value === 'object') {
      // Recursively process nested objects
      result[key] = encodeResponseNodeIds(value);
    } else {
      result[key] = value;
    }
  }
  
  return result;
}

/**
 * Recursively encodes ObjectIDs in response data based on node type configuration
 */
function encodeResponseNodeIdsByType(data: any, config: NodeIdEncodingConfig): any {
  if (!data || typeof data !== 'object') {
    return data;
  }
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => encodeResponseNodeIdsByType(item, config));
  }
  
  // Handle objects
  const result: any = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      // This is an object, check if it's a node with a discriminator
      const nodeType = (value as any).kind || (value as any).type || (value as any).discriminator;
      const fieldsToEncode = getFieldsToEncode(nodeType, config);
      
      if (fieldsToEncode.length > 0) {
        // This looks like a node, encode its ObjectID fields
        result[key] = encodeObjectIds(value, fieldsToEncode as any);
      } else {
        // Not a node or no fields to encode, recursively process
        result[key] = encodeResponseNodeIdsByType(value, config);
      }
    } else if (value && Array.isArray(value)) {
      // Handle arrays of objects
      result[key] = value.map(item => 
        typeof item === 'object' ? encodeResponseNodeIdsByType(item, config) : item
      );
    } else {
      result[key] = value;
    }
  }
  
  return result;
}

/**
 * Get the fields to encode for a given node type
 */
function getFieldsToEncode(nodeType: string | undefined, config: NodeIdEncodingConfig): string[] {
  if (!nodeType) {
    return config['*'] || [];
  }
  
  // Check for specific node type configuration
  if (config[nodeType]) {
    return config[nodeType];
  }
  
  // Fall back to wildcard configuration
  return config['*'] || [];
}

/**
 * Combined middleware that handles both request decoding and response encoding
 * Use this for routes that need full node ID transformation
 */
export function nodeIdMiddleware(req: Request, res: Response, next: NextFunction) {
  // First decode incoming IDs
  decodeNodeIdParams(req, res, (err: any) => {
    if (err) return next(err);
    
    decodeNodeIdQuery(req, res, (err: any) => {
      if (err) return next(err);
      
      decodeNodeIdBody(req, res, (err: any) => {
        if (err) return next(err);
        
        // Then encode outgoing IDs
        encodeNodeIdResponse(req, res, next);
      });
    });
  });
}

/**
 * Utility function to manually encode a node's _id field
 * For synapse nodes, also encodes the from and to fields
 * Useful for custom response handling
 */
export function encodeNodeResponse<T extends { _id: Types.ObjectId; kind?: string }>(node: T): T & { _id: string } {
  // Helper function to convert buffer objects to ObjectId
  const convertToObjectId = (value: any): Types.ObjectId => {
    if (value && typeof value === 'object' && value.buffer && value.buffer.type === 'Buffer') {
      // This is a buffer object, convert to ObjectId
      return new Types.ObjectId(Buffer.from(value.buffer.data));
    }
    return value;
  };

  const encoded = {
    ...node,
    _id: encodeNodeId(convertToObjectId(node._id))
  };

  // Handle synapse nodes - encode from and to fields as well
  if (node.kind === 'synapse' && 'from' in node && 'to' in node) {
    const synapseNode = node as T & { from: any; to: any };
    return {
      ...encoded,
      from: encodeNodeId(convertToObjectId(synapseNode.from)),
      to: encodeNodeId(convertToObjectId(synapseNode.to))
    } as T & { _id: string; from: string; to: string };
  }

  return encoded;
}

/**
 * Utility function to manually encode multiple nodes' _id fields
 * Useful for custom response handling
 */
export function encodeNodesResponse<T extends { _id: Types.ObjectId }>(nodes: T[]): (T & { _id: string })[] {
  return nodes.map(encodeNodeResponse);
}

