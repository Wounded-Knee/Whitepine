/**
 * SynapseNode - Complete definition including types, validation, and relationships
 */
import type { RelationshipConfig } from '../../relationshipConfig';
export type { SynapseNode } from '../..';
/**
 * SynapseNode relationship configurations
 * Defines what relationships can be created from a SynapseNode
 * Note: Synapses typically don't create new relationships, but we can define
 * some organizational relationships if needed
 */
export declare const SYNAPSE_NODE_RELATIONSHIP_CONFIGS: RelationshipConfig[];
/**
 * Get all relationship configurations for SynapseNode
 */
export declare function getSynapseNodeRelationshipConfigs(): RelationshipConfig[];
/**
 * Validate if a relationship creation request is valid for SynapseNode
 */
export declare function validateSynapseNodeRelationship(nodeKind: string, synapseRole: string, synapseDirection: string): {
    valid: boolean;
    error?: string;
};
//# sourceMappingURL=index.d.ts.map