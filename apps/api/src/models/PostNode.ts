import { Schema } from 'mongoose';
import { model as BaseNodeModel } from './BaseNode.js';
import type { PostNode } from '@whitepine/types';
import { NODE_TYPES } from '@whitepine/types';
import { CONFIG as POST_NODE_CONFIG } from '@whitepine/types/nodes/PostNode';

// PostNode schema
const schema = new Schema<PostNode>((POST_NODE_CONFIG as any).schema, {
  // Inherit discriminatorKey and collection from BaseNode
  discriminatorKey: 'kind',
});

// Text search index for content
schema.index({ content: 'text' });

// Additional indexes for efficient querying
schema.index({ publishedAt: -1 });

// Pre-save middleware to ensure kind is set
schema.pre('save', function(next) {
  if (!this.kind) {
    this.kind = NODE_TYPES.POST;
  }
  next();
});

// Static method to find published posts
schema.statics.findPublished = function() {
  return this.find({ publishedAt: { $ne: null }, deletedAt: null });
};

// Static method to find posts by content search
schema.statics.searchContent = function(searchTerm: string) {
  return this.find({
    $text: { $search: searchTerm },
    deletedAt: null,
  });
};

// Instance method to publish a post
schema.methods.publish = function() {
  this.publishedAt = new Date();
  return this.save();
};

// Instance method to unpublish a post
schema.methods.unpublish = function() {
  this.publishedAt = null;
  return this.save();
};

// Create the PostNode discriminator model
const model = BaseNodeModel.discriminator<PostNode>(NODE_TYPES.POST, schema);

// Export the model, schema, and selection criteria
export { model, schema };
