# Authentication System Setup Guide

This guide will help you set up the authentication system with Google OAuth integration for the Whitepine full-stack application.

## Overview

The authentication system includes:
- **Local Authentication**: Email/password registration and login
- **Google OAuth**: One-click sign-in with Google accounts
- **JWT Tokens**: Secure token-based authentication
- **React Context**: Global state management for user authentication
- **Federal Design**: Consistent with federal color scheme and accessibility standards

## Prerequisites

1. **MongoDB Atlas Database**: Ensure your MongoDB connection is working
2. **Google OAuth Credentials**: Set up Google OAuth 2.0 credentials
3. **Environment Variables**: Configure all required environment variables

## Step 1: Google OAuth Setup

### 1.1 Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Choose "Web application" as the application type
6. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (development)
   - `https://yourdomain.com/api/auth/google/callback` (production)
7. Copy the Client ID and Client Secret

### 1.2 Configure Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# Server Configuration
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
SESSION_SECRET=your-session-secret-key-change-this-in-production

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api
FRONTEND_URL=http://localhost:3000
```

## Step 2: Database Setup

The User model has been updated to support both local and OAuth authentication:

### Key Features:
- **Flexible Authentication**: Users can sign up with email/password or Google OAuth
- **Account Linking**: Existing email accounts can be linked to Google OAuth
- **Profile Management**: Avatar, verification status, and authentication method tracking
- **Security**: Password hashing, JWT tokens, and session management

### Database Schema:
```javascript
{
  username: String (required, unique),
  email: String (required, unique),
  password: String (required only for local auth),
  firstName: String (required),
  lastName: String (required),
  googleId: String (unique, for OAuth),
  googleEmail: String,
  avatar: String,
  authMethod: String (enum: 'local', 'google'),
  emailVerified: Boolean,
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Step 3: API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user with email/password |
| POST | `/login` | Login with email/password |
| GET | `/google` | Initiate Google OAuth flow |
| GET | `/google/callback` | Google OAuth callback handler |
| GET | `/me` | Get current user profile |
| POST | `/logout` | Logout (client-side token removal) |
| POST | `/refresh` | Refresh JWT token |

### User Management Routes (`/api/users`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all users (admin) |
| GET | `/:id` | Get user by ID |
| PUT | `/:id` | Update user profile |
| DELETE | `/:id` | Deactivate user (soft delete) |

## Step 4: Frontend Components

### AuthDialog Component

The main authentication dialog component with the following features:

- **Dual Mode**: Login and registration in a single component
- **Google OAuth**: One-click Google sign-in
- **Form Validation**: Real-time validation and error handling
- **Responsive Design**: Mobile-friendly interface
- **Federal Design**: Consistent with federal color scheme

### Usage Example:

```tsx
import AuthDialog from './components/AuthDialog';

function MyComponent() {
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  return (
    <div>
      <button onClick={() => setShowAuthDialog(true)}>
        Sign In
      </button>
      
      <AuthDialog 
        isOpen={showAuthDialog} 
        onClose={() => setShowAuthDialog(false)} 
        initialMode="login" 
      />
    </div>
  );
}
```

### AuthContext Hook

Global authentication state management:

```tsx
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { user, login, logout, loginWithGoogle } = useAuth();

  if (user) {
    return (
      <div>
        <p>Welcome, {user.firstName}!</p>
        <button onClick={logout}>Sign Out</button>
      </div>
    );
  }

  return (
    <button onClick={loginWithGoogle}>
      Sign in with Google
    </button>
  );
}
```

## Step 5: Testing the Authentication System

### 1. Start the Development Servers

```bash
# Terminal 1: Start the backend server
npm run server:dev

# Terminal 2: Start the frontend development server
npm run dev:ui
```

### 2. Test the Authentication Demo

1. Navigate to `http://localhost:3000/lab/auth-demo`
2. Test both login and registration dialogs
3. Test Google OAuth integration
4. Verify user state management

### 3. Test API Endpoints

Use tools like Postman or curl to test the API endpoints:

```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Step 6: Security Considerations

### Production Deployment

1. **Environment Variables**: Use strong, unique secrets for JWT_SECRET and SESSION_SECRET
2. **HTTPS**: Ensure all production traffic uses HTTPS
3. **CORS**: Configure CORS properly for your production domain
4. **Rate Limiting**: Implement rate limiting for authentication endpoints
5. **Password Policy**: Enforce strong password requirements
6. **Session Management**: Configure secure session settings

### Security Features Implemented

- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Tokens**: 7-day expiration with secure signing
- **Input Validation**: Server-side validation for all inputs
- **Error Handling**: Secure error messages (no sensitive data exposure)
- **Account Protection**: Soft delete for user deactivation
- **OAuth Security**: Proper OAuth 2.0 implementation

## Troubleshooting

### Common Issues

1. **Google OAuth Not Working**
   - Verify Google OAuth credentials are correct
   - Check redirect URI matches exactly
   - Ensure Google+ API is enabled

2. **JWT Token Issues**
   - Verify JWT_SECRET is set correctly
   - Check token expiration settings
   - Ensure proper Authorization header format

3. **Database Connection Issues**
   - Verify MongoDB connection string
   - Check network connectivity
   - Ensure database user has proper permissions

4. **CORS Errors**
   - Verify CORS_ORIGIN is set correctly
   - Check frontend URL matches CORS configuration
   - Ensure credentials are enabled

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in your environment variables.

## Support

For issues or questions about the authentication system:

1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Test with the provided demo page
4. Review the API documentation and error responses

## Next Steps

After setting up authentication, consider implementing:

1. **Email Verification**: Send verification emails for new accounts
2. **Password Reset**: Allow users to reset forgotten passwords
3. **Two-Factor Authentication**: Add 2FA for enhanced security
4. **Role-Based Access Control**: Implement user roles and permissions
5. **Audit Logging**: Track authentication events for security monitoring
