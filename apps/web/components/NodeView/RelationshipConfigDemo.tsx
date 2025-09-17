'use client';

import React from 'react';
import { BaseNodeView } from './BaseNode';
import { PostNodeView } from './PostNodeView';
import { UserNodeView } from './UserNodeView';
import type { RelationshipConfig } from './types/relationshipConfig';

/**
 * Demo component showing the new relationship configuration system
 */
export const RelationshipConfigDemo: React.FC<{ nodeId: string }> = ({ nodeId }) => {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Centralized Relationship Configuration System</h3>
        <p className="text-blue-800 text-sm">
          The BaseNode now contains logic for determining potential relationships and uses a configuration-based 
          approach where descendant node types contribute their own relationship configurations. This creates a 
          more maintainable and extensible system.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-4">BaseNodeView with Relationship Configurations:</h3>
          <BaseNodeView nodeId={nodeId}>
            {(node, isLoading, error, editProps, relatives, getRelatives, relationshipConfigs) => {
              if (isLoading) {
                return <div className="animate-pulse bg-gray-200 rounded h-16 w-full"></div>;
              }
              if (error) {
                return <div className="text-red-500 text-sm">Error: {error}</div>;
              }
              if (!node) {
                return <div className="text-gray-500 text-sm">Node not found</div>;
              }

              return (
                <div className="space-y-4">
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="font-medium text-gray-800">{node.kind} Node</div>
                    <div className="text-sm text-gray-600">
                      {node.name && <span>Name: {node.name}</span>}
                      {node.content && <span>Content: {node.content.slice(0, 100)}...</span>}
                    </div>
                  </div>

                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="font-medium text-green-800 mb-2">
                      Available Relationship Configurations ({relationshipConfigs.length})
                    </div>
                    <div className="space-y-2">
                      {relationshipConfigs.map((config: RelationshipConfig) => (
                        <div key={config.id} className="text-sm text-green-700">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{config.icon}</span>
                            <span className="font-medium">{config.label}</span>
                            <span className="text-xs bg-green-200 px-2 py-1 rounded">
                              {config.category}
                            </span>
                          </div>
                          <div className="text-xs text-green-600 ml-6">
                            {config.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }}
          </BaseNodeView>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-4">PostNodeView with Enhanced Suggestions:</h3>
          <PostNodeView nodeId={nodeId} />
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-green-900 mb-2">Key Features of the New System:</h3>
        <ul className="text-green-800 text-sm space-y-1">
          <li>• <strong>Centralized Logic:</strong> BaseNode contains relationship determination logic</li>
          <li>• <strong>Configuration-Based:</strong> Each node type contributes its own relationship configurations</li>
          <li>• <strong>Extensible:</strong> Easy to add new relationship types by creating new configurations</li>
          <li>• <strong>Context-Aware:</strong> Relationships are filtered based on node state and existing relationships</li>
          <li>• <strong>Form Integration:</strong> Each relationship type can define custom form fields</li>
          <li>• <strong>Validation:</strong> Built-in validation for relationship applicability</li>
          <li>• <strong>Type Safety:</strong> Full TypeScript support for all configuration types</li>
        </ul>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-900 mb-2">Architecture Benefits:</h3>
        <ul className="text-yellow-800 text-sm space-y-1">
          <li>• <strong>Separation of Concerns:</strong> Relationship logic is separate from UI components</li>
          <li>• <strong>Reusability:</strong> Relationship configurations can be shared across components</li>
          <li>• <strong>Maintainability:</strong> Easy to modify relationship behavior without touching UI code</li>
          <li>• <strong>Testability:</strong> Relationship logic can be tested independently</li>
          <li>• <strong>Consistency:</strong> All node types follow the same relationship pattern</li>
        </ul>
      </div>
    </div>
  );
};

export default RelationshipConfigDemo;
