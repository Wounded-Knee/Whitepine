/**
 * Node Type Discriminator Constants
 * 
 * Centralized constants for all node type discriminator strings used throughout
 * the Whitepine application. This ensures consistency and makes it easy to
 * maintain node type definitions across the web and API apps.
 */

/**
 * The discriminator key used for all node types
 */
export const DISCRIMINATOR_KEY = "kind" as const;

/**
 * Node type discriminator strings
 */
export const NODE_TYPES = {
  BASE: 'base',
  USER: 'User',
  POST: 'post', 
  SYNAPSE: 'synapse',
} as const;

/**
 * Type for all valid node type discriminator strings
 */
export type NodeType = typeof NODE_TYPES[keyof typeof NODE_TYPES];

/**
 * Array of all node type discriminator strings
 */
export const NODE_TYPE_VALUES = Object.values(NODE_TYPES);

/**
 * Type guard to check if a string is a valid node type
 */
export function isNodeType(value: string): value is NodeType {
  return NODE_TYPE_VALUES.includes(value as NodeType);
}

/**
 * Registry of node type to model name mapping (for API usage)
 */
export const NODE_TYPE_MODEL_MAP = {
  [NODE_TYPES.USER]: 'User',
  [NODE_TYPES.POST]: 'post',
  [NODE_TYPES.SYNAPSE]: 'synapse',
} as const;
