// Shared types for the Whitepine application
import type { Document, Types } from 'mongoose';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// ---------- Node Types ----------
export const discriminatorKey = "kind" as const;

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
  readOnly?: boolean;            // computed field indicating if node is read-only
}

// UserNode interface extending BaseNode
export interface UserNode extends BaseNode {
  kind: 'User';
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
