import { model as BaseNodeModel, schema as baseNodeSchema } from '../models/BaseNode';
import { NODE_TYPES, SYNAPSE_DIRECTIONS, SYNAPSE_ROLES } from '@whitepine/types';
import { Types } from 'mongoose';
import type { BaseNode } from '@whitepine/types';

export interface CreateSynapseRequest {
  from: any;
  to: any;
  role: string;
  dir?: string;
  order?: number;
  weight?: number;
  props?: Record<string, unknown>;
}

const baseNodeSelectionCriteria = {
  cardinal: {
    deletedAt: null
  },
  relatives: {
    deletedAt: null
  }
};

const baseNodeHandlers = {
  onCreate: (node: BaseNode, userId: string, allSynapseRequests: Array<CreateSynapseRequest>) => {
    // Always create an authorship synapse if userId is provided
    return {
      from: new Types.ObjectId(userId),
      to: new Types.ObjectId(node._id),
      role: SYNAPSE_ROLES.AUTHOR,
      dir: SYNAPSE_DIRECTIONS.OUT
    };
  }
};

export default {
    kind: NODE_TYPES.BASE,
    model: BaseNodeModel,
    schema: baseNodeSchema,
    selectionCriteria: baseNodeSelectionCriteria,
    handlers: baseNodeHandlers
};