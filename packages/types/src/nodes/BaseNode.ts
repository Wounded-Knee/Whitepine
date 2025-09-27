/**
 * BaseNode - Base configuration for all node types
 */

import { NODE_TYPES, SYNAPSE_DIRECTIONS, SYNAPSE_ROLES, DISCRIMINATOR_KEY } from '../nodeTypes';
import type { ObjectId } from '../shared';

// Base Node interface for polymorphic nodes
export interface BaseNode {
  _id: ObjectId;
  kind: string;                  // discriminator
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;       // soft delete
  // Note: All relationships are now handled via SynapseNode connections
}

export interface CreateSynapseRequest {
  from: any;
  to: any;
  role: string;
  dir?: string;
  order?: number;
  weight?: number;
  props?: Record<string, unknown>;
}

const generateSchema = (viewSchema: Record<string, any>) => {
  return Object.entries(viewSchema).reduce((acc: Record<string, any>, [fieldName, field]) => {
    // Skip schemaExclude fields and the discriminator key
    if (!field.schemaExclude) {
      const schemaField: Record<string, any> = {
        type: field.type,
      };
      
      // Only add properties if they exist and are not undefined
      const fieldProperties = ['default', 'index', 'required', 'unique', 'lowercase', 'trim', 'maxlength', 'enum', 'ref'];
      fieldProperties.forEach(prop => {
        if (field[prop] !== undefined) {
          schemaField[prop] = field[prop];
        }
      });
      
      acc[fieldName] = schemaField;
    }
    return acc;
  }, {});
};

const cfg = {
  type: NODE_TYPES.BASE,
  schema: undefined,
  onCreate: (node: BaseNode, userId: string, allSynapseRequests: Array<CreateSynapseRequest>) => {
    // Always create an authorship synapse if userId is provided
    return {
      from: userId,
      to: node._id,
      role: SYNAPSE_ROLES.AUTHOR,
      dir: SYNAPSE_DIRECTIONS.OUT
    };
  },
  selectionCriteria: {
    cardinal: {
      deletedAt: null
    },
    relatives: {
      deletedAt: null
    }
  },
  viewSchema: {
    _id: {
      name: 'ID',
      description: 'Unique identifier for this node',
      type: String,
      id: true,
    },
    [DISCRIMINATOR_KEY]: {
      name: 'Discriminator',
      description: 'The type of node',
      type: String,
      required: true,
      index: true,
      schemaExclude: true,
    },
    createdAt: {
      name: (value: any) => value ? 'Created At' : 'Uncreated',
      description: 'When this node was first created',
      type: Date,
      default: Date.now,
      index: true,
    },
    updatedAt: {
      name: (value: any) => value ? 'Updated At' : 'Unupdated',
      description: 'When this node was last modified',
      type: Date,
      default: Date.now,
      index: true,
    },
    deletedAt: {
      name: (value: any) => value ? 'Deleted' : 'Present',
      description: null,
      type: Date,
      default: null,
    },
    isActive: {
      name: (value: any) => value ? 'Active' : 'Inactive',
      value: (value: any) => value ? 'Yep' : 'Nope',
      description: (value: any) => value ? 'This node is active.' : 'This node is inactive.',
      type: Boolean,
      default: true,
    },
  }
};

cfg.schema = generateSchema(cfg.viewSchema) as any;

export const CONFIG = cfg;

export { generateSchema };
