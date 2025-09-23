import { model as BaseNodeModel, schema as baseNodeSchema } from './BaseNode.js';
import { model as UserNodeModel, schema as userNodeSchema } from './UserNode.js';
import { model as PostNodeModel, schema as postNodeSchema } from './PostNode.js';
import { model as SynapseNodeModel, schema as synapseNodeSchema } from './SynapseNode.js';
import { Model, Schema } from 'mongoose';
import { BaseNode, NODE_TYPES } from '@whitepine/types';

// Export the base model and schema
export { BaseNodeModel, baseNodeSchema };

// Export specific node models and schemas
export { UserNodeModel, userNodeSchema };
export { PostNodeModel, postNodeSchema };
export { SynapseNodeModel, synapseNodeSchema };

// Factory function to create discriminator models
export function createNodeDiscriminator<T extends BaseNode>(
  name: string,
  discriminatorSchema: Schema<T>
): Model<T> {
  return BaseNodeModel.discriminator<T>(name, discriminatorSchema);
}
