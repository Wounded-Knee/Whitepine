/* eslint-disable no-unused-vars */
const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

// ------------------------------
// 1) Constants and Enums
// ------------------------------
const LEVELS = ['country', 'state', 'county', 'city', 'district', 'special'];
const BRANCHES = ['executive', 'legislative', 'judicial', 'administrative'];
const ENTITY_TYPES = ['jurisdiction', 'body', 'office', 'position', 'election', 'legislation'];
const SELECTION_METHODS = ['election', 'appointment', 'inheritance', 'merit', 'other'];
const CONSTITUENCIES = ['general', 'district', 'ward', 'precinct', 'at-large'];
const OFFICE_TYPES = ['elected', 'appointed', 'civil_service', 'contract', 'volunteer'];
const MEDIA_TYPES = [
  'seal', 'flag', 'headshot', 'logo', 'building', 'document', 'signature', 'other'
];

// ------------------------------
// 2) Identifier model
// ------------------------------
const IdentifierSchema = new Schema({
  ocd_id: { type: String, index: true },
  fips: { type: String, index: true },
  geoid: { type: String, index: true },
  ansi: { type: String },
  usgm_id: { type: String },
  other: { type: Map, of: String }
}, { _id: false });

// ------------------------------
// 3) Jurisdiction model
// Represents a governed geographic or corporate area, such as USA, a state, a county, a city, a school district, or a special district.
// ------------------------------
const JurisdictionSchema = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, lowercase: true, match: /^[a-z0-9-]+$/ },
  level: { type: String, enum: LEVELS, required: true },
  entity_type: { type: String, enum: ENTITY_TYPES, required: true, default: 'jurisdiction' },

  parent: { type: Types.ObjectId, ref: 'Jurisdiction', default: null }, // adjacency list
  path: { type: String, required: true }, // materialized path like /usa/state/california/county/san-mateo
  depth: { type: Number, required: true, default: 0 },

  // Media references (now using unified Media model)
  media: [{ type: Types.ObjectId, ref: 'Media' }],
  primary_media: { type: Types.ObjectId, ref: 'Media' }, // primary seal/flag

  identifiers: { type: IdentifierSchema, default: {} },
  metadata: { type: Map, of: Schema.Types.Mixed }
}, { timestamps: true });

JurisdictionSchema.index({ parent: 1, slug: 1 }, { unique: true });
JurisdictionSchema.index({ path: 1 }, { unique: true });
JurisdictionSchema.index({ level: 1 });

// ------------------------------
// 4) Governing Body model
// Represents a legislative body, executive branch, judicial system, or other governing entity within a jurisdiction.
// ------------------------------
const GoverningBodySchema = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, lowercase: true, match: /^[a-z0-9-]+$/ },
  jurisdiction: { type: Types.ObjectId, ref: 'Jurisdiction', required: true },
  branch: { type: String, enum: BRANCHES, required: true },
  entity_type: { type: String, enum: ENTITY_TYPES, required: true, default: 'body' },

  parent: { type: Types.ObjectId, ref: 'GoverningBody', default: null },
  path: { type: String, required: true },
  depth: { type: Number, required: true, default: 0 },

  // Media references (now using unified Media model)
  media: [{ type: Types.ObjectId, ref: 'Media' }],
  primary_media: { type: Types.ObjectId, ref: 'Media' },

  identifiers: { type: IdentifierSchema, default: {} },
  metadata: { type: Map, of: Schema.Types.Mixed }
}, { timestamps: true });

GoverningBodySchema.index({ jurisdiction: 1, slug: 1 }, { unique: true });
GoverningBodySchema.index({ path: 1 }, { unique: true });
GoverningBodySchema.index({ branch: 1, entity_type: 1 });

// ------------------------------
// 5) District model
// Represents electoral districts, school districts, or other administrative divisions.
// ------------------------------
const DistrictSchema = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, lowercase: true, match: /^[a-z0-9-]+$/ },
  jurisdiction: { type: Types.ObjectId, ref: 'Jurisdiction', required: true },
  district_type: { type: String, enum: ['electoral', 'school', 'special', 'administrative'], required: true },
  
  boundaries: { type: String }, // GeoJSON or description
  population: { type: Number },
  
  // Media references (now using unified Media model)
  media: [{ type: Types.ObjectId, ref: 'Media' }],
  primary_media: { type: Types.ObjectId, ref: 'Media' },

  identifiers: { type: IdentifierSchema, default: {} },
  metadata: { type: Map, of: Schema.Types.Mixed }
}, { timestamps: true });

DistrictSchema.index({ jurisdiction: 1, district_type: 1 });
DistrictSchema.index({ slug: 1 }, { unique: true });

// ------------------------------
// 6) Office model
// Represents a position or role within a governing body that can be filled by a person.
// ------------------------------
const OfficeSchema = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, lowercase: true, match: /^[a-z0-9-]+$/ },
  governing_body: { type: Types.ObjectId, ref: 'GoverningBody', required: true },
  jurisdiction: { type: Types.ObjectId, ref: 'Jurisdiction', required: true },
  
  office_type: { type: String, enum: OFFICE_TYPES, required: true },
  term_length: { type: Number }, // in years
  term_limit: { type: Number }, // maximum consecutive terms
  
  // Media references (now using unified Media model)
  media: [{ type: Types.ObjectId, ref: 'Media' }],
  primary_media: { type: Types.ObjectId, ref: 'Media' },

  identifiers: { type: IdentifierSchema, default: {} },
  metadata: { type: Map, of: Schema.Types.Mixed }
}, { timestamps: true });

OfficeSchema.index({ governing_body: 1, slug: 1 }, { unique: true });
OfficeSchema.index({ jurisdiction: 1, office_type: 1 });

// ------------------------------
// 7) Position model
// Represents a person currently holding or who has held a specific office.
// ------------------------------
const PositionSchema = new Schema({
  office: { type: Types.ObjectId, ref: 'Office', required: true },
  person: { type: Types.ObjectId, ref: 'User', required: true },
  
  start_date: { type: Date, required: true },
  end_date: { type: Date },
  is_current: { type: Boolean, default: true },
  
  selection_method: { type: String, enum: SELECTION_METHODS, required: true },
  constituency: { type: String, enum: CONSTITUENCIES, default: 'general' },
  
  // Media references (now using unified Media model)
  media: [{ type: Types.ObjectId, ref: 'Media' }],
  primary_media: { type: Types.ObjectId, ref: 'Media' },

  identifiers: { type: IdentifierSchema, default: {} },
  metadata: { type: Map, of: Schema.Types.Mixed }
}, { timestamps: true });

PositionSchema.index({ office: 1, is_current: 1 });
PositionSchema.index({ person: 1, start_date: -1 });
PositionSchema.index({ start_date: 1, end_date: 1 });

// ------------------------------
// 8) Election model
// Represents elections for offices or ballot measures.
// ------------------------------
const ElectionSchema = new Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, lowercase: true, match: /^[a-z0-9-]+$/ },
  jurisdiction: { type: Types.ObjectId, ref: 'Jurisdiction', required: true },
  
  election_date: { type: Date, required: true },
  election_type: { type: String, enum: ['primary', 'general', 'special', 'runoff'], required: true },
  status: { type: String, enum: ['upcoming', 'active', 'completed', 'cancelled'], default: 'upcoming' },
  
  offices: [{ type: Types.ObjectId, ref: 'Office' }],
  ballot_measures: [{ type: Types.ObjectId, ref: 'BallotMeasure' }],
  
  // Media references (now using unified Media model)
  media: [{ type: Types.ObjectId, ref: 'Media' }],
  primary_media: { type: Types.ObjectId, ref: 'Media' },

  identifiers: { type: IdentifierSchema, default: {} },
  metadata: { type: Map, of: Schema.Types.Mixed }
}, { timestamps: true });

ElectionSchema.index({ jurisdiction: 1, election_date: 1 });
ElectionSchema.index({ status: 1, election_date: 1 });
ElectionSchema.index({ slug: 1 }, { unique: true });

// ------------------------------
// 9) Legislation model
// Represents bills, resolutions, ordinances, or other legislative actions.
// ------------------------------
const LegislationSchema = new Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, lowercase: true, match: /^[a-z0-9-]+$/ },
  governing_body: { type: Types.ObjectId, ref: 'GoverningBody', required: true },
  jurisdiction: { type: Types.ObjectId, ref: 'Jurisdiction', required: true },
  
  bill_number: { type: String, required: true },
  bill_type: { type: String, enum: ['bill', 'resolution', 'ordinance', 'proclamation'], required: true },
  status: { type: String, enum: ['introduced', 'in_committee', 'passed', 'failed', 'vetoed'], default: 'introduced' },
  
  introduced_date: { type: Date, required: true },
  summary: { type: String, trim: true, maxlength: 2000 },
  
  // Media references (now using unified Media model)
  media: [{ type: Types.ObjectId, ref: 'Media' }],
  primary_media: { type: Types.ObjectId, ref: 'Media' },

  identifiers: { type: IdentifierSchema, default: {} },
  metadata: { type: Map, of: Schema.Types.Mixed }
}, { timestamps: true });

LegislationSchema.index({ governing_body: 1, bill_number: 1 }, { unique: true });
LegislationSchema.index({ jurisdiction: 1, status: 1 });
LegislationSchema.index({ introduced_date: 1 });


// ------------------------------
// 11) Government Vote model
// Represents votes on legislation by government officials.
// ------------------------------
const GovernmentVoteSchema = new Schema({
  legislation: { type: Types.ObjectId, ref: 'Legislation', required: true },
  person: { type: Types.ObjectId, ref: 'User', required: true },
  position: { type: Types.ObjectId, ref: 'Position', required: true },
  
  vote_date: { type: Date, required: true },
  vote_position: { type: String, enum: ['yes', 'no', 'abstain', 'absent'], required: true },
  
  identifiers: { type: IdentifierSchema, default: {} },
  metadata: { type: Map, of: Schema.Types.Mixed }
}, { timestamps: true });

GovernmentVoteSchema.index({ legislation: 1, person: 1 }, { unique: true });
GovernmentVoteSchema.index({ person: 1, vote_date: 1 });
GovernmentVoteSchema.index({ vote_position: 1 });
GovernmentVoteSchema.index({ position: 1 });

// ------------------------------
// 12) Committee model
// Represents committees within governing bodies.
// ------------------------------
const CommitteeSchema = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, lowercase: true, match: /^[a-z0-9-]+$/ },
  governing_body: { type: Types.ObjectId, ref: 'GoverningBody', required: true },
  jurisdiction: { type: Types.ObjectId, ref: 'Jurisdiction', required: true },
  
  committee_type: { type: String, enum: ['standing', 'select', 'joint', 'conference', 'subcommittee'], required: true },
  is_permanent: { type: Boolean, default: true },
  
  chair: { type: Types.ObjectId, ref: 'User' }, // Using existing User model
  vice_chair: { type: Types.ObjectId, ref: 'User' },
  members: [{ type: Types.ObjectId, ref: 'User' }],
  
  // Media references (now using unified Media model)
  media: [{ type: Types.ObjectId, ref: 'Media' }],
  primary_media: { type: Types.ObjectId, ref: 'Media' },

  identifiers: { type: IdentifierSchema, default: {} },
  metadata: { type: Map, of: Schema.Types.Mixed }
}, { timestamps: true });

CommitteeSchema.index({ governing_body: 1, slug: 1 }, { unique: true });
CommitteeSchema.index({ jurisdiction: 1, committee_type: 1 });
CommitteeSchema.index({ chair: 1 });

// ------------------------------
// 13) Contact Information model
// Represents contact details for government entities and officials.
// ------------------------------
const ContactInfoSchema = new Schema({
  entity_type: { type: String, enum: ['jurisdiction', 'governing_body', 'office', 'person'], required: true },
  entity_id: { type: Types.ObjectId, required: true },
  
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zip: { type: String, trim: true },
    country: { type: String, trim: true, default: 'USA' }
  },
  
  phone: { type: String, trim: true },
  fax: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  website: { type: String, trim: true },
  
  social_media: {
    twitter: { type: String, trim: true },
    facebook: { type: String, trim: true },
    instagram: { type: String, trim: true },
    linkedin: { type: String, trim: true }
  },
  
  office_hours: { type: String, trim: true },
  
  identifiers: { type: IdentifierSchema, default: {} },
  metadata: { type: Map, of: Schema.Types.Mixed }
}, { timestamps: true });

ContactInfoSchema.index({ entity_type: 1, entity_id: 1 }, { unique: true });
ContactInfoSchema.index({ email: 1 });

// ------------------------------
// Export all models
// ------------------------------
module.exports = {
  Jurisdiction: mongoose.model('Jurisdiction', JurisdictionSchema),
  GoverningBody: mongoose.model('GoverningBody', GoverningBodySchema),
  District: mongoose.model('District', DistrictSchema),
  Office: mongoose.model('Office', OfficeSchema),
  Position: mongoose.model('Position', PositionSchema),
  Election: mongoose.model('Election', ElectionSchema),
  Legislation: mongoose.model('Legislation', LegislationSchema),
  GovernmentVote: mongoose.model('GovernmentVote', GovernmentVoteSchema),
  Committee: mongoose.model('Committee', CommitteeSchema),
  ContactInfo: mongoose.model('ContactInfo', ContactInfoSchema),
  
  // Constants for use in other parts of the application
  CONSTANTS: {
    LEVELS,
    BRANCHES,
    ENTITY_TYPES,
    SELECTION_METHODS,
    CONSTITUENCIES,
    OFFICE_TYPES,
    MEDIA_TYPES
  }
};
