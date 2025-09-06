const mongoose = require('mongoose');
const { Schema } = mongoose;

/*
This model maps a user to an identity.
It creates a relationship between a user and an identity record in the database.
It can be used for any identity inheriting from the Identity model, such as PoliticalIdentity, RacialIdentity, ReligiousIdentity, etc.
The rank is used to sort the identities for a user.
The isActive flag is used to soft delete an identity for a user.

The model is named UserIdentity.
*/
const UserIdentity = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  identityId: {
    type: mongoose.Schema.Types.ObjectId,
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
UserIdentity.index(
  { userId: 1, rank: 1 },
  { unique: true, sparse: true }
);

// Compound index to ensure unique identity per user
UserIdentity.index(
  { userId: 1, identityId: 1 },
  { unique: true, sparse: true }
);

// Virtual for identity details
UserIdentity.virtual('identity', {
  ref: 'Identity',
  localField: 'identityId',
  foreignField: '_id',
  justOne: true
});

// Ensure virtuals are serialized
UserIdentity.set('toJSON', { virtuals: true });
UserIdentity.set('toObject', { virtuals: true });

module.exports = mongoose.model('UserIdentity', UserIdentity);

