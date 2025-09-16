import { Schema } from 'mongoose';
import { createNodeDiscriminator } from './index.js';
import type { SynapseNode } from '@whitepine/types';
import { NODE_TYPES } from '@whitepine/types';

// SynapseNode schema
const synapseNodeSchema = new Schema<SynapseNode>({
  from: {
    type: Schema.Types.ObjectId,
    ref: 'BaseNode',
    required: true,
    index: true,
  },
  to: {
    type: Schema.Types.ObjectId,
    ref: 'BaseNode',
    required: true,
    index: true,
  },
  role: {
    type: String,
    required: true,
    index: true,
  },
  dir: {
    type: String,
    enum: ['out', 'in', 'undirected'],
    default: 'out',
  },
  order: {
    type: Number,
  },
  weight: {
    type: Number,
  },
  props: {
    type: Schema.Types.Mixed,
  },
}, {
  // Inherit discriminatorKey and collection from BaseNode
  discriminatorKey: 'kind',
});

// Uniqueness guard to prevent duplicate synapses unless soft-deleted
synapseNodeSchema.index(
  { from: 1, to: 1, role: 1, deletedAt: 1 },
  { unique: true }
);

// Additional indexes for efficient querying
synapseNodeSchema.index({ from: 1, role: 1 });
synapseNodeSchema.index({ to: 1, role: 1 });
synapseNodeSchema.index({ role: 1, dir: 1 });
synapseNodeSchema.index({ order: 1 });
synapseNodeSchema.index({ weight: -1 });

// Pre-save middleware to ensure kind is set
synapseNodeSchema.pre('save', function(next) {
  if (!this.kind) {
    this.kind = NODE_TYPES.SYNAPSE;
  }
  next();
});

// Static method to find synapses by role
synapseNodeSchema.statics.findByRole = function(role: string) {
  return this.find({ role, deletedAt: null });
};

// Static method to find synapses from a specific node
synapseNodeSchema.statics.findFrom = function(nodeId: string) {
  return this.find({ from: nodeId, deletedAt: null });
};

// Static method to find synapses to a specific node
synapseNodeSchema.statics.findTo = function(nodeId: string) {
  return this.find({ to: nodeId, deletedAt: null });
};

// Static method to find synapses between two nodes
synapseNodeSchema.statics.findBetween = function(fromId: string, toId: string) {
  return this.find({ from: fromId, to: toId, deletedAt: null });
};

// Static method to find synapses by direction
synapseNodeSchema.statics.findByDirection = function(direction: 'out' | 'in' | 'undirected') {
  return this.find({ dir: direction, deletedAt: null });
};

// Instance method to reverse the synapse direction
synapseNodeSchema.methods.reverse = function() {
  const temp = this.from;
  this.from = this.to;
  this.to = temp;
  
  // Update direction based on current direction
  if (this.dir === 'out') {
    this.dir = 'in';
  } else if (this.dir === 'in') {
    this.dir = 'out';
  }
  // 'undirected' remains unchanged
  
  return this.save();
};

// Instance method to update weight
synapseNodeSchema.methods.updateWeight = function(weight: number) {
  this.weight = weight;
  return this.save();
};

// Instance method to update order
synapseNodeSchema.methods.updateOrder = function(order: number) {
  this.order = order;
  return this.save();
};

// Create the SynapseNode discriminator model
const SynapseNodeModel = createNodeDiscriminator<SynapseNode>(NODE_TYPES.SYNAPSE, synapseNodeSchema);

// Export the model and schema
export { SynapseNodeModel, synapseNodeSchema };
