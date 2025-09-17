/**
 * Central registry for all node definitions and relationship configurations
 */

import type { RelationshipConfig } from '../relationshipConfig';
import { combineRelationshipConfigs } from '../relationshipConfig';

// Import all node relationship configurations
import { 
  USER_NODE_RELATIONSHIP_CONFIGS,
  getUserNodeRelationshipConfigs,
  validateUserNodeRelationship
} from './UserNode';

import { 
  POST_NODE_RELATIONSHIP_CONFIGS,
  getPostNodeRelationshipConfigs,
  validatePostNodeRelationship
} from './PostNode';

import { 
  SYNAPSE_NODE_RELATIONSHIP_CONFIGS,
  getSynapseNodeRelationshipConfigs,
  validateSynapseNodeRelationship
} from './SynapseNode';

/**
 * Registry of all relationship configurations by node type
 */
export const NODE_RELATIONSHIP_REGISTRY = {
  'User': USER_NODE_RELATIONSHIP_CONFIGS,
  'post': POST_NODE_RELATIONSHIP_CONFIGS,
  'synapse': SYNAPSE_NODE_RELATIONSHIP_CONFIGS,
} as const;

/**
 * Get relationship configurations for a specific node type
 */
export function getRelationshipConfigsForNodeType(nodeType: string): RelationshipConfig[] {
  return NODE_RELATIONSHIP_REGISTRY[nodeType as keyof typeof NODE_RELATIONSHIP_REGISTRY] || [];
}

/**
 * Get all relationship configurations
 */
export function getAllRelationshipConfigs(): RelationshipConfig[] {
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

// Re-export all node-specific functions
export {
  getUserNodeRelationshipConfigs,
  validateUserNodeRelationship,
  getPostNodeRelationshipConfigs,
  validatePostNodeRelationship,
  getSynapseNodeRelationshipConfigs,
  validateSynapseNodeRelationship,
};

// Re-export all relationship configurations
export {
  USER_NODE_RELATIONSHIP_CONFIGS,
  POST_NODE_RELATIONSHIP_CONFIGS,
  SYNAPSE_NODE_RELATIONSHIP_CONFIGS,
};
