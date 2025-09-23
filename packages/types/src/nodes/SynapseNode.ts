/**
 * SynapseNode - Complete definition including types, validation, and relationships
 */

import type { RelationshipConfig } from '../relationshipConfig';
import { NODE_TYPES } from '../nodeTypes';
import { CONFIG as BASE_NODE_CONFIG, generateSchema, type BaseNode } from './BaseNode';
import type { ObjectId } from '../shared';
import { SYNAPSE_ROLES, SYNAPSE_DIRECTIONS, type SynapseRole, type SynapseDirection } from '../synapseTypes';

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

/**
 * SynapseNode relationship configurations
 * Defines what relationships can be created from a SynapseNode
 * Note: Synapses typically don't create new relationships, but we can define
 * some organizational relationships if needed
 */
export const SYNAPSE_NODE_RELATIONSHIP_CONFIGS: RelationshipConfig[] = [
  // Synapses typically don't create new relationships
  // This is mostly for completeness and potential future use
  {
    id: 'create_related_synapse',
    label: 'Create Related Synapse',
    description: 'Create a synapse related to this one',
    targetNodeKind: 'synapse',
    synapseRole: 'related_to',
    synapseDirection: 'undirected',
    synapseProps: { type: 'related' },
    isCommon: false,
    category: 'organization',
    icon: '🔗',
    formFields: [
      {
        name: 'role',
        label: 'Synapse Role',
        type: 'text',
        required: true,
        placeholder: 'Enter the role for the new synapse'
      },
      {
        name: 'dir',
        label: 'Direction',
        type: 'select',
        required: true,
        defaultValue: 'out',
        options: [
          { value: 'in', label: 'Incoming' },
          { value: 'out', label: 'Outgoing' },
          { value: 'undirected', label: 'Undirected' }
        ]
      }
    ],
    isApplicable: (node, relatives) => {
      // Only show for synapse nodes
      return node?.kind === 'synapse';
    }
  }
];

/**
 * Get all relationship configurations for SynapseNode
 */
export function getSynapseNodeRelationshipConfigs(): RelationshipConfig[] {
  return SYNAPSE_NODE_RELATIONSHIP_CONFIGS;
}

/**
 * Validate if a relationship creation request is valid for SynapseNode
 */
export function validateSynapseNodeRelationship(
  nodeKind: string,
  synapseRole: string,
  synapseDirection: string
): { valid: boolean; error?: string } {
  const config = SYNAPSE_NODE_RELATIONSHIP_CONFIGS.find(
    c => c.targetNodeKind === nodeKind && 
         c.synapseRole === synapseRole && 
         c.synapseDirection === synapseDirection
  );
  
  if (!config) {
    return {
      valid: false,
      error: `Invalid relationship: ${nodeKind} with role '${synapseRole}' and direction '${synapseDirection}' is not allowed for SynapseNode`
    };
  }
  
  return { valid: true };
}

const cfg = {
  ...BASE_NODE_CONFIG,
  type: NODE_TYPES.SYNAPSE,
  viewSchema: {
    ...BASE_NODE_CONFIG.viewSchema,
    from: {
      name: 'From Node',
      description: 'The source node of this relationship',
      type: 'ObjectId',
      ref: 'BaseNode',
      required: true,
      index: true,
      id: true,
    },
    to: {
      name: 'To Node', 
      description: 'The target node of this relationship',
      type: 'ObjectId',
      ref: 'BaseNode',
      required: true,
      index: true,
      id: true,
    },
    role: {
      name: 'Role',
      description: 'The role of this relationship',
      type: String,
      enum: Object.values(SYNAPSE_ROLES),
      required: true,
      index: true,
    },
    dir: {
      name: 'Direction',
      description: 'The direction of this relationship',
      type: String,
      enum: Object.values(SYNAPSE_DIRECTIONS),
      default: SYNAPSE_DIRECTIONS.OUT,
    },
    order: {
      name: 'Order',
      description: 'Optional ordering for this relationship',
      type: Number,
    },
    weight: {
      name: 'Weight',
      description: 'Optional weighting for this relationship',
      type: Number,
    },
    props: {
      name: 'Properties',
      description: 'Additional properties for this relationship',
      type: 'Mixed',
    },
  },
}

cfg.schema = generateSchema(cfg.viewSchema) as any;

/**
 * SynapseNode configuration
 */
export const CONFIG = cfg;
