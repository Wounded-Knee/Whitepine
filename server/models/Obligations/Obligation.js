const mongoose = require('mongoose');
const { Schema } = mongoose;

const ObligationDispositions = [
  'Discharged', 'Violated', 'Partially Discharged', 'No Action Taken',
];

const ObligationSchemaStructure = {
  title: { 
    type: String, 
    required: true, 
    trim: true, 
    maxlength: 200 
  },
  description: { 
    type: String, 
    required: true, 
    maxlength: 5000 
  },
  categoryId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Taxonomy', 
    required: true, 
    index: true 
  },
  creator: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'failed', 'cancelled'],
    default: 'pending',
    index: true
  },
  boundPartyType: {
    type: String,
    enum: ['governing body', 'office', 'position', 'legislation', 'jurisdiction', 'individual'],
    required: true,
    index: true
  },
  boundPartyId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  bindingPartyType: {
    type: String,
    enum: ['governing body', 'office', 'position', 'legislation', 'jurisdiction', 'individual'],
    required: true,
    index: true
  },
  bindingPartyId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  dueDate: {
    type: Date,
    index: true
  },
  tags: [{ 
    type: String, 
    trim: true, 
    maxlength: 50 
  }]
};

const ObligationSchema = new Schema(ObligationSchemaStructure, { 
  timestamps: true,
  discriminatorKey: 'obligationType' // This enables polymorphic inheritance
});

// Indexes for common queries
ObligationSchema.index({ creator: 1, createdAt: -1 });
ObligationSchema.index({ status: 1, createdAt: -1 });
ObligationSchema.index({ boundPartyType: 1, status: 1 });
ObligationSchema.index({ bindingPartyType: 1, status: 1 });
ObligationSchema.index({ dueDate: 1, status: 1 });
ObligationSchema.index({ categoryId: 1, status: 1 });

// Text search index
ObligationSchema.index({ title: 'text', description: 'text' });

// Create and export the base Obligation model
const Obligation = mongoose.model('Obligation', ObligationSchema);

// Export both the model and schema for use in discriminators
module.exports = { Obligation, ObligationSchema, ObligationSchemaStructure };
