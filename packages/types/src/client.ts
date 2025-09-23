// Client-safe types for the Whitepine application
// This file re-exports types from index.ts, excluding server-side dependencies

// Re-export all shared types
export type { ObjectId, ApiResponse, PaginationParams, PaginatedResponse } from './shared';

// Re-export node types
export { 
  DISCRIMINATOR_KEY as discriminatorKey,
  NODE_TYPES,
  type NodeType,
  NODE_TYPE_VALUES,
  isNodeType,
  NODE_TYPE_MODEL_MAP
} from './nodeTypes';

// Re-export synapse types
export {
  SYNAPSE_DIRECTIONS,
  SYNAPSE_ROLES,
  type SynapseRole,
  type SynapseDirection
} from './synapseTypes';

// Re-export node interfaces
export type { BaseNode, UserNode, PostNode, SynapseNode } from './index';

// Re-export relationship configuration types
export type { 
  RelationshipConfig, 
  FormFieldConfig 
} from './relationshipConfig';

export {
  combineRelationshipConfigs,
  filterApplicableConfigs
} from './relationshipConfig';

// Re-export node relationship configurations (client-safe)
export {
  // Registry functions
  NODE_RELATIONSHIP_REGISTRY,
  getRelationshipConfigsForNodeType,
  getAllRelationshipConfigs,
  validateRelationshipCreation,
  hasRelationshipConfig,
  
  // Node-specific functions
  getUserNodeRelationshipConfigs,
  validateUserNodeRelationship,
  getPostNodeRelationshipConfigs,
  validatePostNodeRelationship,
  getSynapseNodeRelationshipConfigs,
  validateSynapseNodeRelationship,
  
  // Relationship configurations
  USER_NODE_RELATIONSHIP_CONFIGS,
  POST_NODE_RELATIONSHIP_CONFIGS,
  SYNAPSE_NODE_RELATIONSHIP_CONFIGS,
} from './index';

// Client-safe versions of node ID utilities (without Mongoose dependencies)
export function isValidEncodedNodeId(id: string): boolean {
  // Simple validation for encoded node IDs
  return typeof id === 'string' && id.length > 0;
}

export function isRawObjectId(id: string): boolean {
  // Simple validation for raw ObjectId strings
  return typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
}

// Client-safe type for NodeIdEncodingConfig
export interface NodeIdEncodingConfig {
  [nodeType: string]: string[];
}