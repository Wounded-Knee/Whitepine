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
export const CUSTOM_NODE_ID_CONFIG: NodeIdEncodingConfig = {
  // Wildcard configuration - applies to all nodes that don't have specific config
  '*': ['_id'],
  
  // UserNode specific fields
  'user': [
    '_id',           // Primary key
    // Note: All relationships are now handled via SynapseNode connections
  ],
  
  // PostNode specific fields
  'post': [
    '_id',           // Primary key
    // Note: All relationships are now handled via SynapseNode connections
  ],
  
  // SynapseNode specific fields (relationship nodes)
  'synapse': [
    '_id',           // Primary key
    'from',          // Source node ID
    'to',            // Target node ID
    // Note: All relationships are now handled via SynapseNode connections
  ],
  
  // Add more node types as needed
  // 'comment': ['_id', 'postId', 'authorId'],
  // 'category': ['_id', 'parentId'],
  // 'tag': ['_id'],
};

/**
 * Helper function to create a custom configuration
 * @param baseConfig - Base configuration to extend
 * @param customConfig - Custom overrides
 * @returns Merged configuration
 */
export function createNodeIdConfig(
  baseConfig: NodeIdEncodingConfig = {},
  customConfig: NodeIdEncodingConfig = {}
): NodeIdEncodingConfig {
  return {
    ...baseConfig,
    ...customConfig,
  };
}

/**
 * Helper function to add fields to a specific node type
 * @param config - Existing configuration
 * @param nodeType - Node type to modify
 * @param fields - Fields to add
 * @returns New configuration with added fields
 */
export function addFieldsToNodeType(
  config: NodeIdEncodingConfig,
  nodeType: string,
  fields: string[]
): NodeIdEncodingConfig {
  const existingFields = config[nodeType] || [];
  return {
    ...config,
    [nodeType]: [...new Set([...existingFields, ...fields])], // Remove duplicates
  };
}

/**
 * Helper function to remove fields from a specific node type
 * @param config - Existing configuration
 * @param nodeType - Node type to modify
 * @param fields - Fields to remove
 * @returns New configuration with removed fields
 */
export function removeFieldsFromNodeType(
  config: NodeIdEncodingConfig,
  nodeType: string,
  fields: string[]
): NodeIdEncodingConfig {
  const existingFields = config[nodeType] || [];
  return {
    ...config,
    [nodeType]: existingFields.filter(field => !fields.includes(field)),
  };
}
