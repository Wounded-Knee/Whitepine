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
/**
 * Encodes a MongoDB ObjectID to a branded, URL-safe string
 * @param objectId - The MongoDB ObjectID to encode
 * @returns A branded, URL-safe node ID string
 */
export declare function encodeNodeId(objectId: Types.ObjectId | string): string;
/**
 * Decodes a branded node ID back to a MongoDB ObjectID
 * @param encodedId - The branded node ID string to decode
 * @returns A MongoDB ObjectID
 */
export declare function decodeNodeId(encodedId: string): Types.ObjectId;
/**
 * Checks if a string is a valid encoded node ID
 * @param id - The string to check
 * @returns True if the string is a valid encoded node ID
 */
export declare function isValidEncodedNodeId(id: string): boolean;
/**
 * Checks if a string is a raw MongoDB ObjectID (24 hex characters)
 * @param id - The string to check
 * @returns True if the string is a raw ObjectID
 */
export declare function isRawObjectId(id: string): boolean;
/**
 * Normalizes an ID - if it's a raw ObjectID, encodes it; if it's already encoded, returns as-is
 * @param id - The ID to normalize
 * @returns An encoded node ID string
 */
export declare function normalizeToEncodedId(id: string | Types.ObjectId): string;
/**
 * Normalizes an ID - if it's encoded, decodes it; if it's already raw, returns as ObjectID
 * @param id - The ID to normalize
 * @returns A MongoDB ObjectID
 */
export declare function normalizeToObjectId(id: string): Types.ObjectId;
/**
 * Transforms an object by encoding all ObjectID fields to branded node IDs
 * @param obj - The object to transform
 * @param objectIdFields - Array of field names that contain ObjectIDs
 * @returns A new object with ObjectID fields encoded
 */
export declare function encodeObjectIds<T extends Record<string, any>>(obj: T, objectIdFields: (keyof T)[]): T;
/**
 * Transforms an object by decoding all encoded node ID fields back to ObjectIDs
 * @param obj - The object to transform
 * @param nodeIdFields - Array of field names that contain encoded node IDs
 * @returns A new object with encoded node ID fields decoded
 */
export declare function decodeObjectIds<T extends Record<string, any>>(obj: T, nodeIdFields: (keyof T)[]): T;
//# sourceMappingURL=nodeId.d.ts.map