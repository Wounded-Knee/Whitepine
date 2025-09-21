import { Schema, model as Model } from 'mongoose';
import type { BaseNode } from '@whitepine/types';
import { discriminatorKey } from '@whitepine/types';

// Base Node Schema
const schema = new Schema<BaseNode>({
  [discriminatorKey]: {
    type: String,
    required: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
  // Note: All relationships are now handled via SynapseNode connections
}, {
  timestamps: true, // This will automatically manage createdAt and updatedAt
  discriminatorKey: discriminatorKey,
  collection: 'nodes', // All node types will be stored in the same collection
});

// Indexes for efficient querying
schema.index({ [discriminatorKey]: 1, deletedAt: 1 });

// Compound index for soft delete queries
schema.index({ deletedAt: 1, [discriminatorKey]: 1, createdAt: -1 });

// Pre-save middleware to update updatedAt
schema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Pre-update middleware to update updatedAt
schema.pre(['updateOne', 'updateMany', 'findOneAndUpdate'], function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// Static method to find non-deleted nodes
schema.statics.findActive = function() {
  return this.find({ deletedAt: null });
};

// Static method to find by kind and slug
schema.statics.findByKindAndSlug = function(kind: string, slug: string) {
  return this.findOne({ [discriminatorKey]: kind, slug, deletedAt: null });
};

// Instance method for soft delete
schema.methods.softDelete = function() {
  this.deletedAt = new Date();
  return this.save();
};

// Instance method to restore from soft delete
schema.methods.restore = function() {
  this.deletedAt = null;
  return this.save();
};

// Create the base model
const model = Model<BaseNode>('BaseNode', schema);

export { model, schema };
