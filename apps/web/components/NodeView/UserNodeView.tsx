'use client';

import React from 'react';
import { BaseNodeView } from './BaseNode';
import type { BaseNodeViewProps, EditProps } from './BaseNode';
import { Button } from '@web/components/ui/button';
import { Edit, Save, X } from 'lucide-react';
import type { UserNode } from '@whitepine/types';

export interface UserNodeViewProps extends Omit<BaseNodeViewProps, 'children'> {
  children?: (node: UserNode | null, isLoading: boolean, error: string | null, editProps: EditProps) => React.ReactNode;
}

/**
 * UserNodeView component for displaying UserNode instances.
 * 
 * This component extends BaseNodeView to specifically handle UserNode schemas.
 * It demonstrates how to extend BaseNodeView for polymorphic derivative node schemas.
 * 
 * @param nodeId - The ID of the user node to fetch and display
 * @param className - Optional CSS class name for styling
 * @param children - Render prop function that receives (node, isLoading, error)
 */
export const UserNodeView: React.FC<UserNodeViewProps> = ({
  nodeId,
  className,
  children
}) => {
  return (
    <BaseNodeView nodeId={nodeId} className={className}>
      {(node, isLoading, error, editProps) => {
        // If children is provided as a render prop, use it with typed UserNode
        if (children) {
          const userNode = node?.kind === 'User' ? (node as UserNode) : null;
          return children(userNode, isLoading, error, editProps);
        }

        // Default rendering for UserNode
        if (isLoading) {
          return (
            <div className="animate-pulse bg-blue-200 rounded h-24 w-full"></div>
          );
        }

        if (error) {
          return (
            <div className="bg-red-50 border border-red-200 rounded p-4">
              <p className="text-red-600">Error loading user: {error}</p>
            </div>
          );
        }

        if (!node) {
          return (
            <div className="bg-gray-50 border border-gray-200 rounded p-4">
              <p className="text-gray-600">User not found</p>
            </div>
          );
        }

        // Type guard to ensure we have a UserNode
        if (node.kind !== 'User') {
          return (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <p className="text-yellow-600">
                Expected User node, but got: {node.kind || 'unknown'}
              </p>
            </div>
          );
        }

        const userNode = node as UserNode;

        return (
          <div className="bg-white border border-blue-200 rounded p-4 shadow-sm">
            {/* Edit/Save/Cancel buttons */}
            <div className="flex items-center justify-end space-x-2 mb-4">
              {!editProps.isEditing ? (
                !userNode.readOnly && (
                  <Button
                    onClick={editProps.handleEdit}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </Button>
                )
              ) : (
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={editProps.handleSave}
                    disabled={editProps.isSaving}
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editProps.isSaving ? 'Saving...' : 'Save'}</span>
                  </Button>
                  <Button
                    onClick={editProps.handleCancel}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </Button>
                </div>
              )}
            </div>
            
            {/* Save error display */}
            {editProps.saveError && (
              <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                <p className="text-red-600 text-sm">{editProps.saveError}</p>
              </div>
            )}
            
            <div className="flex items-center space-x-4">
              {userNode.avatar && (
                <img
                  src={userNode.avatar}
                  alt={userNode.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900" title={userNode._id}>
                  {editProps.isEditing ? (
                    <input
                      type="text"
                      value={editProps.editData?.name || userNode.name || ''}
                      onChange={(e) => editProps.handleFormChange({ formData: { ...editProps.editData, name: e.target.value } })}
                      className="border border-gray-300 rounded px-2 py-1 text-lg font-medium"
                    />
                  ) : (
                    userNode.name
                  )}
                </h3>
                <p className="text-sm text-gray-600">
                  {editProps.isEditing ? (
                    <input
                      type="email"
                      value={editProps.editData?.email || userNode.email || ''}
                      onChange={(e) => editProps.handleFormChange({ formData: { ...editProps.editData, email: e.target.value } })}
                      className="border border-gray-300 rounded px-2 py-1 text-sm w-full max-w-xs"
                    />
                  ) : (
                    userNode.email
                  )}
                </p>
                {(userNode.bio || editProps.isEditing) && (
                  <p className="text-sm text-gray-700 mt-1">
                    {editProps.isEditing ? (
                      <textarea
                        value={editProps.editData?.bio || userNode.bio || ''}
                        onChange={(e) => editProps.handleFormChange({ formData: { ...editProps.editData, bio: e.target.value } })}
                        className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                        rows={2}
                      />
                    ) : (
                      userNode.bio
                    )}
                  </p>
                )}
              </div>
              <div className="text-right text-sm text-gray-500">
                <div>
                  Status: {editProps.isEditing ? (
                    <select
                      value={editProps.editData?.isActive !== undefined ? editProps.editData.isActive : userNode.isActive}
                      onChange={(e) => editProps.handleFormChange({ formData: { ...editProps.editData, isActive: e.target.value === 'true' } })}
                      className="border border-gray-300 rounded px-2 py-1 text-sm ml-2"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  ) : (
                    userNode.isActive ? 'Active' : 'Inactive'
                  )}
                </div>
                {userNode.lastLoginAt && (
                  <div>Last login: {new Date(userNode.lastLoginAt).toLocaleDateString()}</div>
                )}
              </div>
            </div>
            
            {(userNode.preferences || editProps.isEditing) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Preferences</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {(userNode.preferences?.theme || editProps.isEditing) && (
                    <div>
                      <span className="text-gray-600">Theme:</span>
                      {editProps.isEditing ? (
                        <select
                          value={editProps.editData?.preferences?.theme || userNode.preferences?.theme || 'light'}
                          onChange={(e) => {
                            const currentPreferences = editProps.editData?.preferences || userNode.preferences || {};
                            editProps.handleFormChange({ 
                              formData: { 
                                ...editProps.editData, 
                                preferences: { 
                                  ...currentPreferences, 
                                  theme: e.target.value 
                                } 
                              } 
                            });
                          }}
                          className="border border-gray-300 rounded px-2 py-1 text-sm ml-2"
                        >
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                          <option value="auto">Auto</option>
                        </select>
                      ) : (
                        <span className="ml-2 text-gray-900">{userNode.preferences?.theme}</span>
                      )}
                    </div>
                  )}
                  {(userNode.preferences?.language || editProps.isEditing) && (
                    <div>
                      <span className="text-gray-600">Language:</span>
                      {editProps.isEditing ? (
                        <select
                          value={editProps.editData?.preferences?.language || userNode.preferences?.language || 'en'}
                          onChange={(e) => {
                            const currentPreferences = editProps.editData?.preferences || userNode.preferences || {};
                            editProps.handleFormChange({ 
                              formData: { 
                                ...editProps.editData, 
                                preferences: { 
                                  ...currentPreferences, 
                                  language: e.target.value 
                                } 
                              } 
                            });
                          }}
                          className="border border-gray-300 rounded px-2 py-1 text-sm ml-2"
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                        </select>
                      ) : (
                        <span className="ml-2 text-gray-900">{userNode.preferences?.language}</span>
                      )}
                    </div>
                  )}
                  {(userNode.preferences?.notifications || editProps.isEditing) && (
                    <div className="col-span-2">
                      <span className="text-gray-600">Notifications:</span>
                      <div className="mt-1 space-y-1">
                        {(userNode.preferences?.notifications?.email !== undefined || editProps.isEditing) && (
                          <div className="text-xs">
                            Email: {editProps.isEditing ? (
                              <select
                                value={editProps.editData?.preferences?.notifications?.email !== undefined ? editProps.editData.preferences.notifications.email : userNode.preferences?.notifications?.email}
                                onChange={(e) => {
                                  const currentPreferences = editProps.editData?.preferences || userNode.preferences || {};
                                  const currentNotifications = currentPreferences.notifications || {};
                                  editProps.handleFormChange({ 
                                    formData: { 
                                      ...editProps.editData, 
                                      preferences: { 
                                        ...currentPreferences, 
                                        notifications: { 
                                          ...currentNotifications, 
                                          email: e.target.value === 'true' 
                                        } 
                                      } 
                                    } 
                                  });
                                }}
                                className="border border-gray-300 rounded px-1 py-0.5 text-xs ml-2"
                              >
                                <option value="true">Enabled</option>
                                <option value="false">Disabled</option>
                              </select>
                            ) : (
                              userNode.preferences?.notifications?.email ? 'Enabled' : 'Disabled'
                            )}
                          </div>
                        )}
                        {(userNode.preferences?.notifications?.push !== undefined || editProps.isEditing) && (
                          <div className="text-xs">
                            Push: {editProps.isEditing ? (
                              <select
                                value={editProps.editData?.preferences?.notifications?.push !== undefined ? editProps.editData.preferences.notifications.push : userNode.preferences?.notifications?.push}
                                onChange={(e) => {
                                  const currentPreferences = editProps.editData?.preferences || userNode.preferences || {};
                                  const currentNotifications = currentPreferences.notifications || {};
                                  editProps.handleFormChange({ 
                                    formData: { 
                                      ...editProps.editData, 
                                      preferences: { 
                                        ...currentPreferences, 
                                        notifications: { 
                                          ...currentNotifications, 
                                          push: e.target.value === 'true' 
                                        } 
                                      } 
                                    } 
                                  });
                                }}
                                className="border border-gray-300 rounded px-1 py-0.5 text-xs ml-2"
                              >
                                <option value="true">Enabled</option>
                                <option value="false">Disabled</option>
                              </select>
                            ) : (
                              userNode.preferences?.notifications?.push ? 'Enabled' : 'Disabled'
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      }}
    </BaseNodeView>
  );
};

export default UserNodeView;
