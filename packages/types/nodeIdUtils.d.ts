/**
 * Node ID Utilities for Response Encoding
 *
 * This module provides utilities for encoding node IDs in API responses
 * and handling object field encoding/decoding.
 */
/**
 * Encodes a single node response by encoding ObjectID fields
 * @param node - The node object to encode
 * @param fieldsToEncode - Array of field names that contain ObjectIDs
 * @returns The encoded node object
 */
export declare function encodeNodeResponse(node: any, fieldsToEncode?: string[]): any;
/**
 * Encodes an array of node responses
 * @param nodes - Array of node objects to encode
 * @param fieldsToEncode - Array of field names that contain ObjectIDs
 * @returns Array of encoded node objects
 */
export declare function encodeNodesResponse(nodes: any[], fieldsToEncode?: string[]): any[];
/**
 * Encodes specific object fields that contain ObjectIDs
 * @param obj - The object to encode
 * @param fields - Array of field names to encode
 * @returns New object with encoded fields
 */
export declare function encodeObjectFields(obj: any, fields: string[]): any;
/**
 * Decodes specific object fields that contain encoded node IDs
 * @param obj - The object to decode
 * @param fields - Array of field names to decode
 * @returns New object with decoded fields
 */
export declare function decodeObjectFields(obj: any, fields: string[]): any;
//# sourceMappingURL=nodeIdUtils.d.ts.map