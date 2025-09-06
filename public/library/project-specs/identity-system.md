# Identity System

## Overview
The Identity system provides a hierarchical classification of political identities and affiliations for the Whitepine application. It enables users to categorize themselves and others based on political beliefs, party affiliations, ideological positions, and cultural identities.

## Schema Design

### Core Fields
- **id**: Unique numeric identifier
- **parentId**: Reference to parent identity (null for top-level)
- **name**: Human-readable identity name
- **slug**: URL-friendly identifier
- **abbr**: Short abbreviation
- **color**: Hex color code for visual representation
- **description**: Detailed description of the identity
- **level**: Hierarchy depth (0 = top-level, 1 = subcategory, etc.)
- **path**: Array of IDs representing the full ancestry path
- **isActive**: Whether the identity is currently active

### Hierarchy Structure
The system supports unlimited nesting levels with automatic path calculation:
- **Level 0**: Top-level categories (Partisan, Ideological, Cultural/Issue-Based, etc.)
- **Level 1**: Major subcategories (Democrat, Republican, Liberal, Conservative, etc.)
- **Level 2+**: Specific identities (Liberal Democrat, Tea Party Conservative, etc.)

## Top-Level Categories

### 1. Partisan
Political party affiliations and independent statuses
- Democrat (Liberal, Progressive, Moderate, Establishment)
- Republican (Conservative, Moderate, Establishment, MAGA/Trump)
- Independent (Left-leaning, Right-leaning, Centrist)
- Third Party (Libertarian, Green, Constitution, Forward, No Labels)

### 2. Ideological
Political philosophy and belief systems
- Liberal/Progressive (Social Democrat, Democratic Socialist, Leftist)
- Conservative (Social, Fiscal, Religious)
- Moderate/Centrist
- Libertarian (Civil, Small Government)
- Populist (Left, Right)

### 3. Cultural/Issue-Based
Single-issue and cultural identity politics
- Feminist, Pro-Choice, Pro-Life
- Gun Rights, Environmental, Labor Union
- Civil Rights, Religious Right, Secular Progressive

### 4. Movement
Named political movements
- MAGA/Trump Republican
- Progressive Democrat/Berniecrat
- Tea Party Conservative
- Green New Deal/Climate Movement
- Libertarian Movement

### 5. Identity-As-Politics
Personal and group-based political identities
- Working-Class Voter, Suburban Mom Voter
- Rural Conservative, Urban Progressive
- Immigrant Rights Advocate, Veteran Voter
- Religious Voter (Catholic, Evangelical, Mormon, Other)

### 6. Anti-Identities
Rejection-based political identities
- Anti-Establishment, Anti-Partisan
- Anti-Elitist, Anti-Government
- Apolitical

### 7. Meta-Identities
Broad philosophical positions
- Patriot, Nationalist, Globalist
- Constitutionalist, Civil Libertarian
- Anarchist, Communist, Socialist, Capitalist

## API Endpoints

### Authentication Required
All endpoints require a valid JWT token with `identities:read` scope.

### GET /v1/identities
Retrieve identities with filtering and pagination
- **Query Parameters**:
  - `level`: Filter by hierarchy level
  - `parentId`: Filter by parent identity
  - `category`: Filter by top-level category slug
  - `search`: Search in name, description, or abbreviation
  - `limit`, `skip`: Pagination
  - `sortBy`, `sortOrder`: Sorting options

### GET /v1/identities/hierarchy
Get identities organized in hierarchical structure
- **Query Parameters**:
  - `category`: Optional category filter

### GET /v1/identities/categories
Get top-level identity categories

### GET /v1/identities/:id
Get specific identity by ID or slug
- **Parameters**:
  - `id`: Identity ID or slug

### GET /v1/identities/:id/descendants
Get all descendants of an identity

## Usage Examples

### Frontend Integration
```typescript
// Get all partisan identities
const partisanIdentities = await api.get('/v1/identities?category=partisan');

// Get hierarchy for display
const hierarchy = await api.get('/v1/identities/hierarchy');

// Search for specific identities
const searchResults = await api.get('/v1/identities?search=liberal');
```

### Database Queries
```javascript
// Find all Democrats
const democrats = await Identity.find({ path: { $in: [2] } });

// Find top-level categories
const categories = await Identity.find({ level: 0 });

// Find identities by level
const subcategories = await Identity.find({ level: 1 });
```

## Import and Maintenance

### Initial Import
```bash
npm run import:identities
```

### Data Updates
The import script automatically:
- Clears existing data
- Calculates hierarchy levels and paths
- Validates color codes
- Ensures unique slugs and IDs

### Adding New Identities
1. Add to the `identityData` array in `server/scripts/import-identities.js`
2. Run the import script
3. The system automatically calculates hierarchy

## Visual Representation

Each identity includes a color code for consistent visual representation across the application. Colors are chosen to be:
- Intuitive (e.g., blue for Democrats, red for Republicans)
- Accessible (sufficient contrast)
- Consistent within categories

## Future Enhancements

- **Weighting System**: Assign importance/strength to identity affiliations
- **Temporal Tracking**: Track how identities change over time
- **Geographic Variation**: Regional identity variations
- **Cross-Reference**: Link identities to policies, candidates, and issues
- **User Self-Identification**: Allow users to select multiple identities with confidence levels
