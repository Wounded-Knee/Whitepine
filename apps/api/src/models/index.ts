import { BaseNodeModel, baseNodeSchema } from './BaseNode.js';
import { UserNodeModel, userNodeSchema } from './UserNode.js';
import { PostNodeModel, postNodeSchema } from './PostNode.js';
import { SynapseNodeModel, synapseNodeSchema } from './SynapseNode.js';
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
