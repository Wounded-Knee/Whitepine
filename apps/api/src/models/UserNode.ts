import { Schema } from 'mongoose';
import { model as BaseNodeModel } from './BaseNode.js';
import type { UserNode } from '@whitepine/types';
import { NODE_TYPES } from '@whitepine/types';
import { CONFIG as USER_NODE_CONFIG } from '@whitepine/types/nodes/UserNode';

// UserNode schema
const schema = new Schema<UserNode>((USER_NODE_CONFIG as any).schema, {
  // Inherit discriminatorKey and collection from BaseNode
  discriminatorKey: 'kind',
});

// Additional indexes for UserNode-specific queries
schema.index({ email: 1, isActive: 1 });
schema.index({ lastLoginAt: -1 });
schema.index({ name: 'text', bio: 'text' }); // Text search index

// Pre-save middleware to ensure kind is set
schema.pre('save', function(next) {
  if (!this.kind) {
    this.kind = NODE_TYPES.USER;
  }
  next();
});

// Static method to find active users
schema.statics.findActiveUsers = function() {
  return this.find({ isActive: true, deletedAt: null });
};

// Static method to find by email
schema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase(), deletedAt: null });
};

// Instance method to update last login
schema.methods.updateLastLogin = function() {
  this.lastLoginAt = new Date();
  return this.save();
};

// Instance method to deactivate user
schema.methods.deactivate = function() {
  this.isActive = false;
  return this.save();
};

// Instance method to activate user
schema.methods.activate = function() {
  this.isActive = true;
  return this.save();
};

// Create the UserNode discriminator model
const model = BaseNodeModel.discriminator<UserNode>(NODE_TYPES.USER, schema);

// Export the model, schema, and selection criteria
export { model, schema };
