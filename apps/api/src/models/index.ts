import { BaseNodeModel, baseNodeSchema, baseNodeSelectionCriteria } from './BaseNode.js';
import { UserNodeModel, userNodeSchema, userNodeSelectionCriteria } from './UserNode.js';
import { PostNodeModel, postNodeSchema, postNodeSelectionCriteria } from './PostNode.js';
import { SynapseNodeModel, synapseNodeSchema, synapseNodeSelectionCriteria } from './SynapseNode.js';
import { Model, Schema } from 'mongoose';
import { BaseNode, NODE_TYPES } from '@whitepine/types';

// Export the base model, schema, and selection criteria
export { BaseNodeModel, baseNodeSchema, baseNodeSelectionCriteria };

// Export specific node models, schemas, and selection criteria
export { UserNodeModel, userNodeSchema, userNodeSelectionCriteria };
export { PostNodeModel, postNodeSchema, postNodeSelectionCriteria };
export { SynapseNodeModel, synapseNodeSchema, synapseNodeSelectionCriteria };

// Factory function to create discriminator models
export function createNodeDiscriminator<T extends BaseNode>(
  name: string,
  discriminatorSchema: Schema<T>
): Model<T> {
  return BaseNodeModel.discriminator<T>(name, discriminatorSchema);
}
