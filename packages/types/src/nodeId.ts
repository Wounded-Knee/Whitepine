/**
 * Node ID Encoding/Decoding Utilities
 * 
 * This module provides functions to encode MongoDB ObjectIDs into branded, URL-safe
 * node IDs for use in APIs and UI, while maintaining the ability to decode them
 * back to ObjectIDs for database operations.
 * 
 * The encoding uses base64url encoding with a custom prefix to brand the IDs.
 */

// Simple ObjectId-like interface for type safety without mongoose dependency
// This represents a MongoDB ObjectId object (not the string representation)
export interface MongoObjectId {
  toString(): string;
  toHexString(): string;
}

// Brand prefix for node IDs - makes them easily identifiable
const NODE_ID_PREFIX = 'wp_';

/**
 * Validate if a string is a valid MongoDB ObjectId (24 hex characters)
 */
function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Create an ObjectId-like object from a hex string
 */
function createObjectId(hexString: string): MongoObjectId {
  return {
    toString: () => hexString,
    toHexString: () => hexString,
  };
}

/**
 * Convert hex string to base64url
 */
function hexToBase64url(hex: string): string {
  // Convert hex to bytes
  const bytes = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substr(i, 2), 16));
  }
  
  // Convert bytes to base64 manually
  const base64 = bytesToBase64(bytes);
  
  // Convert base64 to base64url (replace + with -, / with _, remove padding)
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Convert base64url to hex string
 */
function base64urlToHex(base64url: string): string {
  // Convert base64url to base64 (replace - with +, _ with /, add padding)
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  
  // Convert base64 to bytes manually
  const bytes = base64ToBytes(base64);
  
  // Convert bytes to hex
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  
  return hex;
}

/**
 * Convert bytes array to base64 string
 */
function bytesToBase64(bytes: number[]): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const b = bytes[i + 1] || 0;
    const c = bytes[i + 2] || 0;
    
    const bitmap = (a << 16) | (b << 8) | c;
    
    result += chars.charAt((bitmap >> 18) & 63);
    result += chars.charAt((bitmap >> 12) & 63);
    result += i + 1 < bytes.length ? chars.charAt((bitmap >> 6) & 63) : '=';
    result += i + 2 < bytes.length ? chars.charAt(bitmap & 63) : '=';
  }
  
  return result;
}

/**
 * Convert base64 string to bytes array
 */
function base64ToBytes(base64: string): number[] {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const bytes: number[] = [];
  
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
  
  return bytes;
}

/**
 * Encodes a MongoDB ObjectID to a branded, URL-safe string
 * @param objectId - The MongoDB ObjectID to encode
 * @returns A branded, URL-safe node ID string
 */
export function encodeNodeId(objectId: MongoObjectId | string): string {
  // Convert to string if it's an ObjectId
  const idString = typeof objectId === 'string' ? objectId : objectId.toString();
  
  // Validate that it's a valid ObjectID format
  if (!isValidObjectId(idString)) {
    throw new Error(`Invalid ObjectID: ${idString}`);
  }
  
  // Convert hex string to base64url
  const base64url = hexToBase64url(idString);
  
  // Add our brand prefix
  return `${NODE_ID_PREFIX}${base64url}`;
}

/**
 * Decodes a branded node ID back to a MongoDB ObjectID
 * @param encodedId - The branded node ID string to decode
 * @returns A MongoDB ObjectID
 */
export function decodeNodeId(encodedId: string): MongoObjectId {
  // Remove the brand prefix
  if (!encodedId.startsWith(NODE_ID_PREFIX)) {
    throw new Error(`Invalid node ID format: ${encodedId}. Expected prefix: ${NODE_ID_PREFIX}`);
  }
  
  const base64url = encodedId.slice(NODE_ID_PREFIX.length);
  
  try {
    // Convert base64url back to hex string
    const hexString = base64urlToHex(base64url);
    
    // Validate and create ObjectID
    if (!isValidObjectId(hexString)) {
      throw new Error(`Decoded string is not a valid ObjectID: ${hexString}`);
    }
    
    return createObjectId(hexString);
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
  } catch (error) {
    // Silently return false for invalid IDs
    return false;
  }
}

/**
 * Checks if a string is a raw MongoDB ObjectID (24 hex characters)
 * @param id - The string to check
 * @returns True if the string is a raw ObjectID
 */
export function isRawObjectId(id: string): boolean {
  return isValidObjectId(id) && id.length === 24;
}

/**
 * Normalizes an ID - if it's a raw ObjectID, encodes it; if it's already encoded, returns as-is
 * @param id - The ID to normalize
 * @returns An encoded node ID string
 */
export function normalizeToEncodedId(id: string | MongoObjectId): string {
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
export function normalizeToObjectId(id: string): MongoObjectId {
  if (id.startsWith(NODE_ID_PREFIX)) {
    // Encoded, decode it
    return decodeNodeId(id);
  }
  
  // Treat as raw ObjectID
  if (!isValidObjectId(id)) {
    throw new Error(`Invalid ID format: ${id}`);
  }
  
  return createObjectId(id);
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
      // Handle ObjectID objects (from MongoDB) - check if it has toString method
      if (result[field] && typeof result[field] === 'object' && typeof result[field].toString === 'function') {
        const idString = result[field].toString();
        if (isValidObjectId(idString)) {
          result[field] = encodeNodeId(result[field]) as any;
        }
      }
      // Handle ObjectID strings
      else if (typeof result[field] === 'string' && isValidObjectId(result[field])) {
        result[field] = encodeNodeId(result[field]) as any;
      }
      // Handle ObjectID-like objects with buffer property (from MongoDB serialization)
      else if (result[field] && typeof result[field] === 'object' && result[field].buffer && result[field].buffer.type === 'Buffer') {
        // Convert buffer data to hex string (only available in Node.js environment)
        if (typeof Buffer !== 'undefined') {
          const hexString = Buffer.from(result[field].buffer.data).toString('hex');
          result[field] = encodeNodeId(hexString) as any;
        }
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
