/**
 * UserNode - Complete definition including types, validation, and relationships
 */
import type { RelationshipConfig } from '../../relationshipConfig';
export type { UserNode } from '../..';
/**
 * UserNode relationship configurations
 * Defines what relationships can be created from a UserNode
 */
export declare const USER_NODE_RELATIONSHIP_CONFIGS: RelationshipConfig[];
/**
 * Get all relationship configurations for UserNode
 */
export declare function getUserNodeRelationshipConfigs(): RelationshipConfig[];
/**
 * Validate if a relationship creation request is valid for UserNode
 */
export declare function validateUserNodeRelationship(nodeKind: string, synapseRole: string, synapseDirection: string): {
    valid: boolean;
    error?: string;
};
//# sourceMappingURL=index.d.ts.map