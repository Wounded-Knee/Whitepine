'use client'

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { isAdmin } from '../../utils/roleUtils';
import UserRoles from '../../components/UserRoles';
import axios from 'axios';
import { User, UserRole } from '../../types';

const RoleManagementPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add token to requests
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  useEffect(() => {
    if (currentUser && isAdmin(currentUser)) {
      fetchUsers();
    }
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/roles/users');
      setUsers(response.data);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleRolesUpdate = (userId: string, newRoles: UserRole[]) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user._id === userId ? { ...user, roles: newRoles } : user
      )
    );
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen py-16">
        <div className="container mx-auto px-4">
          <div className="bg-[var(--color-surface)] rounded-lg shadow-lg border border-[var(--color-border)] p-8 text-center">
            <div className="text-[var(--color-text-muted)] text-4xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold text-[var(--color-text)] mb-4">Access Denied</h1>
            <p className="text-[var(--color-text-secondary)]">Please log in to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin(currentUser)) {
    return (
      <div className="min-h-screen py-16">
        <div className="container mx-auto px-4">
          <div className="bg-[var(--color-surface)] rounded-lg shadow-lg border border-[var(--color-border)] p-8 text-center">
            <div className="text-[var(--color-text-muted)] text-4xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-[var(--color-text)] mb-4">Access Denied</h1>
            <p className="text-[var(--color-text-secondary)]">You don't have permission to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-[var(--color-surface)] rounded-lg shadow-lg border border-[var(--color-border)] p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-[var(--color-text)]">Role Management</h1>
              <button
                onClick={fetchUsers}
                disabled={loading}
                className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-text-on-primary)] rounded-lg hover:bg-[var(--color-primary-hover)] disabled:opacity-50 transition-colors duration-200"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-[var(--color-error-light)] border border-[var(--color-error)] rounded-lg">
                <p className="text-[var(--color-error)]">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto"></div>
                <p className="mt-4 text-[var(--color-text-secondary)]">Loading users...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[var(--color-border)]">
                  <thead className="bg-[var(--color-background)]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                        Roles
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-[var(--color-surface)] divide-y divide-[var(--color-border)]">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-[var(--color-background)]">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-[var(--color-text-on-primary)] font-medium text-sm">
                              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-[var(--color-text)]">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-[var(--color-text-secondary)]">
                                @{user.username}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text)]">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.isActive 
                              ? 'bg-[var(--color-success-light)] text-[var(--color-success)]' 
                              : 'bg-[var(--color-error-light)] text-[var(--color-error)]'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <UserRoles
                            userId={user._id}
                            onRolesUpdate={() => {}}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-muted)]">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && users.length === 0 && (
              <div className="text-center py-8">
                <p className="text-[var(--color-text-muted)]">No users found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleManagementPage;
