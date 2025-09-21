import { model as PostNodeModel, schema as postNodeSchema } from '../models/PostNode';
import baseNode from './base';
import { NODE_TYPES } from '@whitepine/types';

const postNodeSelectionCriteria = {
  ...baseNode.selectionCriteria,
  relatives: {
    ...baseNode.selectionCriteria.relatives,
    publishedAt: { $ne: null }
  }
};

const postNodeHandlers = baseNode.handlers;

export default {
    kind: NODE_TYPES.POST,
    model: PostNodeModel,
    schema: postNodeSchema,
    selectionCriteria: postNodeSelectionCriteria,
    handlers: postNodeHandlers
};
