import { Schema } from 'mongoose';
import { BaseNodeModel } from './BaseNode.js';
import type { PostNode } from '@whitepine/types';
import { NODE_TYPES, discriminatorKey } from '@whitepine/types';

// PostNode schema
const postNodeSchema = new Schema<PostNode>({
  content: {
    type: String,
    required: true,
    trim: true,
  },
  publishedAt: {
    type: Date,
    default: null,
    index: true,
  },
}, {
  // Inherit discriminatorKey and collection from BaseNode
  discriminatorKey: discriminatorKey,
});

// Text search index for content
postNodeSchema.index({ content: 'text' });

// Additional indexes for efficient querying
postNodeSchema.index({ publishedAt: -1 });

// Pre-save middleware to ensure kind is set
postNodeSchema.pre('save', function(next) {
  if (!this.kind) {
    this.kind = NODE_TYPES.POST;
  }
  next();
});

// Static method to find published posts
postNodeSchema.statics.findPublished = function() {
  return this.find({ publishedAt: { $ne: null }, deletedAt: null });
};

// Static method to find posts by content search
postNodeSchema.statics.searchContent = function(searchTerm: string) {
  return this.find({
    $text: { $search: searchTerm },
    deletedAt: null,
  });
};

// Instance method to publish a post
postNodeSchema.methods.publish = function() {
  this.publishedAt = new Date();
  return this.save();
};

// Instance method to unpublish a post
postNodeSchema.methods.unpublish = function() {
  this.publishedAt = null;
  return this.save();
};

// Create the PostNode discriminator model
const PostNodeModel = BaseNodeModel.discriminator<PostNode>(NODE_TYPES.POST, postNodeSchema);

// Export the model and schema
export { PostNodeModel, postNodeSchema };
