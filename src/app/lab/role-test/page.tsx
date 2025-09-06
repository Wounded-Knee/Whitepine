'use client'

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  hasAnyRole, 
  isAdmin, 
  isDeveloper, 
  isModerator,
  getHighestRole,
  getRoleBadgeClass
} from '../../utils/roleUtils';
import { UserRole } from '../../types';
import UserRoles from '../../components/UserRoles';

const RoleTestPage: React.FC = () => {
  const { user, hasRole } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Log In</h1>
          <p className="text-gray-600">You need to be logged in to test roles.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Role System Test</h1>
            
            {/* User Info */}
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Current User</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{user.firstName} {user.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Username</p>
                  <p className="font-medium">@{user.username}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Highest Role</p>
                  <p className="font-medium">
                    {getHighestRole(user) ? (
                      <span className={getRoleBadgeClass(getHighestRole(user)!)}>
                        {getHighestRole(user)}
                      </span>
                    ) : (
                      'No roles'
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Role Tests */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Role Tests</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Specific Role Checks</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Has Developer role:</span>
                      <span className={hasRole('developer') ? 'text-green-600' : 'text-red-600'}>
                        {hasRole('developer') ? '✓ Yes' : '✗ No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Has Admin role:</span>
                      <span className={hasRole('admin') ? 'text-green-600' : 'text-red-600'}>
                        {hasRole('admin') ? '✓ Yes' : '✗ No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Has Moderator role:</span>
                      <span className={hasRole('moderator') ? 'text-green-600' : 'text-red-600'}>
                        {hasRole('moderator') ? '✓ Yes' : '✗ No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Has User role:</span>
                      <span className={hasRole('user') ? 'text-green-600' : 'text-red-600'}>
                        {hasRole('user') ? '✓ Yes' : '✗ No'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Permission Checks</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Is Admin:</span>
                      <span className={isAdmin(user) ? 'text-green-600' : 'text-red-600'}>
                        {isAdmin(user) ? '✓ Yes' : '✗ No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Is Developer:</span>
                      <span className={isDeveloper(user) ? 'text-green-600' : 'text-red-600'}>
                        {isDeveloper(user) ? '✓ Yes' : '✗ No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Is Moderator:</span>
                      <span className={isModerator(user) ? 'text-green-600' : 'text-red-600'}>
                        {isModerator(user) ? '✓ Yes' : '✗ No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Has Admin/Dev roles:</span>
                      <span className={hasAnyRole(user, ['admin', 'developer']) ? 'text-green-600' : 'text-red-600'}>
                        {hasAnyRole(user, ['admin', 'developer']) ? '✓ Yes' : '✗ No'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Roles */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Roles</h2>
              <div className="p-4 border rounded-lg">
                {user.roles && user.roles.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.roles.map((role) => (
                      <span key={role} className={getRoleBadgeClass(role)}>
                        {role}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No roles assigned</p>
                )}
              </div>
            </div>

            {/* Role Management (if admin) */}
            {isAdmin(user) && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Role Management</h2>
                <div className="p-4 border rounded-lg">
                  <UserRoles
                    userId={user._id}
                    onRolesUpdate={() => {
                      // This would typically update the user context
                      console.log('Roles updated');
                    }}
                  />
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-4">
              <a
                href="/admin/roles"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Admin Role Management
              </a>
              <a
                href="/lab"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Lab
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleTestPage;
