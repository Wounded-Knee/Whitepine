/**
 * Usage examples for BaseNodeView and UserNodeView components
 * 
 * This file demonstrates how to use the node view components in your application.
 * Remove this file in production - it's just for documentation purposes.
 */

import React from 'react';
import { BaseNodeView } from './BaseNode';
import { UserNodeView } from './UserNodeView';

// Example 1: Basic BaseNodeView usage
export const BasicBaseNodeExample: React.FC<{ nodeId: string }> = ({ nodeId }) => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Basic BaseNodeView</h2>
      <BaseNodeView nodeId={nodeId} />
    </div>
  );
};

// Example 2: BaseNodeView with custom styling
export const StyledBaseNodeExample: React.FC<{ nodeId: string }> = ({ nodeId }) => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Styled BaseNodeView</h2>
      <BaseNodeView 
        nodeId={nodeId} 
        className="max-w-md mx-auto"
      />
    </div>
  );
};

// Example 3: BaseNodeView with render prop
export const RenderPropBaseNodeExample: React.FC<{ nodeId: string }> = ({ nodeId }) => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">BaseNodeView with Render Prop</h2>
      <BaseNodeView nodeId={nodeId}>
        {(node, isLoading, error) => {
          if (isLoading) return <div>Loading...</div>;
          if (error) return <div>Error: {error}</div>;
          if (!node) return <div>No node found</div>;
          
          return (
            <div className="bg-green-50 border border-green-200 rounded p-4">
              <h3 className="font-bold">Custom Node Display</h3>
              <p>Node ID: {node._id.toString()}</p>
              <p>Created: {new Date(node.createdAt).toLocaleString()}</p>
            </div>
          );
        }}
      </BaseNodeView>
    </div>
  );
};

// Example 4: UserNodeView usage
export const UserNodeExample: React.FC<{ nodeId: string }> = ({ nodeId }) => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">UserNodeView</h2>
      <UserNodeView nodeId={nodeId} />
    </div>
  );
};

// Example 5: UserNodeView with render prop
export const RenderPropUserNodeExample: React.FC<{ nodeId: string }> = ({ nodeId }) => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">UserNodeView with Render Prop</h2>
      <UserNodeView nodeId={nodeId}>
        {(userNode, isLoading, error) => {
          if (isLoading) return <div>Loading user...</div>;
          if (error) return <div>Error loading user: {error}</div>;
          if (!userNode) return <div>User not found</div>;
          
          return (
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <div className="flex items-center space-x-3">
                {userNode.avatar && (
                  <img
                    src={userNode.avatar}
                    alt={userNode.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                )}
                <div>
                  <h3 className="text-lg font-bold">{userNode.name}</h3>
                  <p className="text-gray-600">{userNode.email}</p>
                  <p className="text-sm text-gray-500">
                    {userNode.isActive ? '🟢 Active' : '🔴 Inactive'}
                  </p>
                </div>
              </div>
            </div>
          );
        }}
      </UserNodeView>
    </div>
  );
};

// Example 6: Multiple node views in a list
export const NodeListExample: React.FC<{ nodeIds: string[] }> = ({ nodeIds }) => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Node List</h2>
      <div className="space-y-4">
        {nodeIds.map((nodeId) => (
          <BaseNodeView 
            key={nodeId} 
            nodeId={nodeId}
            className="border rounded-lg p-2"
          />
        ))}
      </div>
    </div>
  );
};
