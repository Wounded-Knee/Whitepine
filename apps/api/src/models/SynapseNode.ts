import { Schema, Types } from 'mongoose';
import { model as BaseNodeModel } from './BaseNode.js';
import type { SynapseNode } from '@whitepine/types';
import { NODE_TYPES, SYNAPSE_DIRECTIONS, SYNAPSE_ROLES, SynapseDirection } from '@whitepine/types';

// SynapseNode schema
const schema = new Schema({
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
    enum: Object.values(SYNAPSE_ROLES),
  },
  dir: {
    type: String,
    enum: Object.values(SYNAPSE_DIRECTIONS),
    default: SYNAPSE_DIRECTIONS.OUT,
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
schema.index(
  { from: 1, to: 1, role: 1, deletedAt: 1 },
  { unique: true }
);

// Additional indexes for efficient querying
schema.index({ from: 1, role: 1 });
schema.index({ to: 1, role: 1 });
schema.index({ role: 1, dir: 1 });
schema.index({ order: 1 });
schema.index({ weight: -1 });

// Pre-save middleware to ensure kind is set
schema.pre('save', function(next) {
  if (!(this as any).kind) {
    (this as any).kind = NODE_TYPES.SYNAPSE;
  }
  next();
});

// Static method to find synapses by role
schema.statics.findByRole = function(role: string) {
  return this.find({ role, deletedAt: null });
};

// Static method to find synapses from a specific node
schema.statics.findFrom = function(nodeId: string) {
  return this.find({ from: nodeId, deletedAt: null });
};

// Static method to find synapses to a specific node
schema.statics.findTo = function(nodeId: string) {
  return this.find({ to: nodeId, deletedAt: null });
};

// Static method to find synapses between two nodes
schema.statics.findBetween = function(fromId: string, toId: string) {
  return this.find({ from: fromId, to: toId, deletedAt: null });
};

// Static method to find synapses by direction
schema.statics.findByDirection = function(direction: SynapseDirection) {
  return this.find({ dir: direction, deletedAt: null });
};

// Instance method to reverse the synapse direction
schema.methods.reverse = function() {
  const temp = this.from;
  this.from = this.to;
  this.to = temp;
  
  // Update direction based on current direction
  if (this.dir === SYNAPSE_DIRECTIONS.OUT) {
    this.dir = SYNAPSE_DIRECTIONS.IN;
  } else if (this.dir === SYNAPSE_DIRECTIONS.IN) {
    this.dir = SYNAPSE_DIRECTIONS.OUT;
  }
  // 'undirected' remains unchanged
  
  return this.save();
};

// Instance method to update weight
schema.methods.updateWeight = function(weight: number) {
  this.weight = weight;
  return this.save();
};

// Instance method to update order
schema.methods.updateOrder = function(order: number) {
  this.order = order;
  return this.save();
};

// Create the SynapseNode discriminator model
const model = BaseNodeModel.discriminator<SynapseNode>(NODE_TYPES.SYNAPSE, schema);

// Export the model, schema, and selection criteria
export { model, schema };
