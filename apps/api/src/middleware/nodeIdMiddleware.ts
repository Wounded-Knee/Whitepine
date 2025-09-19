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
  type NodeIdEncodingConfig
} from '@whitepine/types';


/**
 * Default configuration for node ID encoding
 * Maps node types (discriminators) to their ObjectID fields
 */
export const DEFAULT_NODE_ID_CONFIG: NodeIdEncodingConfig = {
  // Base fields that all nodes have
  '*': ['_id'],
  
  // SynapseNode specific fields
  [NODE_TYPES.SYNAPSE]: ['_id', 'from', 'to'],
};

/**
 * Middleware to decode node IDs from URL parameters
 * Automatically converts encoded node IDs in req.params back to ObjectIDs
 * for database operations
 */
export function decodeNodeIdParams(req: Request, res: Response, next: NextFunction) {
  try {
    console.log('[MIDDLEWARE] decodeNodeIdParams middleware called');
    console.log('[MIDDLEWARE] req.params:', req.params);
    
    // Decode any node IDs in the params
    const decodedParams = { ...req.params };
    
    for (const [key, value] of Object.entries(req.params)) {
      console.log(`[MIDDLEWARE] decodeNodeIdParams: processing ${key} = ${value} (type: ${typeof value})`);
      if (typeof value === 'string' && isValidEncodedNodeId(value)) {
        console.log(`[MIDDLEWARE] decodeNodeIdParams: decoding ${key} = ${value}`);
        decodedParams[key] = decodeNodeId(value).toString();
        console.log(`[MIDDLEWARE] decodeNodeIdParams: decoded ${key} = ${decodedParams[key]}`);
      } else {
        console.log(`[MIDDLEWARE] decodeNodeIdParams: not decoding ${key} = ${value} (isValid: ${isValidEncodedNodeId(value)})`);
      }
    }
    
    req.params = decodedParams;
    console.log('[MIDDLEWARE] decodeNodeIdParams: final params:', req.params);
    next();
  } catch (error) {
    console.log('decodeNodeIdParams error:', error);
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
export function encodeNodeIdResponseByType(config: NodeIdEncodingConfig = DEFAULT_NODE_ID_CONFIG) {
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
 * Useful for custom response handling
 */
export function encodeNodeResponse<T extends { _id: Types.ObjectId }>(node: T): T & { _id: string } {
  return {
    ...node,
    _id: encodeNodeId(node._id as string | Types.ObjectId)
  };
}

/**
 * Utility function to manually encode multiple nodes' _id fields
 * Useful for custom response handling
 */
export function encodeNodesResponse<T extends { _id: Types.ObjectId }>(nodes: T[]): (T & { _id: string })[] {
  return nodes.map(encodeNodeResponse);
}

