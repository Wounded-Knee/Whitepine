// Shared types for the Whitepine application
import type { Document, Types } from 'mongoose';

export interface User {
  id: string;
  email?: string;
  name?: string;
  picture?: string;
  provider?: string;
}

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
import { SYNAPSE_DIRECTIONS, SYNAPSE_ROLES, type SynapseRole } from './synapseTypes';

// ---------- Synapse Types ----------
export {
  SYNAPSE_DIRECTIONS,
  SYNAPSE_ROLES,
  type SynapseRole
};

// Re-export SynapseDirection type for convenience
export type SynapseDirection = typeof SYNAPSE_DIRECTIONS[keyof typeof SYNAPSE_DIRECTIONS];

// Base Node interface for polymorphic nodes
export interface BaseNode extends Document {
  _id: Types.ObjectId;
  kind: string;                  // discriminator
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;       // soft delete
  // Note: All relationships are now handled via SynapseNode connections
}

// UserNode interface extending BaseNode
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

// PostNode interface extending BaseNode
export interface PostNode extends BaseNode {
  kind: typeof NODE_TYPES.POST;
  content: string;
  publishedAt?: Date | null;
}

// SynapseNode interface extending BaseNode
export interface SynapseNode extends BaseNode {
  kind: typeof NODE_TYPES.SYNAPSE;
  from: Types.ObjectId;               // reference to Node
  to:   Types.ObjectId;               // reference to Node
  role: SynapseRole;                  // relationship type
  dir:  SynapseDirection;             // direction of relation
  order?: number;                     // optional ordering
  weight?: number;                    // optional weighting
  props?: Record<string, unknown>;    // freeform metadata
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
} from './nodes';

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

// ---------- Node ID Configuration ----------
export {
  CUSTOM_NODE_ID_CONFIG,
  createNodeIdConfig,
  addFieldsToNodeType,
  removeFieldsFromNodeType,
} from './nodeIdConfig';
