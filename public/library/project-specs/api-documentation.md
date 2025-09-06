# API Documentation - v1

## Overview

This document describes the v1 API for the Whitepine application, which has been completely refactored for better data consistency, performance, and maintainability.

## Base URL

```
http://localhost:5000/v1
```

## Authentication

### JWT Token System
- **Access Token**: 15-minute expiration, sent in `Authorization: Bearer <token>` header
- **Refresh Token**: 7-day expiration, stored in HTTP-only cookie
- **Token Rotation**: Automatic refresh with new tokens on each refresh

### Role-Based Access Control (RBAC)
Users have roles that grant specific scopes:

- **user**: Basic read access
- **moderator**: Content management access
- **admin**: Full system access
- **developer**: Analytics and development access

### Scopes
Fine-grained permissions for different operations:
- `users:read`, `users:write`
- `petitions:read`, `petitions:write`
- `votes:read`, `votes:write`
- `vigor:read`, `vigor:write` (REMOVED - vigor system simplified)
- `media:read`, `media:write`
- `gov:read`, `gov:write`
- `roles:assign`

## Core Endpoints

### Authentication

#### POST /v1/auth/register
Create a new user account.

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string"
}
```

**Response:**
```json
{
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "firstName": "string",
      "lastName": "string",
      "roles": ["string"],
      "scopes": ["string"],
      "createdAt": "string"
    },
    "accessToken": "string"
  }
}
```

#### POST /v1/auth/login
Authenticate user with email/username and password.

**Request Body:**
```json
{
  "identifier": "string", // email or username
  "password": "string"
}
```

**Response:**
```json
{
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "firstName": "string",
      "lastName": "string",
      "roles": ["string"],
      "scopes": ["string"],
      "lastLogin": "string"
    },
    "accessToken": "string"
  }
}
```

#### POST /v1/auth/refresh
Refresh access token using refresh token from cookie.

**Response:**
```json
{
  "data": {
    "accessToken": "string"
  }
}
```

#### POST /v1/auth/logout
Logout user and invalidate refresh token.

#### GET /v1/auth/me
Get current user profile and permissions.

**Response:**
```json
{
  "data": {
    "id": "string",
    "username": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "roles": ["string"],
    "scopes": ["string"],
    "profile": {
      "bio": "string",
      "location": "string",
      "website": "string"
    },
    "isActive": "boolean",
    "lastLogin": "string",
    "createdAt": "string"
  }
}
```

### Petitions

#### GET /v1/petitions
List petitions with filtering, sorting, and pagination.

**Query Parameters:**
- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 20, max: 100)
- `filter[categoryId]`: Filter by category ID
- `filter[status]`: Filter by status (draft, active, closed, archived)
- `filter[creator]`: Filter by creator user ID
- `filter[jurisdictionId]`: Filter by jurisdiction ID
- `filter[governingBodyId]`: Filter by governing body ID
- `filter[legislationId]`: Filter by legislation ID
- `sort`: Sort field (e.g., "createdAt", "-createdAt", "trending")
- `fields`: Comma-separated fields to include

**Response:**
```json
{
  "data": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "categoryId": "string",
      "creator": {
        "id": "string",
        "username": "string",
        "firstName": "string",
        "lastName": "string"
      },
      "jurisdiction": {
        "id": "string",
        "name": "string",
        "slug": "string"
      },
      "governingBody": {
        "id": "string",
        "name": "string",
        "slug": "string"
      },
      "legislation": {
        "id": "string",
        "title": "string",
        "bill_number": "string"
      },
      "status": "string",
      "tags": ["string"],
      "snapshot": {
        "voteCount": "number",
        "totalVigor": "number (REMOVED)"
      },
      "createdAt": "string",
      "updatedAt": "string"
    }
  ],
  "meta": {
    "page": "number",
    "page_size": "number",
    "total": "number",
    "total_pages": "number"
  }
}
```

#### POST /v1/petitions
Create a new petition.

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "category": "string", // Will be mapped to categoryId
  "jurisdictionId": "string",
  "governingBodyId": "string",
  "legislationId": "string",
  "tags": ["string"]
}
```

**Required Scopes:** `petitions:write`

#### GET /v1/petitions/:petitionId
Get a specific petition by ID.

#### PATCH /v1/petitions/:petitionId
Update a petition.

**Required Scopes:** `petitions:write` + ownership

#### DELETE /v1/petitions/:petitionId
Delete a petition.

**Required Scopes:** `petitions:write` + ownership

### Votes

#### GET /v1/petitions/:petitionId/votes
List votes for a petition.

**Query Parameters:**
- `page`: Page number
- `page_size`: Items per page
- `filter[userId]`: Filter by user ID

#### POST /v1/petitions/:petitionId/votes
Cast a vote on a petition (idempotent).

**Request Body:**
```json
{
  "signingStatement": "string"
}
```

**Required Scopes:** `votes:write`

**Notes:**
- One vote per user per petition (enforced by unique constraint)
- Returns 409 Conflict if user already voted
- Automatically updates petition metrics

#### GET /v1/petitions/:petitionId/votes/:voteId
Get a specific vote.

### Vigor (REMOVED)

The vigor system has been simplified to focus on core obligation functionality.

**Note:**
- Vigor components and endpoints have been removed
- Core petition/obligation functionality remains intact

### Media

#### GET /v1/media
List media files with filtering.

**Query Parameters:**
- `page`: Page number
- `page_size`: Items per page
- `filter[entityType]`: Filter by entity type (User, Petition, Jurisdiction, etc.)
- `filter[entityId]`: Filter by entity ID
- `filter[mediaType]`: Filter by media type (image, document, video)

#### POST /v1/media
Upload a new media file.

**Request Body:** Multipart form data
- `file`: File to upload
- `entityType`: Type of entity (User, Petition, etc.)
- `entityId`: ID of the entity
- `description`: Optional description
- `isPrimary`: Whether this is the primary media for the entity

**Required Scopes:** `media:write`

### Government Data

#### GET /v1/gov/jurisdictions
List jurisdictions with hierarchy support.

#### GET /v1/gov/governing-bodies
List governing bodies within jurisdictions.

#### GET /v1/gov/offices
List offices within governing bodies.

#### GET /v1/gov/positions
List positions (seats) within offices.

#### GET /v1/gov/position-terms
List position terms (office holders) with time-based filtering.

#### GET /v1/gov/legislation
List legislation with status tracking.


### Users

#### GET /v1/users
List users with filtering and pagination.

**Required Scopes:** `users:read`

#### GET /v1/users/:userId
Get user profile.

#### PATCH /v1/users/:userId
Update user profile.

**Required Scopes:** `users:write` + ownership

#### GET /v1/users/:userId/roles
Get user roles.

#### PUT /v1/users/:userId/roles
Update user roles.

**Required Scopes:** `roles:assign`

### Roles

#### GET /v1/roles
List available roles and their scopes.

## Response Format

### Success Response
```json
{
  "data": "response data",
  "meta": {
    "page": "number",
    "page_size": "number",
    "total": "number"
  }
}
```

### Error Response (RFC 7807)
```json
{
  "type": "${process.env.NEXT_PUBLIC_API_URL}/errors/validation",
  "title": "Validation failed",
  "status": 422,
  "detail": "Request validation failed",
  "instance": "/v1/petitions",
  "errors": {
    "field": ["error message"]
  }
}
```

## Pagination

The API supports both page-based and cursor-based pagination:

### Page-based (Default)
- `page`: Page number starting from 1
- `page_size`: Items per page (1-100)

### Cursor-based
- `cursor`: Opaque cursor string
- `limit`: Maximum items to return

## Filtering

Filters use the `filter[field]` syntax:
```
GET /v1/petitions?filter[status]=active&filter[categoryId]=123
```

## Sorting

Sort fields can be prefixed with `-` for descending order:
```
GET /v1/petitions?sort=-createdAt
GET /v1/petitions?sort=trending
```

## Field Selection

Use the `fields` parameter to limit returned fields:
```
GET /v1/petitions?fields=title,creator.username,createdAt
```

## Rate Limiting

- **General endpoints**: 100 requests per minute per IP
- **Authentication endpoints**: 10 requests per minute per IP
- **Upload endpoints**: 20 requests per minute per IP

## Security Features

- **HTTPS enforcement** in production
- **CORS** with strict origin validation
- **Security headers** (HSTS, CSP, X-Frame-Options)
- **Input validation** with Zod schemas
- **SQL injection protection** via Mongoose
- **XSS protection** via content sanitization

## Migration Notes

### Breaking Changes from Legacy API
1. **Base URL**: Changed from `/api` to `/v1`
2. **Petition fields**: `category` → `categoryId`, `isActive` → `status`
3. **Vigor creation**: REMOVED (vigor system simplified)
4. **Response structure**: Updated to include `data` wrapper and `meta` information
5. **Authentication**: Enhanced with roles and scopes

### Deprecated Endpoints
- `/api/auth/google` → Use `/v1/auth/oauth/google`
- `/api/petitions/legislation` → Use `/v1/gov/legislation`
- `/api/users/:id/avatar` → Use `/v1/media` with entityType="User"

## Testing

### Test New Models
```bash
npm run test:models
```

### Run Migration
```bash
npm run migrate
```

### Start Development Server
```bash
npm run dev:full
```

## Support

For API support and questions:
- Check the migration documentation
- Review the data model refactor documentation
- Test with the provided test scripts
