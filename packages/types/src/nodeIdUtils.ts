/**
 * Node ID Utilities for Response Encoding
 * 
 * This module provides utilities for encoding node IDs in API responses
 * and handling object field encoding/decoding.
 */

import { Types } from 'mongoose';
import { 
  encodeNodeId, 
  decodeNodeId, 
  isValidEncodedNodeId,
  encodeObjectIds,
  decodeObjectIds 
} from './nodeId';

/**
 * Encodes a single node response by encoding ObjectID fields
 * @param node - The node object to encode
 * @param fieldsToEncode - Array of field names that contain ObjectIDs
 * @returns The encoded node object
 */
export function encodeNodeResponse(node: any, fieldsToEncode: string[] = ['_id']): any {
  if (!node || typeof node !== 'object') {
    return node;
  }

  return encodeObjectIds(node, fieldsToEncode);
}

/**
 * Encodes an array of node responses
 * @param nodes - Array of node objects to encode
 * @param fieldsToEncode - Array of field names that contain ObjectIDs
 * @returns Array of encoded node objects
 */
export function encodeNodesResponse(nodes: any[], fieldsToEncode: string[] = ['_id']): any[] {
  if (!Array.isArray(nodes)) {
    return nodes;
  }

  return nodes.map(node => encodeNodeResponse(node, fieldsToEncode));
}

/**
 * Encodes specific object fields that contain ObjectIDs
 * @param obj - The object to encode
 * @param fields - Array of field names to encode
 * @returns New object with encoded fields
 */
export function encodeObjectFields(obj: any, fields: string[]): any {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const result = { ...obj };
  
  for (const field of fields) {
    if (result[field] !== undefined) {
      if (Types.ObjectId.isValid(result[field])) {
        result[field] = encodeNodeId(result[field]);
      } else if (Array.isArray(result[field])) {
        result[field] = result[field].map((item: any) => 
          Types.ObjectId.isValid(item) ? encodeNodeId(item) : item
        );
      }
    }
  }
  
  return result;
}

/**
 * Decodes specific object fields that contain encoded node IDs
 * @param obj - The object to decode
 * @param fields - Array of field names to decode
 * @returns New object with decoded fields
 */
export function decodeObjectFields(obj: any, fields: string[]): any {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const result = { ...obj };
  
  for (const field of fields) {
    if (result[field] !== undefined) {
      if (typeof result[field] === 'string' && isValidEncodedNodeId(result[field])) {
        result[field] = decodeNodeId(result[field]);
      } else if (Array.isArray(result[field])) {
        result[field] = result[field].map((item: any) => 
          typeof item === 'string' && isValidEncodedNodeId(item) ? decodeNodeId(item) : item
        );
      }
    }
  }
  
  return result;
}