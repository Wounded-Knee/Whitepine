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
export interface BaseNode extends Document {
    _id: Types.ObjectId;
    kind: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
    createdBy?: Types.ObjectId;
    updatedBy?: Types.ObjectId;
    ownerId?: Types.ObjectId;
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
export type SynapseDirection = "out" | "in" | "undirected";
export interface SynapseNode extends BaseNode {
    kind: typeof NODE_TYPES.SYNAPSE;
    from: Types.ObjectId;
    to: Types.ObjectId;
    role: string;
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
//# sourceMappingURL=index.d.ts.map