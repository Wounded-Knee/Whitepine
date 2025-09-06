# User Role System

## Overview

The User Role System provides role-based access control (RBAC) for the Whitepine application. It allows administrators to assign specific roles to users, which determine their permissions and access levels throughout the application.

## Roles

### Available Roles

1. **Developer** - Highest level access
   - Full system access
   - Can manage all user roles
   - Access to admin features
   - Can view and modify system data

2. **Admin** - Administrative access
   - Can manage user roles
   - Access to admin features
   - Can moderate content
   - Full user management capabilities

3. **Moderator** - Content moderation
   - Can moderate petitions and content
   - Limited administrative access
   - Can view user data

4. **User** - Standard user access
   - Basic application access
   - Can create and vote on petitions
   - Standard user features

## Database Schema

### User Model Updates

The User model has been extended with a `roles` field:

```javascript
roles: {
  type: [String],
  default: [],
  enum: ['Developer', 'Admin', 'Moderator', 'User']
}
```

### User Model Methods

- `hasRole(role)` - Check if user has a specific role
- `hasAnyRole(roles)` - Check if user has any of the specified roles
- `addRole(role)` - Add a role to user
- `removeRole(role)` - Remove a role from user

## API Endpoints

### Role Management Endpoints

- `GET /api/roles/available` - Get all available roles
- `GET /api/roles/users` - Get all users with their roles
- `POST /api/roles/assign` - Assign role to user
- `DELETE /api/roles/remove` - Remove role from user
- `PUT /api/roles/update/:userId` - Update all roles for a user
- `GET /api/roles/my-roles` - Get current user's roles

### Authentication Required

All role management endpoints require authentication and appropriate role permissions:
- Developer and Admin roles can manage all user roles
- Users can only view their own roles

## Frontend Implementation

### Role Utilities

Located in `src/app/utils/roleUtils.ts`:

- `hasRole(user, role)` - Check specific role
- `hasAnyRole(user, roles)` - Check multiple roles
- `isAdmin(user)` - Check admin privileges
- `isDeveloper(user)` - Check developer privileges
- `isModerator(user)` - Check moderator privileges
- `getHighestRole(user)` - Get user's highest priority role
- `getRoleBadgeClass(role)` - Get CSS classes for role badges

### Components

#### UserRoles Component

Displays user roles with management capabilities:

```tsx
<UserRoles
  userId={user._id}
  roles={user.roles}
  showManage={true}
  onRolesUpdate={(newRoles) => handleUpdate(newRoles)}
/>
```

#### Role Management Page

Admin interface for managing all user roles at `/admin/roles`

### Role Display

Roles are displayed as colored badges throughout the UI:
- Developer: Purple
- Admin: Red
- Moderator: Orange
- User: Gray

## Usage Examples

### Backend Role Checking

```javascript
// In route middleware
const requireRole = (roles) => {
  return async (req, res, next) => {
    const user = await User.findById(req.user._id);
    if (!user || !user.hasAnyRole(roles)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};

// Usage
router.get('/admin', requireRole(['Developer', 'Admin']), (req, res) => {
  // Admin only content
});
```

### Frontend Role Checking

```tsx
import { isAdmin, hasRole } from '../utils/roleUtils';

// In component
if (isAdmin(user)) {
  return <AdminPanel />;
}

if (hasRole(user, 'Developer')) {
  return <DeveloperTools />;
}
```

## Security Considerations

1. **Role Validation** - All roles are validated against the enum list
2. **Permission Checks** - Server-side validation for all role-based operations
3. **Token-based Authentication** - JWT tokens include user information
4. **Role Hierarchy** - Higher roles inherit permissions from lower roles

## Testing

### Role Test Page

Visit `/lab/role-test` to test the role system functionality:
- View current user roles
- Test role checking functions
- Verify role management (if admin)

### Manual Testing

1. Log in as Joel Kramer (has Developer role)
2. Visit `/admin/roles` to manage user roles
3. Visit `/lab/role-test` to verify role functionality
4. Test role assignment and removal

## Future Enhancements

1. **Role Permissions** - Granular permission system
2. **Role Groups** - Group-based role assignment
3. **Temporary Roles** - Time-limited role assignments
4. **Role Audit Log** - Track role changes
5. **Custom Roles** - User-defined roles

## Implementation Notes

- Roles are stored as an array in the user document
- Role changes require appropriate permissions
- Role information is included in user session data
- Frontend components automatically update when roles change
- Role badges are styled consistently across the application
