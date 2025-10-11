// Shared types for the Whitepine application
import type { ObjectId, ApiResponse, PaginationParams, PaginatedResponse } from './shared';

// Re-export shared types
export type { ObjectId, ApiResponse, PaginationParams, PaginatedResponse };

// ---------- Node Types ----------
export { 
  DISCRIMINATOR_KEY as discriminatorKey,
  NODE_TYPES,
  type NodeType,
  NODE_TYPE_VALUES,
  isNodeType,
  NODE_TYPE_MODEL_MAP
} from './nodeTypes';

// Import for use in type definitions
import { NODE_TYPES } from './nodeTypes';
import { SYNAPSE_DIRECTIONS, SYNAPSE_ROLES, type SynapseRole, type SynapseDirection } from './synapseTypes';

// ---------- Synapse Types ----------
export {
  SYNAPSE_DIRECTIONS,
  SYNAPSE_ROLES,
  type SynapseRole,
  type SynapseDirection
};

// SynapseDirection is now imported from synapseTypes.ts

// ---------- Node Interface Exports ----------
export type { BaseNode } from './nodes/BaseNode';
export type { UserNode } from './nodes/UserNode';
export type { PostNode } from './nodes/PostNode';
export type { SynapseNode } from './nodes/SynapseNode';


// ---------- Relationship Configuration Types ----------
export type { 
  RelationshipConfig, 
  FormFieldConfig 
} from './relationshipConfig';

export {
  combineRelationshipConfigs,
  filterApplicableConfigs
} from './relationshipConfig';

// ---------- Node Definitions and Relationship Configurations ----------
// Import individual node configurations and functions
import { 
  USER_NODE_RELATIONSHIP_CONFIGS,
  getUserNodeRelationshipConfigs,
  validateUserNodeRelationship,
  CONFIG as USER_NODE_CONFIG
} from './nodes/UserNode';

import { 
  POST_NODE_RELATIONSHIP_CONFIGS,
  getPostNodeRelationshipConfigs,
  validatePostNodeRelationship,
  CONFIG as POST_NODE_CONFIG
} from './nodes/PostNode';

import { 
  SYNAPSE_NODE_RELATIONSHIP_CONFIGS,
  getSynapseNodeRelationshipConfigs,
  validateSynapseNodeRelationship,
  CONFIG as SYNAPSE_NODE_CONFIG
} from './nodes/SynapseNode';

import { 
  CONFIG as BASE_NODE_CONFIG
} from './nodes/BaseNode';

import { combineRelationshipConfigs } from './relationshipConfig';

// Registry of all relationship configurations by node type
export const NODE_RELATIONSHIP_REGISTRY = {
  'User': USER_NODE_RELATIONSHIP_CONFIGS,
  'post': POST_NODE_RELATIONSHIP_CONFIGS,
  'synapse': SYNAPSE_NODE_RELATIONSHIP_CONFIGS,
} as const;

/**
 * Get relationship configurations for a specific node type
 */
export function getRelationshipConfigsForNodeType(nodeType: string) {
  return NODE_RELATIONSHIP_REGISTRY[nodeType as keyof typeof NODE_RELATIONSHIP_REGISTRY] || [];
}

/**
 * Get all relationship configurations
 */
export function getAllRelationshipConfigs() {
  return combineRelationshipConfigs(
    USER_NODE_RELATIONSHIP_CONFIGS,
    POST_NODE_RELATIONSHIP_CONFIGS,
    SYNAPSE_NODE_RELATIONSHIP_CONFIGS
  );
}

/**
 * Validate a relationship creation request
 */
export function validateRelationshipCreation(
  sourceNodeType: string,
  targetNodeKind: string,
  synapseRole: string,
  synapseDirection: string
): { valid: boolean; error?: string } {
  switch (sourceNodeType) {
    case 'User':
      return validateUserNodeRelationship(targetNodeKind, synapseRole, synapseDirection);
    case 'post':
      return validatePostNodeRelationship(targetNodeKind, synapseRole, synapseDirection);
    case 'synapse':
      return validateSynapseNodeRelationship(targetNodeKind, synapseRole, synapseDirection);
    default:
      return {
        valid: false,
        error: `Unknown source node type: ${sourceNodeType}`
      };
  }
}

/**
 * Check if a relationship configuration exists
 */
export function hasRelationshipConfig(
  sourceNodeType: string,
  targetNodeKind: string,
  synapseRole: string,
  synapseDirection: string
): boolean {
  const configs = getRelationshipConfigsForNodeType(sourceNodeType);
  return configs.some(config => 
    config.targetNodeKind === targetNodeKind &&
    config.synapseRole === synapseRole &&
    config.synapseDirection === synapseDirection
  );
}

// Re-export node-specific functions
export {
  getUserNodeRelationshipConfigs,
  validateUserNodeRelationship,
  getPostNodeRelationshipConfigs,
  validatePostNodeRelationship,
  getSynapseNodeRelationshipConfigs,
  validateSynapseNodeRelationship,
};

// Re-export relationship configurations
export {
  USER_NODE_RELATIONSHIP_CONFIGS,
  POST_NODE_RELATIONSHIP_CONFIGS,
  SYNAPSE_NODE_RELATIONSHIP_CONFIGS,
};

// Re-export node configurations
export {
  BASE_NODE_CONFIG,
  USER_NODE_CONFIG,
  POST_NODE_CONFIG,
  SYNAPSE_NODE_CONFIG,
};

// ---------- Individual Node Exports ----------
export {
  type CreateSynapseRequest
} from './nodes/BaseNode';

// ---------- Node ID Encoding/Decoding Utilities ----------
export {
  encodeNodeId,
  decodeNodeId,
  isValidEncodedNodeId,
  isRawObjectId,
  normalizeToEncodedId,
  normalizeToObjectId,
  encodeObjectIds,
  decodeObjectIds,
  type MongoObjectId,
} from './nodeId';

// ---------- Node ID Utilities ----------
export {
  encodeNodeResponse,
  encodeNodesResponse,
  encodeObjectFields,
  decodeObjectFields,
} from './nodeIdUtils';

// ---------- Node ID Configuration ----------
export type { NodeIdEncodingConfig } from './nodeIdConfig';
