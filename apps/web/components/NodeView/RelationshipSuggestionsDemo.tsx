'use client';

import React from 'react';
import { PostNodeView } from './PostNodeView';

/**
 * Demo component showing PostNodeView with relationship suggestions
 */
export const RelationshipSuggestionsDemo: React.FC<{ postNodeId: string }> = ({ postNodeId }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">PostNodeView with Relationship Suggestions</h2>
      <p className="text-gray-600">
        This PostNodeView now includes relationship suggestions that allow users to create related nodes.
        For example, you can create a reply to this post or mention a user.
      </p>
      
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-2">Post with Relationship Suggestions:</h3>
        <PostNodeView 
          nodeId={postNodeId}
          showAuthor={true}
          compact={false}
        />
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Click "Create Related Node" to see available relationship options</li>
          <li>• For PostNodes, you can create replies or mention users</li>
          <li>• The system will create both the new node and the connecting synapse</li>
          <li>• This makes the system more proactive and user-friendly</li>
        </ul>
      </div>
    </div>
  );
};

export default RelationshipSuggestionsDemo;
