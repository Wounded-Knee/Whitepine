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

// Example usage for creating specific node types:
// 
// import { createNodeDiscriminator } from './models/index.js';
// import { Schema } from 'mongoose';
// 
// // Create a Post node type
// const postSchema = new Schema({
//   title: { type: String, required: true },
//   content: { type: String, required: true },
//   publishedAt: { type: Date },
// });
// 
// export const PostModel = createNodeDiscriminator('Post', postSchema);
//
// // Create a Page node type  
// const pageSchema = new Schema({
//   title: { type: String, required: true },
//   content: { type: String, required: true },
//   template: { type: String, default: 'default' },
// });
//
// export const PageModel = createNodeDiscriminator('Page', pageSchema);
//
// // UserNode is already available:
// import { UserNodeModel } from './models/index.js';
// 
// // Create a new user
// const newUser = new UserNodeModel({
//   kind: NODE_TYPES.USER,
//   email: 'user@example.com',
//   name: 'John Doe',
//   createdBy: adminUserId,
//   ownerId: adminUserId,
// });
// 
// await newUser.save();
