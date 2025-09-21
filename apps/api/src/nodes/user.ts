import { model as UserNodeModel, schema as userNodeSchema } from '../models/UserNode';
import baseNode from './base';
import { NODE_TYPES } from '@whitepine/types';

const userNodeSelectionCriteria = {
  ...baseNode.selectionCriteria,
  relatives: {
    ...baseNode.selectionCriteria.relatives,
    isActive: true
  }
};

const userNodeHandlers = baseNode.handlers;

export default {
    kind: NODE_TYPES.USER,
    model: UserNodeModel,
    schema: userNodeSchema,
    selectionCriteria: userNodeSelectionCriteria,
    handlers: userNodeHandlers
};
