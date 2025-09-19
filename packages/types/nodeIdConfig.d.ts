/**
 * Node ID Encoding Configuration
 *
 * This file defines which ObjectID fields should be encoded for each node type.
 * Customize this configuration to match your specific node types and their fields.
 */
/**
 * Configuration for which fields to encode based on node type
 */
export interface NodeIdEncodingConfig {
    [nodeType: string]: string[];
}
/**
 * Custom configuration for node ID encoding based on node types
 *
 * Key: Node type (discriminator value from your node types)
 * Value: Array of field names that contain ObjectIDs and should be encoded
 */
export declare const CUSTOM_NODE_ID_CONFIG: NodeIdEncodingConfig;
/**
 * Helper function to create a custom configuration
 * @param baseConfig - Base configuration to extend
 * @param customConfig - Custom overrides
 * @returns Merged configuration
 */
export declare function createNodeIdConfig(baseConfig?: NodeIdEncodingConfig, customConfig?: NodeIdEncodingConfig): NodeIdEncodingConfig;
/**
 * Helper function to add fields to a specific node type
 * @param config - Existing configuration
 * @param nodeType - Node type to modify
 * @param fields - Fields to add
 * @returns New configuration with added fields
 */
export declare function addFieldsToNodeType(config: NodeIdEncodingConfig, nodeType: string, fields: string[]): NodeIdEncodingConfig;
/**
 * Helper function to remove fields from a specific node type
 * @param config - Existing configuration
 * @param nodeType - Node type to modify
 * @param fields - Fields to remove
 * @returns New configuration with removed fields
 */
export declare function removeFieldsFromNodeType(config: NodeIdEncodingConfig, nodeType: string, fields: string[]): NodeIdEncodingConfig;
//# sourceMappingURL=nodeIdConfig.d.ts.map