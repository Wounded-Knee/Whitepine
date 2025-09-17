'use client';

import React from 'react';
import { BaseNodeView } from './BaseNode';
import { RelativeNodeView } from './RelativeNodeView';

/**
 * Demo component showing BaseNodeView with proper relative node rendering
 */
export const RelativeNodeViewDemo: React.FC<{ nodeId: string }> = ({ nodeId }) => {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Enhanced Relative Node Display</h3>
        <p className="text-blue-800 text-sm">
          The BaseNodeView now displays relatives using the appropriate NodeView component 
          based on their discriminator type (UserNode, PostNode, etc.). Each relative is 
          rendered with its full functionality and proper styling.
        </p>
      </div>

      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-4">BaseNodeView with Enhanced Relatives:</h3>
        <BaseNodeView nodeId={nodeId} />
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-green-900 mb-2">Key Improvements:</h3>
        <ul className="text-green-800 text-sm space-y-1">
          <li>• <strong>Discriminator-based rendering:</strong> UserNodes use UserNodeView, PostNodes use PostNodeView</li>
          <li>• <strong>Full functionality:</strong> Each relative maintains its complete feature set</li>
          <li>• <strong>Relationship context:</strong> Shows how each node is related (synaptic, attribute, etc.)</li>
          <li>• <strong>Consistent styling:</strong> All relatives follow the same design patterns</li>
          <li>• <strong>Interactive elements:</strong> Relatives can be edited, expanded, and interacted with</li>
        </ul>
      </div>
    </div>
  );
};

export default RelativeNodeViewDemo;
