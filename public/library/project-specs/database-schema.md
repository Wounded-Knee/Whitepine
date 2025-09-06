# Complete Database Schema Documentation

## Overview

This document describes the complete database schema for the Whitepine application, covering all models including User management, Government entities, Obligations system, Claims, Evidence, Media management, and Political Identity systems.

## Core Design Principles

1. **Single Source of Truth**: All metrics come from materialized views, not embedded counters
2. **Enforced Relationships**: Clear parent-child relationships with validation
3. **Clean History**: Time-sliced records for historical data
4. **Performance**: Proper indexing and efficient query patterns
5. **Scalability**: Support for large datasets and high concurrency
6. **Polymorphic Design**: Flexible entity relationships through type-based references

## Database Models

### User Model

The central user entity with role-based access control and demographic information.

```javascript
const User = new Schema({
  username: { type: String, required: true, unique: true, minlength: 3, maxlength: 30, index: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  password: { type: String, minlength: 8, select: false }, // present only for local auth
  firstName: { type: String, required: true, maxlength: 50 },
  lastName: { type: String, required: true, maxlength: 50 },
  roles: [{ type: String, enum: ['user', 'moderator', 'admin', 'developer'], default: ['user'], index: true }],
  isActive: { type: Boolean, default: true, index: true },
  lastLogin: { type: Date, index: true },
  // Demographic fields
  birthdate: { type: Date, index: true },
  race: { type: String, maxlength: 100, index: true },
  gender: { type: String, maxlength: 50, index: true },
  income: { type: String, enum: ['under_25k', '25k_50k', '50k_75k', '75k_100k', '100k_150k', '150k_200k', 'over_200k', 'prefer_not_to_say'], index: true },
  religion: { type: String, maxlength: 100, index: true },
  politicalPriorities: [{ type: String, maxlength: 200 }],
  profile: {
    bio: { type: String, maxlength: 500 },
    location: { type: String, maxlength: 100 },
    website: { type: String, maxlength: 200 }
  },
  authProviders: { type: [AuthProvider], default: [] }
}, { timestamps: true });
```

**Key Features:**
- Role-based access control with predefined roles
- OAuth provider support via `authProviders` array
- Comprehensive demographic information
- Profile information in nested object
- Proper indexing for common queries

**Indexes:**
- `{ username: 1 }` (unique)
- `{ email: 1 }` (unique)
- `{ 'authProviders.provider': 1, 'authProviders.providerUserId': 1 }` (unique, sparse)
- `{ isActive: 1, roles: 1 }`
- `{ email: 1, isActive: 1 }`
- `{ birthdate: 1, isActive: 1 }`
- `{ race: 1, isActive: 1 }`
- `{ gender: 1, isActive: 1 }`
- `{ income: 1, isActive: 1 }`
- `{ religion: 1, isActive: 1 }`

### UserPoliticalIdentity Model

Links users to political identities with ranking system.

```javascript
const UserPoliticalIdentity = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  identityId: { type: Number, ref: 'Identity', required: true, index: true },
  rank: { type: Number, required: true, min: 1, index: true },
  isActive: { type: Boolean, default: true, index: true }
}, { timestamps: true });
```

**Key Features:**
- Links users to political identities
- Ranking system for identity importance
- Prevents duplicate identities per user
- Virtual population for identity details

**Indexes:**
- `{ userId: 1, rank: 1 }` (unique compound)
- `{ userId: 1, identityId: 1 }` (unique compound)

### Identity Model

Political identity taxonomy with hierarchical structure.

```javascript
const Identity = new Schema({
  id: { type: Number, required: true, unique: true, index: true },
  parentId: { type: Number, default: null, index: true },
  name: { type: String, required: true, maxlength: 100, index: true },
  slug: { type: String, required: true, unique: true, maxlength: 100, index: true },
  abbr: { type: String, required: true, maxlength: 20, index: true },
  color: { type: String, required: true, maxlength: 7, validate: { validator: function(v) { return /^#[0-9A-F]{6}$/i.test(v); } } },
  description: { type: String, required: true, maxlength: 500 },
  level: { type: Number, default: 0, index: true },
  path: { type: [Number], default: [] },
  isActive: { type: Boolean, default: true, index: true }
}, { timestamps: true });
```

**Key Features:**
- Hierarchical political identity structure
- Color coding for visual representation
- Path-based navigation
- Virtual relationships for parent/children

**Indexes:**
- `{ parentId: 1, isActive: 1 }`
- `{ level: 1, isActive: 1 }`
- `{ slug: 1, isActive: 1 }`
- `{ abbr: 1, isActive: 1 }`

### Role Model

Defines user roles and their associated scopes.

```javascript
const Role = new Schema({
  name: { type: String, unique: true, required: true },
  scopes: [{ type: String, required: true }],
  description: { type: String, maxlength: 500 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
```

**Default Roles:**
- **user**: Basic read access
- **moderator**: Content management
- **admin**: Full system access
- **developer**: Analytics access

### Taxonomy Model

Controlled categories and tags for petitions and other entities.

```javascript
const Taxonomy = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, lowercase: true, trim: true, unique: true },
  type: { type: String, enum: ['category', 'tag', 'topic'], required: true, index: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Taxonomy', index: true },
  description: { type: String, maxlength: 1000 },
  isActive: { type: Boolean, default: true, index: true }
}, { timestamps: true });
```

**Indexes:**
- `{ type: 1, isActive: 1 }`
- `{ parent: 1, isActive: 1 }`
- `{ slug: 1, type: 1 }`

## Government Entity Models

### Jurisdiction Model

Represents a governed geographic or corporate area.

```javascript
const JurisdictionSchema = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, lowercase: true, match: /^[a-z0-9-]+$/ },
  level: { type: String, enum: ['country', 'state', 'county', 'city', 'district', 'special'], required: true },
  entity_type: { type: String, enum: ['jurisdiction', 'body', 'office', 'position', 'election', 'legislation'], required: true, default: 'jurisdiction' },
  parent: { type: Types.ObjectId, ref: 'Jurisdiction', default: null },
  path: { type: String, required: true },
  depth: { type: Number, required: true, default: 0 },
  media: [{ type: Types.ObjectId, ref: 'Media' }],
  primary_media: { type: Types.ObjectId, ref: 'Media' },
  identifiers: { type: IdentifierSchema, default: {} },
  metadata: { type: Map, of: Schema.Types.Mixed }
}, { timestamps: true });
```

**Indexes:**
- `{ parent: 1, slug: 1 }` (unique)
- `{ path: 1 }` (unique)
- `{ level: 1 }`

### GoverningBody Model

Represents a legislative body, executive branch, judicial system, or other governing entity.

```javascript
const GoverningBodySchema = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, lowercase: true, match: /^[a-z0-9-]+$/ },
  jurisdiction: { type: Types.ObjectId, ref: 'Jurisdiction', required: true },
  branch: { type: String, enum: ['executive', 'legislative', 'judicial', 'administrative'], required: true },
  entity_type: { type: String, enum: ['jurisdiction', 'body', 'office', 'position', 'election', 'legislation'], required: true, default: 'body' },
  parent: { type: Types.ObjectId, ref: 'GoverningBody', default: null },
  path: { type: String, required: true },
  depth: { type: Number, required: true, default: 0 },
  media: [{ type: Types.ObjectId, ref: 'Media' }],
  primary_media: { type: Types.ObjectId, ref: 'Media' },
  identifiers: { type: IdentifierSchema, default: {} },
  metadata: { type: Map, of: Schema.Types.Mixed }
}, { timestamps: true });
```

**Indexes:**
- `{ jurisdiction: 1, slug: 1 }` (unique)
- `{ path: 1 }` (unique)
- `{ branch: 1, entity_type: 1 }`

### District Model

Represents electoral districts, school districts, or other administrative divisions.

```javascript
const DistrictSchema = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, lowercase: true, match: /^[a-z0-9-]+$/ },
  jurisdiction: { type: Types.ObjectId, ref: 'Jurisdiction', required: true },
  district_type: { type: String, enum: ['electoral', 'school', 'special', 'administrative'], required: true },
  boundaries: { type: String },
  population: { type: Number },
  media: [{ type: Types.ObjectId, ref: 'Media' }],
  primary_media: { type: Types.ObjectId, ref: 'Media' },
  identifiers: { type: IdentifierSchema, default: {} },
  metadata: { type: Map, of: Schema.Types.Mixed }
}, { timestamps: true });
```

**Indexes:**
- `{ jurisdiction: 1, district_type: 1 }`
- `{ slug: 1 }` (unique)

### Office Model

Represents a position or role within a governing body that can be filled by a person.

```javascript
const OfficeSchema = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, lowercase: true, match: /^[a-z0-9-]+$/ },
  governing_body: { type: Types.ObjectId, ref: 'GoverningBody', required: true },
  jurisdiction: { type: Types.ObjectId, ref: 'Jurisdiction', required: true },
  office_type: { type: String, enum: ['elected', 'appointed', 'civil_service', 'contract', 'volunteer'], required: true },
  term_length: { type: Number },
  term_limit: { type: Number },
  media: [{ type: Types.ObjectId, ref: 'Media' }],
  primary_media: { type: Types.ObjectId, ref: 'Media' },
  identifiers: { type: IdentifierSchema, default: {} },
  metadata: { type: Map, of: Schema.Types.Mixed }
}, { timestamps: true });
```

**Indexes:**
- `{ governing_body: 1, slug: 1 }` (unique)
- `{ jurisdiction: 1, office_type: 1 }`

### Position Model

Represents a person currently holding or who has held a specific office.

```javascript
const PositionSchema = new Schema({
  office: { type: Types.ObjectId, ref: 'Office', required: true },
  person: { type: Types.ObjectId, ref: 'Person', required: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date },
  is_current: { type: Boolean, default: true },
  selection_method: { type: String, enum: ['election', 'appointment', 'inheritance', 'merit', 'other'], required: true },
  constituency: { type: String, enum: ['general', 'district', 'ward', 'precinct', 'at-large'], default: 'general' },
  media: [{ type: Types.ObjectId, ref: 'Media' }],
  primary_media: { type: Types.ObjectId, ref: 'Media' },
  identifiers: { type: IdentifierSchema, default: {} },
  metadata: { type: Map, of: Schema.Types.Mixed }
}, { timestamps: true });
```

**Indexes:**
- `{ office: 1, is_current: 1 }`
- `{ person: 1, start_date: -1 }`
- `{ start_date: 1, end_date: 1 }`

### PositionTerm Model

Records who held a position and when, with overlap prevention.

```javascript
const PositionTerm = new Schema({
  position: { type: mongoose.Schema.Types.ObjectId, ref: 'Position', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  startDate: { type: Date, required: true, index: true },
  endDate: { type: Date },
  isCurrent: { type: Boolean, default: true, index: true }
}, { timestamps: true });
```

**Key Features:**
- Time-sliced records for clean history
- Prevents overlapping terms for same position
- Links office holders (Users) to positions

**Validation Hook:**
```javascript
PositionTerm.pre('save', async function(next) {
  // Prevent overlapping terms for same position
  const overlap = await this.model('PositionTerm').exists({
    position: this.position,
    _id: { $ne: this._id },
    $or: [
      { endDate: null, startDate: { $lte: this.endDate || new Date('9999-12-31') } },
      { endDate: { $gte: this.startDate } }
    ]
  });
  
  if (overlap) {
    return next(new Error('Overlapping terms for position'));
  }
  next();
});
```

### Election Model

Represents elections for offices or ballot measures.

```javascript
const ElectionSchema = new Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, lowercase: true, match: /^[a-z0-9-]+$/ },
  jurisdiction: { type: Types.ObjectId, ref: 'Jurisdiction', required: true },
  election_date: { type: Date, required: true },
  election_type: { type: String, enum: ['primary', 'general', 'special', 'runoff'], required: true },
  status: { type: String, enum: ['upcoming', 'active', 'completed', 'cancelled'], default: 'upcoming' },
  offices: [{ type: Types.ObjectId, ref: 'Office' }],
  ballot_measures: [{ type: Types.ObjectId, ref: 'BallotMeasure' }],
  media: [{ type: Types.ObjectId, ref: 'Media' }],
  primary_media: { type: Types.ObjectId, ref: 'Media' },
  identifiers: { type: IdentifierSchema, default: {} },
  metadata: { type: Map, of: Schema.Types.Mixed }
}, { timestamps: true });
```

**Indexes:**
- `{ jurisdiction: 1, election_date: 1 }`
- `{ status: 1, election_date: 1 }`
- `{ slug: 1 }` (unique)

### Legislation Model

Represents bills, resolutions, ordinances, or other legislative actions.

```javascript
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
  media: [{ type: Types.ObjectId, ref: 'Media' }],
  primary_media: { type: Types.ObjectId, ref: 'Media' },
  identifiers: { type: IdentifierSchema, default: {} },
  metadata: { type: Map, of: Schema.Types.Mixed }
}, { timestamps: true });
```

**Indexes:**
- `{ governing_body: 1, bill_number: 1 }` (unique)
- `{ jurisdiction: 1, status: 1 }`
- `{ introduced_date: 1 }`

### Person Model

Represents individuals who hold or have held positions.

```javascript
const PersonSchema = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, lowercase: true, match: /^[a-z0-9-]+$/ },
  party: { type: String, trim: true },
  bio: { type: String, trim: true, maxlength: 2000 },
  media: [{ type: Types.ObjectId, ref: 'Media' }],
  primary_media: { type: Types.ObjectId, ref: 'Media' },
  identifiers: { type: IdentifierSchema, default: {} },
  metadata: { type: Map, of: Schema.Types.Mixed }
}, { timestamps: true });
```

**Indexes:**
- `{ slug: 1 }` (unique)
- `{ party: 1 }`

### GovernmentVote Model

Represents votes on legislation by government officials.

```javascript
const GovernmentVoteSchema = new Schema({
  legislation: { type: Types.ObjectId, ref: 'Legislation', required: true },
  person: { type: Types.ObjectId, ref: 'Person', required: true },
  position: { type: Types.ObjectId, ref: 'Position', required: true },
  vote_date: { type: Date, required: true },
  vote_position: { type: String, enum: ['yes', 'no', 'abstain', 'absent'], required: true },
  identifiers: { type: IdentifierSchema, default: {} },
  metadata: { type: Map, of: Schema.Types.Mixed }
}, { timestamps: true });
```

**Indexes:**
- `{ legislation: 1, person: 1 }` (unique)
- `{ person: 1, vote_date: 1 }`
- `{ vote_position: 1 }`
- `{ position: 1 }`

### Committee Model

Represents committees within governing bodies.

```javascript
const CommitteeSchema = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, lowercase: true, match: /^[a-z0-9-]+$/ },
  governing_body: { type: Types.ObjectId, ref: 'GoverningBody', required: true },
  jurisdiction: { type: Types.ObjectId, ref: 'Jurisdiction', required: true },
  committee_type: { type: String, enum: ['standing', 'select', 'joint', 'conference', 'subcommittee'], required: true },
  is_permanent: { type: Boolean, default: true },
  chair: { type: Types.ObjectId, ref: 'User' },
  vice_chair: { type: Types.ObjectId, ref: 'User' },
  members: [{ type: Types.ObjectId, ref: 'User' }],
  media: [{ type: Types.ObjectId, ref: 'Media' }],
  primary_media: { type: Types.ObjectId, ref: 'Media' },
  identifiers: { type: IdentifierSchema, default: {} },
  metadata: { type: Map, of: Schema.Types.Mixed }
}, { timestamps: true });
```

**Indexes:**
- `{ governing_body: 1, slug: 1 }` (unique)
- `{ jurisdiction: 1, committee_type: 1 }`
- `{ chair: 1 }`

### ContactInfo Model

Represents contact details for government entities and officials.

```javascript
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
```

**Indexes:**
- `{ entity_type: 1, entity_id: 1 }` (unique)
- `{ email: 1 }`

## Obligations System Models

### Obligation Model (Base)

Base schema for all types of obligations with polymorphic inheritance.

```javascript
const ObligationSchema = new Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, required: true, maxlength: 5000 },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Taxonomy', required: true, index: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: { type: String, enum: ['pending', 'in_progress', 'completed', 'failed', 'cancelled'], default: 'pending', index: true },
  boundPartyType: { type: String, enum: ['governing body', 'office', 'position', 'legislation', 'jurisdiction', 'individual'], required: true, index: true },
  boundPartyId: { type: String, required: true, index: true },
  bindingPartyType: { type: String, enum: ['governing body', 'office', 'position', 'legislation', 'jurisdiction', 'individual'], required: true, index: true },
  bindingPartyId: { type: String, required: true, index: true },
  dueDate: { type: Date, index: true },
  tags: [{ type: String, trim: true, maxlength: 50 }]
}, { timestamps: true, discriminatorKey: 'obligationType' });
```

**Key Features:**
- Polymorphic inheritance using discriminator key
- Links to both bound and binding parties
- Status tracking for obligation lifecycle
- Category classification via Taxonomy

**Indexes:**
- `{ creator: 1, createdAt: -1 }`
- `{ status: 1, createdAt: -1 }`
- `{ boundPartyType: 1, status: 1 }`
- `{ bindingPartyType: 1, status: 1 }`
- `{ dueDate: 1, status: 1 }`
- `{ categoryId: 1, status: 1 }`
- `{ title: 'text', description: 'text' }`

### Promise Model

Specific obligation type for government promises and commitments.

```javascript
const PromiseSchema = new Schema({
  // Inherits all Obligation fields
  promiseType: { type: String, enum: ['campaign', 'policy', 'commitment', 'intention', 'legislative', 'executive', 'other'], required: true, index: true },
  evidence: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Evidence' }],
  lastActivity: { type: Date, default: Date.now, index: true }
}, { timestamps: true });
```

**Key Features:**
- Inherits all Obligation fields
- Links to Evidence for promise verification
- Tracks last activity for monitoring
- Categorized by promise type

## Claims and Evidence Models

### Claim Model

Represents claims made by users about government actions or inactions.

```javascript
const Claim = new Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, required: true, maxlength: 5000 },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Taxonomy', required: true, index: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: { type: String, enum: ['pending', 'investigating', 'verified', 'disputed', 'resolved'], default: 'pending', index: true },
  claimType: { type: String, enum: ['factual', 'promise', 'policy', 'action', 'other'], required: true, index: true },
  targetEntityType: { type: String, enum: ['governing body', 'office', 'position', 'legislation', 'jurisdiction', 'individual'], required: true, index: true },
  targetEntityId: { type: String, required: true, index: true },
  evidence: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Evidence' }],
  tags: [{ type: String, trim: true, maxlength: 50 }]
}, { timestamps: true });
```

**Key Features:**
- Links to Evidence for claim verification
- Targets specific government entities
- Status tracking for investigation process
- Category classification

### Evidence Model

Stores evidence supporting or refuting claims and promises.

```javascript
const Evidence = new Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, required: true, maxlength: 5000 },
  evidenceType: { type: String, enum: ['document', 'video', 'audio', 'image', 'testimony', 'data', 'other'], required: true, index: true },
  source: { type: String, required: true, maxlength: 500 },
  sourceUrl: { type: String, maxlength: 1000 },
  sourceDate: { type: Date, index: true },
  reliability: { type: String, enum: ['high', 'medium', 'low'], default: 'medium', index: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  media: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Media' }],
  isActive: { type: Boolean, default: true, index: true }
}, { timestamps: true });
```

**Key Features:**
- Multiple evidence types supported
- Source tracking and reliability assessment
- Links to Media for file storage
- Creator attribution

## Media Management Model

### Media Model

Unified media storage for all entity types.

```javascript
const Media = new Schema({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mediaType: { type: String, enum: ['image', 'document', 'video'], required: true, index: true },
  bytes: { type: Number, required: true },
  mime: { type: String, required: true },
  url: { type: String, required: true },
  description: { type: String, maxlength: 500 },
  isPrimary: { type: Boolean, default: false, index: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  entityType: { type: String, enum: ['User', 'Petition', 'Jurisdiction', 'GoverningBody', 'Office', 'Position', 'Legislation'], required: true, index: true },
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  isActive: { type: Boolean, default: true, index: true }
}, { timestamps: true });
```

**Key Features:**
- Single polymorphic reference via `entityType` and `entityId`
- Supports all entity types
- Primary media designation
- File metadata storage

**Indexes:**
- `{ entityType: 1, entityId: 1, createdAt: -1 }`
- `{ uploadedBy: 1, createdAt: -1 }`
- `{ mediaType: 1, isActive: 1 }`
- `{ isPrimary: 1, entityType: 1, entityId: 1 }`

## Database Relationships

### Core Relationships

```
User (1) ←→ (1) UserPoliticalIdentity (1) ←→ (1) Identity
  ↓
  ↓
PositionTerm (1) ←→ (1) Position (1) ←→ (1) Office (1) ←→ (1) GoverningBody (1) ←→ (1) Jurisdiction
  ↓
  ↓
  ↓
Legislation ←→ GovernmentVote ←→ Person
  ↓
  ↓
Obligation ←→ Promise ←→ Evidence ←→ Media
  ↓
  ↓
Claim ←→ Evidence ←→ Media
```

### Key Constraints

1. **Position Term Overlap**: No overlapping terms for same position
2. **Slug Uniqueness**: Unique within parent scope for government entities
3. **Media Polymorphism**: Single reference system for all entity types
4. **Identity Ranking**: Unique ranking per user per identity
5. **Evidence Attribution**: All evidence linked to creators

## Indexing Strategy

### Performance Indexes

- **Common List Views**: `{ jurisdiction: 1, status: 1, createdAt: -1 }`
- **User Activity**: `{ user: 1, createdAt: -1 }`
- **Government Hierarchy**: `{ parent: 1, slug: 1 }` (unique)
- **Media Queries**: `{ entityType: 1, entityId: 1, createdAt: -1 }`
- **Political Identity**: `{ userId: 1, rank: 1 }` (unique)

### Unique Constraints

- User: `username`, `email`
- Jurisdiction: `{ slug: 1, parent: 1 }`
- GoverningBody: `{ jurisdiction: 1, slug: 1 }`
- Office: `{ governingBody: 1, slug: 1 }`
- Legislation: `{ governing_body: 1, bill_number: 1 }`
- UserPoliticalIdentity: `{ userId: 1, rank: 1 }`, `{ userId: 1, identityId: 1 }`

## Data Consistency

### Validation Hooks

- **Pre-save Validation**: Ensures data integrity before storage
- **Relationship Validation**: Verifies foreign key consistency
- **Business Rule Enforcement**: Prevents invalid data states
- **Overlap Prevention**: Prevents conflicting time periods

### Polymorphic Design

- **Media System**: Single model handles all entity types
- **Obligation System**: Base schema with type-specific extensions
- **Government Entities**: Consistent structure across all levels

## Security Features

### Data Protection

- **Input Validation**: Schema-level validation rules
- **Access Control**: Role-based permissions
- **Audit Trail**: Timestamps and user tracking
- **Soft Deletion**: `isActive` flags for data retention

### Audit Trail

- **Timestamps**: Automatic `createdAt` and `updatedAt`
- **User Tracking**: `uploadedBy` and ownership fields
- **Change Logging**: Track important data modifications

## Future Enhancements

### Planned Features

1. **Advanced Analytics**: Machine learning for political identity analysis
2. **Real-time Updates**: WebSocket support for live data
3. **Data Export**: Bulk data export capabilities
4. **Advanced Search**: Full-text search with ranking
5. **Data Archiving**: Long-term storage strategies

### Scalability Improvements

1. **Sharding**: Horizontal scaling for large datasets
2. **Read Replicas**: Separate read/write operations
3. **Connection Pooling**: Optimize database connections
4. **Query Optimization**: Advanced indexing strategies

## Conclusion

The complete database schema provides:

- **Comprehensive Coverage**: All major system components represented
- **Flexible Architecture**: Polymorphic design for extensibility
- **Government Focus**: Specialized models for political/government data
- **Evidence System**: Robust claim verification infrastructure
- **Media Management**: Unified file handling across all entities
- **Political Identity**: Sophisticated user political affiliation tracking

This foundation supports the application's growth while maintaining data consistency, performance, and extensibility for future government transparency and civic engagement features.

