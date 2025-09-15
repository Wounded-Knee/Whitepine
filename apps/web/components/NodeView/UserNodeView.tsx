'use client';

import React from 'react';
import { BaseNodeView, BaseNodeViewProps } from './BaseNode';
import type { UserNode } from '@whitepine/types';

export interface UserNodeViewProps extends Omit<BaseNodeViewProps, 'children'> {
  children?: (node: UserNode | null, isLoading: boolean, error: string | null) => React.ReactNode;
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
      {(node, isLoading, error) => {
        // If children is provided as a render prop, use it with typed UserNode
        if (children) {
          const userNode = node?.kind === 'User' ? (node as UserNode) : null;
          return children(userNode, isLoading, error);
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
                  {userNode.name}
                </h3>
                <p className="text-sm text-gray-600">{userNode.email}</p>
                {userNode.bio && (
                  <p className="text-sm text-gray-700 mt-1">{userNode.bio}</p>
                )}
              </div>
              <div className="text-right text-sm text-gray-500">
                <div>Status: {userNode.isActive ? 'Active' : 'Inactive'}</div>
                {userNode.lastLoginAt && (
                  <div>Last login: {new Date(userNode.lastLoginAt).toLocaleDateString()}</div>
                )}
              </div>
            </div>
            
            {userNode.preferences && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Preferences</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {userNode.preferences.theme && (
                    <div>
                      <span className="text-gray-600">Theme:</span>
                      <span className="ml-2 text-gray-900">{userNode.preferences.theme}</span>
                    </div>
                  )}
                  {userNode.preferences.language && (
                    <div>
                      <span className="text-gray-600">Language:</span>
                      <span className="ml-2 text-gray-900">{userNode.preferences.language}</span>
                    </div>
                  )}
                  {userNode.preferences.notifications && (
                    <div className="col-span-2">
                      <span className="text-gray-600">Notifications:</span>
                      <div className="mt-1 space-y-1">
                        {userNode.preferences.notifications.email !== undefined && (
                          <div className="text-xs">
                            Email: {userNode.preferences.notifications.email ? 'Enabled' : 'Disabled'}
                          </div>
                        )}
                        {userNode.preferences.notifications.push !== undefined && (
                          <div className="text-xs">
                            Push: {userNode.preferences.notifications.push ? 'Enabled' : 'Disabled'}
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
