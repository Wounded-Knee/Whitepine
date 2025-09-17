/**
 * Central registry for all node definitions and relationship configurations
 */
import type { RelationshipConfig } from '../relationshipConfig';
import { USER_NODE_RELATIONSHIP_CONFIGS, getUserNodeRelationshipConfigs, validateUserNodeRelationship } from './UserNode';
import { POST_NODE_RELATIONSHIP_CONFIGS, getPostNodeRelationshipConfigs, validatePostNodeRelationship } from './PostNode';
import { SYNAPSE_NODE_RELATIONSHIP_CONFIGS, getSynapseNodeRelationshipConfigs, validateSynapseNodeRelationship } from './SynapseNode';
/**
 * Registry of all relationship configurations by node type
 */
export declare const NODE_RELATIONSHIP_REGISTRY: {
    readonly User: RelationshipConfig[];
    readonly post: RelationshipConfig[];
    readonly synapse: RelationshipConfig[];
};
/**
 * Get relationship configurations for a specific node type
 */
export declare function getRelationshipConfigsForNodeType(nodeType: string): RelationshipConfig[];
/**
 * Get all relationship configurations
 */
export declare function getAllRelationshipConfigs(): RelationshipConfig[];
/**
 * Validate a relationship creation request
 */
export declare function validateRelationshipCreation(sourceNodeType: string, targetNodeKind: string, synapseRole: string, synapseDirection: string): {
    valid: boolean;
    error?: string;
};
/**
 * Check if a relationship configuration exists
 */
export declare function hasRelationshipConfig(sourceNodeType: string, targetNodeKind: string, synapseRole: string, synapseDirection: string): boolean;
export { getUserNodeRelationshipConfigs, validateUserNodeRelationship, getPostNodeRelationshipConfigs, validatePostNodeRelationship, getSynapseNodeRelationshipConfigs, validateSynapseNodeRelationship, };
export { USER_NODE_RELATIONSHIP_CONFIGS, POST_NODE_RELATIONSHIP_CONFIGS, SYNAPSE_NODE_RELATIONSHIP_CONFIGS, };
//# sourceMappingURL=index.d.ts.map