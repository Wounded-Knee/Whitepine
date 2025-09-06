const mongoose = require('mongoose');
const { Schema } = mongoose;

const Media = new Schema({
  filename: { 
    type: String, 
    required: true 
  },
  originalName: { 
    type: String, 
    required: true 
  },
  mediaType: { 
    type: String, 
    enum: ['image', 'document', 'video'], 
    required: true, 
    index: true 
  },
  bytes: { 
    type: Number, 
    required: true 
  },
  mime: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    maxlength: 500 
  },
  // Polymorphic entity reference
  entityType: { 
    type: String, 
    enum: ['User', 'Obligation', 'Claim', 'Evidence', 'Jurisdiction', 'GoverningBody', 'Office', 'Position'],
    index: true 
  },
  entityId: { 
    type: mongoose.Schema.Types.ObjectId, 
    index: true 
  },
  isPrimary: { 
    type: Boolean, 
    default: false, 
    index: true 
  },
  url: { 
    type: String, 
    maxlength: 500 
  },
  uploadedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  isActive: { 
    type: Boolean, 
    default: true, 
    index: true 
  }
}, { 
  timestamps: true 
});

// Indexes for common queries
Media.index({ uploadedBy: 1, createdAt: -1 });
Media.index({ mediaType: 1, isActive: 1 });
Media.index({ entityType: 1, entityId: 1, createdAt: -1 });
Media.index({ isPrimary: 1, entityType: 1, entityId: 1 });

module.exports = mongoose.model('Media', Media);

