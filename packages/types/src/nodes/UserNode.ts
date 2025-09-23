/**
 * UserNode - Complete definition including types, validation, and relationships
 */

import type { RelationshipConfig } from '../relationshipConfig';
import { NODE_TYPES } from '../nodeTypes';
import { CONFIG as BASE_NODE_CONFIG, generateSchema, type BaseNode } from './BaseNode';

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

/**
 * UserNode relationship configurations
 * Defines what relationships can be created from a UserNode
 */
export const USER_NODE_RELATIONSHIP_CONFIGS: RelationshipConfig[] = [
  {
    id: 'create_post_by_user',
    label: 'Create Post',
    description: 'Create a post authored by this user',
    targetNodeKind: 'post',
    synapseRole: 'authored',
    synapseDirection: 'in',
    synapseProps: { type: 'author' },
    isCommon: true,
    category: 'content',
    icon: '✍️',
    formFields: [
      {
        name: 'content',
        label: 'Post Content',
        type: 'textarea',
        required: true,
        placeholder: 'What would you like to post?',
        validation: {
          minLength: 1,
          maxLength: 2000
        }
      },
      {
        name: 'publishImmediately',
        label: 'Publish immediately',
        type: 'checkbox',
        defaultValue: true
      }
    ],
    isApplicable: (node, relatives) => {
      // Only show for user nodes
      return node?.kind === 'User';
    }
  },

  {
    id: 'create_follow_relationship',
    label: 'Follow User',
    description: 'Follow this user',
    targetNodeKind: 'User',
    synapseRole: 'follows',
    synapseDirection: 'out',
    synapseProps: { type: 'follow' },
    isCommon: true,
    category: 'social',
    icon: '👥',
    formFields: [
      {
        name: 'name',
        label: 'Your Name',
        type: 'text',
        required: true,
        placeholder: 'Enter your name'
      },
      {
        name: 'email',
        label: 'Your Email',
        type: 'email',
        required: true,
        placeholder: 'Enter your email'
      }
    ],
    isApplicable: (node, relatives) => {
      // Only show for user nodes, and only if not already following
      return node?.kind === 'User' && 
             !relatives.some((rel: any) => rel._relationshipType === 'synapse' && rel.role === 'follows');
    }
  },

  {
    id: 'create_mention_post',
    label: 'Mention User',
    description: 'Create a post mentioning this user',
    targetNodeKind: 'post',
    synapseRole: 'mentions',
    synapseDirection: 'out',
    synapseProps: { type: 'mention' },
    isCommon: true,
    category: 'communication',
    icon: '📢',
    formFields: [
      {
        name: 'content',
        label: 'Post Content',
        type: 'textarea',
        required: true,
        placeholder: 'Mention this user in your post...',
        validation: {
          minLength: 1,
          maxLength: 2000
        }
      },
      {
        name: 'publishImmediately',
        label: 'Publish immediately',
        type: 'checkbox',
        defaultValue: true
      }
    ],
    isApplicable: (node, relatives) => {
      // Only show for user nodes
      return node?.kind === 'User';
    }
  },

  {
    id: 'create_user_profile',
    label: 'Create User Profile',
    description: 'Create a profile for this user',
    targetNodeKind: 'User',
    synapseRole: 'profiles',
    synapseDirection: 'out',
    synapseProps: { type: 'profile' },
    isCommon: false,
    category: 'organization',
    icon: '👤',
    formFields: [
      {
        name: 'name',
        label: 'Profile Name',
        type: 'text',
        required: true,
        placeholder: 'Enter profile name'
      },
      {
        name: 'email',
        label: 'Profile Email',
        type: 'email',
        required: true,
        placeholder: 'Enter profile email'
      },
      {
        name: 'bio',
        label: 'Bio',
        type: 'textarea',
        required: false,
        placeholder: 'Tell us about this user...',
        validation: {
          maxLength: 500
        }
      }
    ],
    isApplicable: (node, relatives) => {
      // Only show for user nodes that don't already have a profile
      return node?.kind === 'User' && 
             !relatives.some((rel: any) => rel._relationshipType === 'synapse' && rel.role === 'profiles');
    }
  }
];

/**
 * Get all relationship configurations for UserNode
 */
export function getUserNodeRelationshipConfigs(): RelationshipConfig[] {
  return USER_NODE_RELATIONSHIP_CONFIGS;
}

/**
 * Validate if a relationship creation request is valid for UserNode
 */
export function validateUserNodeRelationship(
  nodeKind: string,
  synapseRole: string,
  synapseDirection: string
): { valid: boolean; error?: string } {
  const config = USER_NODE_RELATIONSHIP_CONFIGS.find(
    c => c.targetNodeKind === nodeKind && 
         c.synapseRole === synapseRole && 
         c.synapseDirection === synapseDirection
  );
  
  if (!config) {
    return {
      valid: false,
      error: `Invalid relationship: ${nodeKind} with role '${synapseRole}' and direction '${synapseDirection}' is not allowed for UserNode`
    };
  }
  
  return { valid: true };
}

const cfg = {
  ...BASE_NODE_CONFIG,
  type: NODE_TYPES.USER,
  selectionCriteria: {
    ...BASE_NODE_CONFIG.selectionCriteria,
    relatives: {
      ...BASE_NODE_CONFIG.selectionCriteria.relatives,
      isActive: true
    }
  },
  viewSchema: {
    ...BASE_NODE_CONFIG.viewSchema,
    email: {
      name: 'Email',
      description: 'User email address',
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      name: 'Name',
      description: 'User display name',
      type: String,
      required: true,
      maxlength: 100,
      trim: true,
    },
    avatar: {
      name: 'Avatar',
      description: 'Profile picture',
      type: String,
    },
    bio: {
      name: 'Bio',
      description: 'User biography',
      type: String,
      maxlength: 500,
      trim: true,
    },
    lastLoginAt: {
      name: 'Last Login',
      description: 'Last login timestamp',
      type: Date,
    },
    isActive: {
      name: (value: any) => value ? 'Active' : 'Inactive',
      value: (value: any) => value ? 'Yep' : 'Nope',
      description: (value: any) => value ? 'This user is active.' : 'This user is inactive.',
      type: Boolean,
      default: true,
      index: true,
    },
    preferences: {
      name: 'Preferences',
      description: 'User preferences',
      type: Object,
    },
  },
};

cfg.schema = generateSchema(cfg.viewSchema) as any;

export const CONFIG = cfg;
