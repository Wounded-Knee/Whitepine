# User Demographics and Political Identity API

## Overview
This document describes the new API endpoints for managing user demographic information and political identities. Users can now store detailed demographic data and link themselves to multiple political identities with ranking order.

## New User Fields

### Demographics
- **birthdate**: Date of birth (ISO 8601 format)
- **race**: Self-identified race/ethnicity (max 100 characters)
- **gender**: Self-identified gender (max 50 characters)
- **income**: Income bracket (enum values below)
- **religion**: Religious affiliation (max 100 characters)
- **politicalPriorities**: Array of political priorities ranked by importance (max 200 characters each)

### Income Brackets
- `under_25k`: Under $25,000
- `25k_50k`: $25,000 - $49,999
- `50k_75k`: $50,000 - $74,999
- `75k_100k`: $75,000 - $99,999
- `100k_150k`: $100,000 - $149,999
- `150k_200k`: $150,000 - $199,999
- `over_200k`: Over $200,000
- `prefer_not_to_say`: Prefer not to disclose

## Political Identity Management

### UserPoliticalIdentity Model
Users can be linked to multiple political identities with ranking order:

```json
{
  "userId": "ObjectId",
  "identityId": 1,
  "rank": 1,
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

- **rank**: Order of importance (1 = most applicable, higher numbers = less applicable)
- **identityId**: References the Identity model (political party, ideology, etc.)
- **isActive**: Soft delete flag

## API Endpoints

### Authentication
All endpoints require a valid JWT token with appropriate scopes.

### User Management

#### Update User Demographics
```http
PATCH /v1/users/:userId
Authorization: Bearer <token>
Content-Type: application/json

{
  "birthdate": "1990-01-01T00:00:00.000Z",
  "race": "White",
  "gender": "Male",
  "income": "50k_75k",
  "religion": "Christianity",
  "politicalPriorities": ["Healthcare", "Education", "Climate Change"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "userId",
    "username": "username",
    "email": "email@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "birthdate": "1990-01-01T00:00:00.000Z",
    "race": "White",
    "gender": "Male",
    "income": "50k_75k",
    "religion": "Christianity",
    "politicalPriorities": ["Healthcare", "Education", "Climate Change"],
    "bio": "User bio",
    "location": "User location",
    "website": "https://example.com",
    "roles": ["user"],
    "isActive": true,
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Political Identity Management

#### Get User Political Identities
```http
GET /v1/users/:userId/political-identities
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "politicalIdentityId",
      "userId": "userId",
      "identityId": 1,
      "rank": 1,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "identity": {
        "id": 1,
        "name": "Democrat",
        "slug": "democrat",
        "abbr": "D",
        "color": "#0000FF",
        "description": "Democratic Party affiliation"
      }
    }
  ]
}
```

#### Add Political Identity
```http
POST /v1/users/:userId/political-identities
Authorization: Bearer <token>
Content-Type: application/json

{
  "identityId": 1,
  "rank": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "politicalIdentityId",
    "userId": "userId",
    "identityId": 1,
    "rank": 1,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "identity": {
      "id": 1,
      "name": "Democrat",
      "slug": "democrat",
      "abbr": "D",
      "color": "#0000FF",
      "description": "Democratic Party affiliation"
    }
  }
}
```

#### Update All Political Identities (Bulk Update)
```http
PUT /v1/users/:userId/political-identities
Authorization: Bearer <token>
Content-Type: application/json

{
  "identities": [
    {
      "identityId": 1,
      "rank": 1
    },
    {
      "identityId": 3,
      "rank": 2
    },
    {
      "identityId": 5,
      "rank": 3
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "politicalIdentityId1",
      "userId": "userId",
      "identityId": 1,
      "rank": 1,
      "isActive": true,
      "identity": { /* identity details */ }
    },
    {
      "id": "politicalIdentityId2",
      "userId": "userId",
      "identityId": 3,
      "rank": 2,
      "isActive": true,
      "identity": { /* identity details */ }
    },
    {
      "id": "politicalIdentityId3",
      "userId": "userId",
      "identityId": 5,
      "rank": 3,
      "isActive": true,
      "identity": { /* identity details */ }
    }
  ]
}
```

#### Update Single Political Identity
```http
PATCH /v1/users/:userId/political-identities/:identityId
Authorization: Bearer <token>
Content-Type: application/json

{
  "rank": 2
}
```

#### Remove Political Identity
```http
DELETE /v1/users/:userId/political-identities/:identityId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Political identity removed successfully"
  }
}
```

## Validation Rules

### User Demographics
- **birthdate**: Must be a valid ISO 8601 date string
- **race**: Maximum 100 characters
- **gender**: Maximum 50 characters
- **income**: Must be one of the predefined enum values
- **religion**: Maximum 100 characters
- **politicalPriorities**: Array of strings, each maximum 200 characters

### Political Identities
- **identityId**: Must be a positive integer referencing an existing Identity
- **rank**: Must be a positive integer, unique per user
- **userId**: Must be a valid ObjectId referencing an existing User

## Error Handling

### Validation Errors (422)
```json
{
  "type": "${process.env.NEXT_PUBLIC_API_URL}/errors/validation",
  "title": "Validation failed",
  "status": 422,
  "detail": "Request validation failed",
  "instance": "/v1/users/userId/political-identities",
  "errors": {
    "identityId": ["Political identity already exists for this user"],
    "rank": ["Rank already taken by another political identity"]
  }
}
```

### Common Error Scenarios
- **Duplicate Identity**: User cannot have the same political identity twice
- **Duplicate Rank**: Each rank must be unique per user
- **Invalid Identity**: identityId must reference an existing Identity
- **Unauthorized**: User can only manage their own political identities

## Database Indexes

### User Model
- `birthdate` - For age-based queries
- `race` - For demographic analysis
- `gender` - For demographic analysis
- `income` - For income-based queries
- `religion` - For religious affiliation queries

### UserPoliticalIdentity Model
- `userId` - For user-specific queries
- `identityId` - For identity-specific queries
- `rank` - For ranking-based queries
- Compound index on `(userId, rank)` - Ensures unique ranking per user
- Compound index on `(userId, identityId)` - Ensures unique identity per user

## Usage Examples

### Frontend Integration

#### Setting User Demographics
```javascript
const updateDemographics = async (userId, demographics) => {
  const response = await fetch(`/v1/users/${userId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(demographics)
  });
  return response.json();
};

// Example usage
await updateDemographics(userId, {
  birthdate: '1990-01-01T00:00:00.000Z',
  race: 'White',
  gender: 'Male',
  income: '50k_75k',
  religion: 'Christianity',
  politicalPriorities: ['Healthcare', 'Education', 'Climate Change']
});
```

#### Managing Political Identities
```javascript
const updatePoliticalIdentities = async (userId, identities) => {
  const response = await fetch(`/v1/users/${userId}/political-identities`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ identities })
  });
  return response.json();
};

// Example usage
await updatePoliticalIdentities(userId, [
  { identityId: 1, rank: 1 },  // Democrat (most applicable)
  { identityId: 3, rank: 2 },  // Liberal (second most applicable)
  { identityId: 5, rank: 3 }   // Progressive (third most applicable)
]);
```

## Security Considerations

1. **Ownership**: Users can only manage their own demographic data and political identities
2. **Scope Requirements**: Appropriate scopes required for different operations
3. **Input Validation**: All inputs are validated using Zod schemas
4. **Soft Deletes**: Political identities are soft-deleted (isActive: false) rather than hard-deleted
5. **Transaction Safety**: Bulk updates use MongoDB transactions for data consistency

## Performance Considerations

1. **Indexed Fields**: All commonly queried fields are indexed
2. **Population**: Identity details are populated when retrieving political identities
3. **Pagination**: List endpoints support pagination for large datasets
4. **Field Selection**: GET endpoints support field selection to reduce data transfer

