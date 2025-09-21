// Client-safe types for the Whitepine application
// This file excludes server-side dependencies like Mongoose

// Note: Using string instead of Types.ObjectId for client compatibility
type ObjectId = string;

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
export interface BaseNode {
  _id: ObjectId;
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
  from: ObjectId;               // reference to Node
  to:   ObjectId;               // reference to Node
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
