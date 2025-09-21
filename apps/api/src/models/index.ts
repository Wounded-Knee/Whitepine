import { model as BaseNodeModel, schema as baseNodeSchema } from './BaseNode.js';
import { model as UserNodeModel, schema as userNodeSchema } from './UserNode.js';
import { model as PostNodeModel, schema as postNodeSchema } from './PostNode.js';
import { model as SynapseNodeModel, schema as synapseNodeSchema } from './SynapseNode.js';
import baseNode from '../nodes/base.js';
import userNode from '../nodes/user.js';
import postNode from '../nodes/post.js';
import synapseNode from '../nodes/synapse.js';
import { Model, Schema } from 'mongoose';
import { BaseNode, NODE_TYPES } from '@whitepine/types';

// Export the base model, schema, and selection criteria
export { BaseNodeModel, baseNodeSchema };
export const baseNodeSelectionCriteria = baseNode.selectionCriteria;
export const baseNodeHandlers = baseNode.handlers;

// Export specific node models, schemas, and selection criteria
export { UserNodeModel, userNodeSchema };
export const userNodeSelectionCriteria = userNode.selectionCriteria;
export const userNodeHandlers = userNode.handlers;

export { PostNodeModel, postNodeSchema };
export const postNodeSelectionCriteria = postNode.selectionCriteria;
export const postNodeHandlers = postNode.handlers;

export { SynapseNodeModel, synapseNodeSchema };
export const synapseNodeSelectionCriteria = synapseNode.selectionCriteria;
export const synapseNodeHandlers = synapseNode.handlers;

// Factory function to create discriminator models
export function createNodeDiscriminator<T extends BaseNode>(
  name: string,
  discriminatorSchema: Schema<T>
): Model<T> {
  return BaseNodeModel.discriminator<T>(name, discriminatorSchema);
}
