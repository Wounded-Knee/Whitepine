import type { Document, Types } from 'mongoose';
export interface User {
    id: string;
    email?: string;
    name?: string;
    picture?: string;
    provider?: string;
}
export { DISCRIMINATOR_KEY as discriminatorKey, NODE_TYPES, type NodeType, NODE_TYPE_VALUES, isNodeType, NODE_TYPE_MODEL_MAP } from './nodeTypes';
import { NODE_TYPES } from './nodeTypes';
import { SYNAPSE_DIRECTIONS, SYNAPSE_ROLES, type SynapseRole, SYNAPSE_DIRECTION_VALUES, SYNAPSE_ROLE_VALUES } from './synapseTypes';
export { SYNAPSE_DIRECTIONS, SYNAPSE_ROLES, type SynapseRole, SYNAPSE_DIRECTION_VALUES, SYNAPSE_ROLE_VALUES };
export type SynapseDirection = typeof SYNAPSE_DIRECTIONS[keyof typeof SYNAPSE_DIRECTIONS];
export interface BaseNode extends Document {
    _id: Types.ObjectId;
    kind: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
}
export interface UserNode extends BaseNode {
    kind: typeof NODE_TYPES.USER;
    email: string;
    name: string;
    avatar?: string;
    bio?: string;
    isActive: boolean;
    lastLoginAt?: Date;
    preferences?: {
        theme?: 'light' | 'dark' | 'auto';
        language?: string;
        notifications?: {
            email?: boolean;
            push?: boolean;
        };
    };
}
export interface PostNode extends BaseNode {
    kind: typeof NODE_TYPES.POST;
    content: string;
    publishedAt?: Date | null;
}
export interface SynapseNode extends BaseNode {
    kind: typeof NODE_TYPES.SYNAPSE;
    from: Types.ObjectId;
    to: Types.ObjectId;
    role: SynapseRole;
    dir: SynapseDirection;
    order?: number;
    weight?: number;
    props?: Record<string, unknown>;
}
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export type { RelationshipConfig, FormFieldConfig } from './relationshipConfig';
export { combineRelationshipConfigs, filterApplicableConfigs } from './relationshipConfig';
export { NODE_RELATIONSHIP_REGISTRY, getRelationshipConfigsForNodeType, getAllRelationshipConfigs, validateRelationshipCreation, hasRelationshipConfig, getUserNodeRelationshipConfigs, validateUserNodeRelationship, getPostNodeRelationshipConfigs, validatePostNodeRelationship, getSynapseNodeRelationshipConfigs, validateSynapseNodeRelationship, USER_NODE_RELATIONSHIP_CONFIGS, POST_NODE_RELATIONSHIP_CONFIGS, SYNAPSE_NODE_RELATIONSHIP_CONFIGS, } from './nodes';
export { encodeNodeId, decodeNodeId, isValidEncodedNodeId, isRawObjectId, normalizeToEncodedId, normalizeToObjectId, encodeObjectIds, decodeObjectIds, } from './nodeId';
export { encodeNodeResponse, encodeNodesResponse, encodeObjectFields, decodeObjectFields, } from './nodeIdUtils';
export type { NodeIdEncodingConfig } from './nodeIdConfig';
export { CUSTOM_NODE_ID_CONFIG, createNodeIdConfig, addFieldsToNodeType, removeFieldsFromNodeType, } from './nodeIdConfig';
//# sourceMappingURL=index.d.ts.map