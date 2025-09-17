/**
 * PostNode - Complete definition including types, validation, and relationships
 */
import type { RelationshipConfig } from '../../relationshipConfig';
export type { PostNode } from '../..';
/**
 * PostNode relationship configurations
 * Defines what relationships can be created from a PostNode
 */
export declare const POST_NODE_RELATIONSHIP_CONFIGS: RelationshipConfig[];
/**
 * Get all relationship configurations for PostNode
 */
export declare function getPostNodeRelationshipConfigs(): RelationshipConfig[];
/**
 * Validate if a relationship creation request is valid for PostNode
 */
export declare function validatePostNodeRelationship(nodeKind: string, synapseRole: string, synapseDirection: string): {
    valid: boolean;
    error?: string;
};
//# sourceMappingURL=index.d.ts.map