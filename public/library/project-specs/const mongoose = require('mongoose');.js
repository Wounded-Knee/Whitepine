const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserPoliticalIdentity = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  identityId: {
    type: Number,
    ref: 'Identity',
    required: true,
    index: true
  },
  rank: {
    type: Number,
    required: true,
    min: 1,
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

// Compound index to ensure unique ranking per user
UserPoliticalIdentity.index(
  { userId: 1, rank: 1 },
  { unique: true, sparse: true }
);

// Compound index to ensure unique identity per user
UserPoliticalIdentity.index(
  { userId: 1, identityId: 1 },
  { unique: true, sparse: true }
);

// Virtual for identity details
UserPoliticalIdentity.virtual('identity', {
  ref: 'Identity',
  localField: 'identityId',
  foreignField: 'id',
  justOne: true
});

// Ensure virtuals are serialized
UserPoliticalIdentity.set('toJSON', { virtuals: true });
UserPoliticalIdentity.set('toObject', { virtuals: true });

module.exports = mongoose.model('UserPoliticalIdentity', UserPoliticalIdentity);

