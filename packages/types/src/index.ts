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

// Base Node interface for polymorphic nodes
export interface BaseNode extends Document {
  _id: Types.ObjectId;
  kind: string;                  // discriminator
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;       // soft delete
  createdBy?: Types.ObjectId;    // User _id
  updatedBy?: Types.ObjectId;    // User _id
  ownerId?: Types.ObjectId;      // canonical owner (often same as createdBy)
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
export type SynapseDirection = "out" | "in" | "undirected";

export interface SynapseNode extends BaseNode {
  kind: typeof NODE_TYPES.SYNAPSE;
  from: Types.ObjectId;               // reference to Node
  to:   Types.ObjectId;               // reference to Node
  role: string;                       // relationship type
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
