import { Schema, model, Model, Document } from 'mongoose';
import type { BaseNode } from '@whitepine/types';
import { discriminatorKey } from '@whitepine/types';

// Base Node Schema
const baseNodeSchema = new Schema<BaseNode>({
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
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true, // This will automatically manage createdAt and updatedAt
  discriminatorKey: discriminatorKey,
  collection: 'nodes', // All node types will be stored in the same collection
});

// Indexes for efficient querying
baseNodeSchema.index({ [discriminatorKey]: 1, deletedAt: 1 });
baseNodeSchema.index({ ownerId: 1 });
baseNodeSchema.index({ createdBy: 1, createdAt: -1 });

// Compound index for soft delete queries
baseNodeSchema.index({ deletedAt: 1, [discriminatorKey]: 1, createdAt: -1 });

// Pre-save middleware to update updatedAt
baseNodeSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Pre-update middleware to update updatedAt
baseNodeSchema.pre(['updateOne', 'updateMany', 'findOneAndUpdate'], function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// Static method to find non-deleted nodes
baseNodeSchema.statics.findActive = function() {
  return this.find({ deletedAt: null });
};

// Static method to find by kind and slug
baseNodeSchema.statics.findByKindAndSlug = function(kind: string, slug: string) {
  return this.findOne({ [discriminatorKey]: kind, slug, deletedAt: null });
};

// Instance method for soft delete
baseNodeSchema.methods.softDelete = function() {
  this.deletedAt = new Date();
  return this.save();
};

// Instance method to restore from soft delete
baseNodeSchema.methods.restore = function() {
  this.deletedAt = null;
  return this.save();
};

// Create the base model
const BaseNodeModel = model<BaseNode>('BaseNode', baseNodeSchema);

export { BaseNodeModel, baseNodeSchema };
