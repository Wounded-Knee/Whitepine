'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Role } from '../types';

interface UserRolesProps {
  userId: string;
  onRolesUpdate?: () => void;
}

const UserRoles: React.FC<UserRolesProps> = ({ userId, onRolesUpdate }) => {
  const { user: currentUser, hasRole } = useAuth();
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchUserRoles();
    fetchAvailableRoles();
  }, [userId]);

  const fetchUserRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the new v1 API endpoint
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/v1/users/${userId}/roles`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (response.data && response.data.data) {
        setUserRoles(response.data.data.map((role: any) => role.name));
      }
    } catch (error: any) {
      console.error('Failed to fetch user roles:', error);
      setError('Failed to load user roles');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableRoles = async () => {
    try {
      // Use the new v1 API endpoint for available roles
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/v1/roles`);
      
      if (response.data && response.data.data) {
        setAvailableRoles(response.data.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch available roles:', error);
      setError('Failed to load available roles');
    }
  };

  const handleRoleToggle = async (roleName: string) => {
    if (!hasRole('admin')) {
      setError('You do not have permission to modify user roles');
      return;
    }

    try {
      setUpdating(true);
      setError(null);
      setSuccess(null);

      if (userRoles.includes(roleName)) {
        // Remove role
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/v1/users/${userId}/roles/${roleName}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        
        setUserRoles(prev => prev.filter(role => role !== roleName));
        setSuccess(`Role "${roleName}" removed successfully`);
      } else {
        // Add role
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/v1/users/${userId}/roles`, {
          role: roleName
        }, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        
        setUserRoles(prev => [...prev, roleName]);
        setSuccess(`Role "${roleName}" added successfully`);
      }

      // Notify parent component
      if (onRolesUpdate) {
        onRolesUpdate();
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      console.error('Failed to update user roles:', error);
      setError(error.response?.data?.detail || 'Failed to update user roles');
    } finally {
      setUpdating(false);
    }
  };

  const getRoleColor = (roleName: string) => {
    const colors: { [key: string]: string } = {
      admin: 'bg-[var(--color-error-light)] text-[var(--color-error)] border-[var(--color-error)]',
      moderator: 'bg-[var(--color-warning-light)] text-[var(--color-warning)] border-[var(--color-warning)]',
      developer: 'bg-[var(--color-primary-light)] text-[var(--color-primary)] border-[var(--color-primary)]',
      user: 'bg-[var(--color-secondary-light)] text-[var(--color-secondary)] border-[var(--color-secondary)]'
    };
    return colors[roleName] || colors.user;
  };

  const getRoleDescription = (roleName: string) => {
    const descriptions: { [key: string]: string } = {
      admin: 'Full system access, user management, and configuration',
      moderator: 'Content moderation, user warnings, and basic management',
      developer: 'Technical access for debugging and development',
      user: 'Standard permissions for creating petitions and voting'
    };
    return descriptions[roleName] || 'Custom role';
  };

  if (loading) {
    return (
      <div className="bg-[var(--color-surface)] rounded-lg shadow-sm border border-[var(--color-border)] p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-[var(--color-border)] rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-[var(--color-border)] rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-[var(--color-border)] rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!hasRole('admin')) {
    return (
      <div className="bg-[var(--color-surface)] rounded-lg shadow-sm border border-[var(--color-border)] p-6">
        <div className="text-center text-[var(--color-text-secondary)]">
          <div className="text-[var(--color-text-muted)] text-4xl mb-4">🔒</div>
          <p>You do not have permission to view or modify user roles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-surface)] rounded-lg shadow-sm border border-[var(--color-border)] p-6">
      <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">User Roles & Permissions</h3>
      
      {/* Messages */}
      {error && (
        <div className="mb-4 p-4 bg-[var(--color-error-light)] border border-[var(--color-error)] rounded-md">
          <p className="text-[var(--color-error)]">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-[var(--color-success-light)] border border-[var(--color-success)] rounded-md">
          <p className="text-[var(--color-success)]">{success}</p>
        </div>
      )}

      {/* Current Roles */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-[var(--color-text)] mb-3">Current Roles</h4>
        {userRoles.length === 0 ? (
          <div className="text-sm text-[var(--color-text-muted)]">No roles assigned</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {userRoles.map((role) => (
              <span
                key={role}
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(role)}`}
              >
                {role}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Available Roles */}
      <div>
        <h4 className="text-sm font-medium text-[var(--color-text)] mb-3">Manage Roles</h4>
        <div className="space-y-3">
          {availableRoles.map((role) => (
            <div
              key={role._id}
              className="flex items-center justify-between p-3 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-background)] transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id={`role-${role._id}`}
                    checked={userRoles.includes(role.name)}
                    onChange={() => handleRoleToggle(role.name)}
                    disabled={updating}
                    className="h-4 w-4 text-[var(--color-primary)] focus:ring-[var(--color-focus-ring)] border-[var(--color-border)] rounded disabled:opacity-50"
                  />
                  <div>
                    <label
                      htmlFor={`role-${role._id}`}
                      className="text-sm font-medium text-[var(--color-text)] cursor-pointer"
                    >
                      {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                    </label>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">
                      {role.description || getRoleDescription(role.name)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(role.name)}`}>
                  {role.scopes?.length || 0} scopes
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Role Information */}
      <div className="mt-6 p-4 bg-[var(--color-primary-light)] rounded-lg">
        <h4 className="text-sm font-medium text-[var(--color-primary)] mb-2">About Roles</h4>
        <div className="text-xs text-[var(--color-primary)] space-y-1">
          <p><strong>Admin:</strong> Full system access, user management, and configuration</p>
          <p><strong>Moderator:</strong> Content moderation, user warnings, and basic management</p>
          <p><strong>Developer:</strong> Technical access for debugging and development</p>
          <p><strong>User:</strong> Standard permissions for creating petitions and voting</p>
        </div>
      </div>

      {/* Update Status */}
      {updating && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center text-sm text-[var(--color-text-secondary)]">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Updating roles...
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRoles;
