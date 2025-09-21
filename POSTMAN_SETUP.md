# White Pine API - Postman Collection

This directory contains Postman collection and environment files for the White Pine API.

## Files

- `WhitePine-API.postman_collection.json` - Main API collection with all endpoints
- `WhitePine-Environments.postman_environment.json` - Local development environment
- `WhitePine-Production.postman_environment.json` - Production environment
- `WhitePine-Development.postman_environment.json` - Development server environment

## Setup Instructions

### 1. Import Collection and Environments

1. Open Postman
2. Click "Import" button
3. Import all four JSON files:
   - Collection: `WhitePine-API.postman_collection.json`
   - Environments: All three environment files

### 2. Environment Configuration

The collection includes three environments:

#### Local Development
- **Base URL**: `http://localhost:4000`
- **API URL**: `http://localhost:4000/api`
- Use this for local development testing

#### Development Server
- **Base URL**: `https://whitepinedev.jpkramer.com`
- **API URL**: `https://whitepinedev.jpkramer.com/api`
- **Auth**: HTTP Basic Auth (username: `dev`)
- Use this for testing on the development server

#### Production
- **Base URL**: `https://whitepine.jpkramer.com`
- **API URL**: `https://whitepine.jpkramer.com/api`
- Use this for production testing (be careful!)

### 3. Authentication

The API uses Google OAuth for authentication:

1. **Login**: Use the "Google OAuth Login" endpoint to authenticate
2. **Session**: After successful authentication, the session cookie will be automatically included in subsequent requests
3. **Manual Auth**: For development, you can manually set session cookies in the request headers

### 4. Key Endpoints

#### Health & Info
- `GET /health` - Health check
- `GET /` - API information and available endpoints

#### Authentication
- `GET /auth/google` - Start Google OAuth flow
- `GET /auth/me` - Get current user info
- `GET /auth/logout` - Logout

#### Nodes
- `GET /api/nodes` - List nodes with filtering
- `POST /api/nodes` - Create new node
- `GET /api/nodes/:id` - Get specific node
- `PUT /api/nodes/:id` - Update node
- `DELETE /api/nodes/:id` - Soft delete node
- `POST /api/nodes/:id/restore` - Restore deleted node

#### Synapses (Relationships)
- `GET /api/nodes/synapses` - List synapses
- `GET /api/nodes/synapses/node/:nodeId` - Get synapses for a node
- `POST /api/nodes/with-relationship` - Create node with relationship

#### Avatars
- `GET /api/avatars/:filename` - Serve avatar image
- `POST /api/avatars/upload` - Upload custom avatar
- `PUT /api/avatars/update` - Update avatar URL
- `DELETE /api/avatars/remove` - Remove avatar

### 5. Node Types

The API supports three node types:

#### User Node
```json
{
  "kind": "user",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar": "https://example.com/avatar.jpg",
  "bio": "User bio",
  "isActive": true,
  "preferences": {
    "theme": "dark",
    "language": "en",
    "notifications": {
      "email": true,
      "push": false
    }
  }
}
```

#### Post Node
```json
{
  "kind": "post",
  "content": "Post content here",
  "publishImmediately": true
}
```

#### Synapse Node (Relationship)
```json
{
  "kind": "synapse",
  "from": "507f1f77bcf86cd799439011",
  "to": "507f1f77bcf86cd799439012",
  "role": "author",
  "dir": "out",
  "order": 1,
  "weight": 1.0,
  "props": {
    "customProperty": "value"
  }
}
```

### 6. Node IDs

- All node IDs are encoded with a `wp_` prefix
- Example: `wp_1234567890abcdef12345678`
- The actual MongoDB ObjectId is 24 characters, encoded with the prefix

### 7. Error Responses

All endpoints return consistent error responses:

```json
{
  "error": {
    "message": "Error description",
    "details": [
      {
        "field": "fieldName",
        "message": "Validation error message",
        "code": "error_code"
      }
    ]
  }
}
```

### 8. Rate Limiting

- Rate limiting is applied to all API endpoints
- Default: 100 requests per 15 minutes
- Rate limit headers are included in responses

### 9. CORS

The API supports CORS for the following origins:
- Local development: `http://localhost:3000`, `http://localhost:3001`
- Production: Configured via environment variables

### 10. Testing

Use the test endpoints for development:
- `POST /api/test/create-node` - Create test node (dev only)
- `GET /api/public` - Public endpoint (no auth required)
- `GET /api/protected` - Protected endpoint (auth required)

## Notes

- All timestamps are in ISO 8601 format
- File uploads are limited to 5MB for avatars
- Soft deletes are used for all node operations
- The API uses MongoDB with Mongoose ODM
- Authentication is handled via Passport.js with Google OAuth
