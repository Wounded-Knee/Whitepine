/**
 * PostNode - Complete definition including types, validation, and relationships
 */

import type { RelationshipConfig } from '../relationshipConfig';
import { NODE_TYPES } from '../nodeTypes';
import { CONFIG as BASE_NODE_CONFIG, generateSchema, type BaseNode } from './BaseNode';

// PostNode interface extending BaseNode
export interface PostNode extends BaseNode {
  kind: typeof NODE_TYPES.POST;
  content: string;
  publishedAt?: Date | null;
}

/**
 * PostNode relationship configurations
 * Defines what relationships can be created from a PostNode
 */
export const POST_NODE_RELATIONSHIP_CONFIGS: RelationshipConfig[] = [
  {
    id: 'create_reply',
    label: 'Reply to Post',
    description: 'Create a reply to this post',
    targetNodeKind: 'post',
    synapseRole: 'replies_to',
    synapseDirection: 'out',
    synapseProps: { type: 'reply' },
    isCommon: true,
    category: 'communication',
    icon: '💬',
    formFields: [
      {
        name: 'content',
        label: 'Reply Content',
        type: 'textarea',
        required: true,
        placeholder: 'Write your reply...',
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
      // Only show reply option if this is a post
      return node?.kind === 'post';
    }
  },

  {
    id: 'create_quote',
    label: 'Quote Post',
    description: 'Create a quote post referencing this post',
    targetNodeKind: 'post',
    synapseRole: 'quotes',
    synapseDirection: 'out',
    synapseProps: { type: 'quote' },
    isCommon: true,
    category: 'communication',
    icon: '💭',
    formFields: [
      {
        name: 'content',
        label: 'Quote Content',
        type: 'textarea',
        required: true,
        placeholder: 'Add your commentary on this post...',
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
      // Only show quote option if this is a post with content
      return node?.kind === 'post' && node?.content;
    }
  },

  {
    id: 'continue_thread',
    label: 'Continue Thread',
    description: 'Add to this conversation thread',
    targetNodeKind: 'post',
    synapseRole: 'continues',
    synapseDirection: 'out',
    synapseProps: { type: 'thread_continuation' },
    isCommon: true,
    category: 'communication',
    icon: '🧵',
    formFields: [
      {
        name: 'content',
        label: 'Thread Content',
        type: 'textarea',
        required: true,
        placeholder: 'Continue the conversation...',
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
      // Show if this is a post and has replies (indicating it's part of a thread)
      return node?.kind === 'post' && 
             relatives.some((rel: any) => rel._relationshipType === 'synapse' && rel.role === 'replies_to');
    }
  },

  {
    id: 'create_related_post',
    label: 'Create Related Post',
    description: 'Create a new post related to this one',
    targetNodeKind: 'post',
    synapseRole: 'related_to',
    synapseDirection: 'undirected',
    synapseProps: { type: 'related' },
    isCommon: false,
    category: 'organization',
    icon: '🔗',
    formFields: [
      {
        name: 'content',
        label: 'Post Content',
        type: 'textarea',
        required: true,
        placeholder: 'Write your related post...',
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
      // Always available for posts
      return node?.kind === 'post';
    }
  }
];

/**
 * Get all relationship configurations for PostNode
 */
export function getPostNodeRelationshipConfigs(): RelationshipConfig[] {
  return POST_NODE_RELATIONSHIP_CONFIGS;
}

/**
 * Validate if a relationship creation request is valid for PostNode
 */
export function validatePostNodeRelationship(
  nodeKind: string,
  synapseRole: string,
  synapseDirection: string
): { valid: boolean; error?: string } {
  const config = POST_NODE_RELATIONSHIP_CONFIGS.find(
    c => c.targetNodeKind === nodeKind && 
         c.synapseRole === synapseRole && 
         c.synapseDirection === synapseDirection
  );
  
  if (!config) {
    return {
      valid: false,
      error: `Invalid relationship: ${nodeKind} with role '${synapseRole}' and direction '${synapseDirection}' is not allowed for PostNode`
    };
  }
  
  return { valid: true };
}

const cfg = {
  ...BASE_NODE_CONFIG,
  type: NODE_TYPES.POST,
  selectionCriteria: {
    ...BASE_NODE_CONFIG.selectionCriteria,
    relatives: {
      ...BASE_NODE_CONFIG.selectionCriteria.relatives,
      publishedAt: { $ne: null }
    }
  },
  viewSchema: {
    ...BASE_NODE_CONFIG.viewSchema,
    content: {
      name: 'Content',
      description: 'Post content',
      type: String,
      required: true,
      trim: true,
    },
    publishedAt: {
      name: (value: any) => value ? 'Published!' : 'Unpublished',
      value: (value: any) => value ? value : null,
      description: 'Publication timestamp',
      type: Date,
      default: null,
      index: true,
    },
  },
};

cfg.schema = generateSchema(cfg.viewSchema) as any;

export const CONFIG = cfg;
