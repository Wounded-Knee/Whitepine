/**
 * Node ID Encoding/Decoding Utilities
 * 
 * This module provides functions to encode MongoDB ObjectIDs into branded, URL-safe
 * node IDs for use in APIs and UI, while maintaining the ability to decode them
 * back to ObjectIDs for database operations.
 * 
 * The encoding uses base64url encoding with a custom prefix to brand the IDs.
 */

import { Types } from 'mongoose';

// Brand prefix for node IDs - makes them easily identifiable
const NODE_ID_PREFIX = 'wp_';

/**
 * Encodes a MongoDB ObjectID to a branded, URL-safe string
 * @param objectId - The MongoDB ObjectID to encode
 * @returns A branded, URL-safe node ID string
 */
export function encodeNodeId(objectId: Types.ObjectId | string): string {
  // Convert to string if it's an ObjectId
  const idString = typeof objectId === 'string' ? objectId : objectId.toString();
  
  // Validate that it's a valid ObjectID format
  if (!Types.ObjectId.isValid(idString)) {
    throw new Error(`Invalid ObjectID: ${idString}`);
  }
  
  // Convert hex string to buffer, then to base64url
  const buffer = Buffer.from(idString, 'hex');
  const base64url = buffer.toString('base64url');
  
  // Add our brand prefix
  return `${NODE_ID_PREFIX}${base64url}`;
}

/**
 * Decodes a branded node ID back to a MongoDB ObjectID
 * @param encodedId - The branded node ID string to decode
 * @returns A MongoDB ObjectID
 */
export function decodeNodeId(encodedId: string): Types.ObjectId {
  // Remove the brand prefix
  if (!encodedId.startsWith(NODE_ID_PREFIX)) {
    throw new Error(`Invalid node ID format: ${encodedId}. Expected prefix: ${NODE_ID_PREFIX}`);
  }
  
  const base64url = encodedId.slice(NODE_ID_PREFIX.length);
  
  try {
    // Convert base64url back to buffer, then to hex string
    const buffer = Buffer.from(base64url, 'base64url');
    const hexString = buffer.toString('hex');
    
    // Validate and create ObjectID
    if (!Types.ObjectId.isValid(hexString)) {
      throw new Error(`Decoded string is not a valid ObjectID: ${hexString}`);
    }
    
    return new Types.ObjectId(hexString);
  } catch (error) {
    throw new Error(`Failed to decode node ID: ${encodedId}. ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Checks if a string is a valid encoded node ID
 * @param id - The string to check
 * @returns True if the string is a valid encoded node ID
 */
export function isValidEncodedNodeId(id: string): boolean {
  try {
    decodeNodeId(id);
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if a string is a raw MongoDB ObjectID (24 hex characters)
 * @param id - The string to check
 * @returns True if the string is a raw ObjectID
 */
export function isRawObjectId(id: string): boolean {
  return Types.ObjectId.isValid(id) && id.length === 24;
}

/**
 * Normalizes an ID - if it's a raw ObjectID, encodes it; if it's already encoded, returns as-is
 * @param id - The ID to normalize
 * @returns An encoded node ID string
 */
export function normalizeToEncodedId(id: string | Types.ObjectId): string {
  if (typeof id === 'string' && id.startsWith(NODE_ID_PREFIX)) {
    // Already encoded
    return id;
  }
  
  // Treat as raw ObjectID and encode
  return encodeNodeId(id);
}

/**
 * Normalizes an ID - if it's encoded, decodes it; if it's already raw, returns as ObjectID
 * @param id - The ID to normalize
 * @returns A MongoDB ObjectID
 */
export function normalizeToObjectId(id: string): Types.ObjectId {
  if (id.startsWith(NODE_ID_PREFIX)) {
    // Encoded, decode it
    return decodeNodeId(id);
  }
  
  // Treat as raw ObjectID
  if (!Types.ObjectId.isValid(id)) {
    throw new Error(`Invalid ID format: ${id}`);
  }
  
  return new Types.ObjectId(id);
}

/**
 * Transforms an object by encoding all ObjectID fields to branded node IDs
 * @param obj - The object to transform
 * @param objectIdFields - Array of field names that contain ObjectIDs
 * @returns A new object with ObjectID fields encoded
 */
export function encodeObjectIds<T extends Record<string, any>>(
  obj: T, 
  objectIdFields: (keyof T)[]
): T {
  const result = { ...obj };
  
  for (const field of objectIdFields) {
    if (result[field]) {
      // Handle ObjectID objects (from MongoDB)
      if (result[field] instanceof Types.ObjectId) {
        result[field] = encodeNodeId(result[field]) as any;
      }
      // Handle ObjectID strings
      else if (typeof result[field] === 'string' && Types.ObjectId.isValid(result[field])) {
        result[field] = encodeNodeId(result[field]) as any;
      }
      // Handle ObjectID-like objects with buffer property
      else if (result[field] && typeof result[field] === 'object' && result[field].buffer) {
        const objectId = new Types.ObjectId(result[field].buffer);
        result[field] = encodeNodeId(objectId) as any;
      }
    }
  }
  
  return result;
}

/**
 * Transforms an object by decoding all encoded node ID fields back to ObjectIDs
 * @param obj - The object to transform
 * @param nodeIdFields - Array of field names that contain encoded node IDs
 * @returns A new object with encoded node ID fields decoded
 */
export function decodeObjectIds<T extends Record<string, any>>(
  obj: T, 
  nodeIdFields: (keyof T)[]
): T {
  const result = { ...obj };
  
  for (const field of nodeIdFields) {
    if (result[field] && typeof result[field] === 'string' && result[field].startsWith(NODE_ID_PREFIX)) {
      result[field] = decodeNodeId(result[field]) as any;
    }
  }
  
  return result;
}
