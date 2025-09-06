# Database Model Audit Report
## US Government Structure Modeling

### Executive Summary
The current database models provide a solid foundation for modeling US government structure, but several critical relationships and constraints need to be addressed to ensure proper representation of government hierarchies and relationships.

---

## Current Model Analysis

### ✅ **Strengths**

1. **Hierarchical Structure**: Proper implementation of adjacency list (`parent`) and materialized path (`path`, `depth`) for jurisdictions and governing bodies
2. **Media Integration**: Comprehensive media support across all entities
3. **Flexible Metadata**: Extensible metadata fields for future requirements
4. **Proper Indexing**: Good indexing strategy for performance
5. **User Integration**: Proper use of existing User model for persons

### ⚠️ **Critical Issues Identified**

#### 1. **Office Model Relationship Issues**

**Problem**: Office model has conflicting relationship requirements
```javascript
// Current problematic structure:
governing_body: { type: Types.ObjectId, ref: 'GoverningBody', required: false },
jurisdiction: { type: Types.ObjectId, ref: 'Jurisdiction', required: true },
```

**Issues**:
- Offices can exist without a governing body (required: false)
- This creates ambiguity about where the office belongs
- Some offices (like President, Governor) belong to jurisdictions directly
- Other offices (like Senators, Representatives) belong to governing bodies

**Solution**: Implement proper relationship hierarchy

#### 2. **Missing Critical Relationships**

**Missing Relationships**:
- **Elections to Districts**: Elections should reference specific districts
- **Positions to Elections**: Positions should reference the election that created them
- **Legislation to Committees**: Legislation should track committee assignments
- **Votes to Positions**: GovernmentVote should reference the position, not just the person

#### 3. **Inconsistent Entity Type Handling**

**Problem**: Different models use different approaches for entity types
- Jurisdiction: `entity_type` field
- GoverningBody: `entity_type` field  
- Office: `office_type` field (different naming)

#### 4. **Missing Validation Constraints**

**Missing Validations**:
- Term dates validation (term_end > term_start)
- Election date validation (election_date should be in the past for completed elections)
- Position uniqueness during overlapping terms

---

## Recommended Improvements

### 1. **Fix Office Model Relationships**

```javascript
const OfficeSchema = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, lowercase: true, match: /^[a-z0-9-]+$/ },
  office_type: { type: String, enum: OFFICE_TYPES, required: true },
  
  // Relationship hierarchy - one must be specified
  governing_body: { type: Types.ObjectId, ref: 'GoverningBody' },
  jurisdiction: { type: Types.ObjectId, ref: 'Jurisdiction' },
  
  // Validation: Either governing_body OR jurisdiction must be specified
  // (implemented via custom validation)
  
  constituency: { type: String, enum: CONSTITUENCIES, default: 'at_large' },
  district: { type: Types.ObjectId, ref: 'District' }, // NEW: Reference to specific district
  
  selection_method: { type: String, enum: SELECTION_METHODS, required: true },
  term_length: { type: Number }, // in months
  term_limit: { type: Number }, // maximum terms
  salary: { type: Number },
  is_part_time: { type: Boolean, default: false },
  
  // Media references
  media: [{ type: Types.ObjectId, ref: 'Media' }],
  primary_media: { type: Types.ObjectId, ref: 'Media' },
  
  identifiers: { type: IdentifierSchema, default: {} },
  metadata: { type: Map, of: Schema.Types.Mixed }
}, { timestamps: true });

// Custom validation for office relationships
OfficeSchema.pre('validate', function(next) {
  if (!this.governing_body && !this.jurisdiction) {
    return next(new Error('Office must belong to either a governing body or jurisdiction'));
  }
  if (this.governing_body && this.jurisdiction) {
    return next(new Error('Office cannot belong to both governing body and jurisdiction'));
  }
  next();
});
```

### 2. **Enhance Election Model**

```javascript
const ElectionSchema = new Schema({
  office: { type: Types.ObjectId, ref: 'Office', required: true },
  jurisdiction: { type: Types.ObjectId, ref: 'Jurisdiction', required: true },
  district: { type: Types.ObjectId, ref: 'District' }, // NEW: Specific district for district-based elections
  
  election_date: { type: Date, required: true },
  election_type: { type: String, enum: ['primary', 'general', 'special', 'runoff'], required: true },
  is_partisan: { type: Boolean, default: true },
  
  // NEW: Election status
  status: { type: String, enum: ['scheduled', 'in_progress', 'completed', 'cancelled'], default: 'scheduled' },
  
  candidates: [{
    person: { type: Types.ObjectId, ref: 'User', required: true },
    party: { type: String, trim: true },
    is_incumbent: { type: Boolean, default: false },
    votes_received: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    is_winner: { type: Boolean, default: false }
  }],
  
  total_votes_cast: { type: Number, default: 0 },
  voter_turnout: { type: Number, default: 0 }, // percentage
  
  identifiers: { type: IdentifierSchema, default: {} },
  metadata: { type: Map, of: Schema.Types.Mixed }
}, { timestamps: true });

// Validation: Election date should be in the past for completed elections
ElectionSchema.pre('validate', function(next) {
  if (this.status === 'completed' && this.election_date > new Date()) {
    return next(new Error('Completed elections cannot have future dates'));
  }
  next();
});
```

### 3. **Enhance Position Model**

```javascript
const PositionSchema = new Schema({
  office: { type: Types.ObjectId, ref: 'Office', required: true },
  person: { type: Types.ObjectId, ref: 'User', required: true },
  
  // NEW: Reference to the election that created this position
  election: { type: Types.ObjectId, ref: 'Election' },
  
  term_start: { type: Date, required: true },
  term_end: { type: Date },
  is_current: { type: Boolean, default: true },
  
  party: { type: String, trim: true },
  campaign_funding: { type: Number },
  
  // NEW: Position status
  status: { type: String, enum: ['active', 'inactive', 'resigned', 'removed'], default: 'active' },
  
  // Media references
  media: [{ type: Types.ObjectId, ref: 'Media' }],
  primary_media: { type: Types.ObjectId, ref: 'Media' },
  
  identifiers: { type: IdentifierSchema, default: {} },
  metadata: { type: Map, of: Schema.Types.Mixed }
}, { timestamps: true });

// Validation: Term dates and current position uniqueness
PositionSchema.pre('validate', function(next) {
  if (this.term_end && this.term_end <= this.term_start) {
    return next(new Error('Term end date must be after term start date'));
  }
  next();
});
```

### 4. **Enhance Legislation Model**

```javascript
const LegislationSchema = new Schema({
  title: { type: String, required: true, trim: true },
  bill_number: { type: String, required: true, trim: true },
  governing_body: { type: Types.ObjectId, ref: 'GoverningBody', required: true },
  jurisdiction: { type: Types.ObjectId, ref: 'Jurisdiction', required: true },
  
  // NEW: Committee assignments
  committees: [{
    committee: { type: Types.ObjectId, ref: 'Committee', required: true },
    assignment_date: { type: Date, default: Date.now },
    status: { type: String, enum: ['assigned', 'reported', 'tabled'], default: 'assigned' }
  }],
  
  legislation_type: { type: String, enum: ['bill', 'resolution', 'amendment', 'proclamation', 'executive_order'], required: true },
  status: { type: String, enum: ['introduced', 'in_committee', 'passed_chamber', 'passed_both', 'signed', 'vetoed', 'failed', 'withdrawn'], required: true },
  
  introduced_date: { type: Date, required: true },
  passed_date: { type: Date },
  effective_date: { type: Date },
  
  sponsors: [{ type: Types.ObjectId, ref: 'User' }],
  cosponsors: [{ type: Types.ObjectId, ref: 'User' }],
  
  summary: { type: String },
  full_text: { type: String },
  
  identifiers: { type: IdentifierSchema, default: {} },
  metadata: { type: Map, of: Schema.Types.Mixed }
}, { timestamps: true });
```

### 5. **Enhance GovernmentVote Model**

```javascript
const GovernmentVoteSchema = new Schema({
  legislation: { type: Types.ObjectId, ref: 'Legislation', required: true },
  person: { type: Types.ObjectId, ref: 'User', required: true },
  position: { type: Types.ObjectId, ref: 'Position', required: true }, // NEW: Reference to position
  governing_body: { type: Types.ObjectId, ref: 'GoverningBody', required: true },
  
  vote_date: { type: Date, required: true },
  vote_position: { type: String, enum: ['yes', 'no', 'abstain', 'absent', 'present'], required: true },
  
  identifiers: { type: IdentifierSchema, default: {} },
  metadata: { type: Map, of: Schema.Types.Mixed }
}, { timestamps: true });
```

### 6. **Add Missing Models**

#### **LegislationVote Model** (for roll call votes)
```javascript
const LegislationVoteSchema = new Schema({
  legislation: { type: Types.ObjectId, ref: 'Legislation', required: true },
  governing_body: { type: Types.ObjectId, ref: 'GoverningBody', required: true },
  
  vote_date: { type: Date, required: true },
  vote_type: { type: String, enum: ['roll_call', 'voice', 'unanimous_consent'], required: true },
  
  // Vote results
  yes_votes: { type: Number, default: 0 },
  no_votes: { type: Number, default: 0 },
  abstentions: { type: Number, default: 0 },
  absences: { type: Number, default: 0 },
  
  // Individual votes (reference to GovernmentVote)
  individual_votes: [{ type: Types.ObjectId, ref: 'GovernmentVote' }],
  
  identifiers: { type: IdentifierSchema, default: {} },
  metadata: { type: Map, of: Schema.Types.Mixed }
}, { timestamps: true });
```

#### **Term Model** (for tracking office terms)
```javascript
const TermSchema = new Schema({
  office: { type: Types.ObjectId, ref: 'Office', required: true },
  position: { type: Types.ObjectId, ref: 'Position', required: true },
  
  term_number: { type: Number, required: true }, // 1st term, 2nd term, etc.
  term_start: { type: Date, required: true },
  term_end: { type: Date },
  
  // Term status
  status: { type: String, enum: ['active', 'completed', 'interrupted'], default: 'active' },
  
  // How the term ended
  end_reason: { type: String, enum: ['election', 'resignation', 'removal', 'death', 'term_limit'], default: 'election' },
  
  identifiers: { type: IdentifierSchema, default: {} },
  metadata: { type: Map, of: Schema.Types.Mixed }
}, { timestamps: true });
```

---

## Implementation Priority

### **High Priority (Critical Fixes)**
1. Fix Office model relationships and validation
2. Add district references to elections and offices
3. Add position references to GovernmentVote
4. Implement proper date validations

### **Medium Priority (Important Enhancements)**
1. Add LegislationVote model for roll call votes
2. Add Term model for better term tracking
3. Enhance legislation with committee assignments
4. Add election status tracking

### **Low Priority (Nice to Have)**
1. Add more granular status tracking
2. Implement audit trails for changes
3. Add versioning for legislation text
4. Enhance metadata schemas

---

## Testing Recommendations

1. **Relationship Integrity Tests**: Ensure all foreign key relationships are properly maintained
2. **Validation Tests**: Test all custom validations work correctly
3. **Hierarchy Tests**: Verify jurisdiction and governing body hierarchies are properly maintained
4. **Data Migration Tests**: Test migration of existing data to new schema
5. **Performance Tests**: Verify indexing strategy works for common queries

---

## Conclusion

The current database models provide a solid foundation but require several critical improvements to properly model US government relationships. The most important fixes involve:

1. **Clarifying Office relationships** (governing body vs jurisdiction)
2. **Adding missing district references** for proper electoral representation
3. **Enhancing position tracking** with election references
4. **Improving vote tracking** with position references

These changes will create a more accurate and useful representation of US government structure while maintaining the flexibility needed for various government entities.
