'use client';

import React from 'react';
import { BaseNodeView } from './BaseNode';
import type { RelationshipConfig } from './types/relationshipConfig';

/**
 * Debug component to show relationship configurations and their form fields
 */
export const RelationshipDebug: React.FC<{ nodeId: string }> = ({ nodeId }) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Relationship Configuration Debug</h3>
      
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
                <div className="text-sm text-gray-600">ID: {node._id}</div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="font-medium text-blue-800 mb-2">
                  Relationship Configurations ({relationshipConfigs.length})
                </div>
                <div className="space-y-3">
                  {relationshipConfigs.map((config: RelationshipConfig) => (
                    <div key={config.id} className="p-2 bg-white border border-blue-200 rounded">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">{config.icon}</span>
                        <span className="font-medium text-blue-900">{config.label}</span>
                        <span className="text-xs bg-blue-200 px-2 py-1 rounded">
                          {config.category}
                        </span>
                      </div>
                      <div className="text-sm text-blue-700 mb-2">
                        {config.description}
                      </div>
                      <div className="text-xs text-blue-600">
                        <div>Target: {config.targetNodeKind}</div>
                        <div>Role: {config.synapseRole}</div>
                        <div>Direction: {config.synapseDirection}</div>
                        <div className="mt-1">
                          <strong>Form Fields:</strong> {config.formFields?.length || 0}
                          {config.formFields && config.formFields.length > 0 && (
                            <div className="ml-2 space-y-1">
                              {config.formFields.map((field, index) => (
                                <div key={index} className="text-xs">
                                  • {field.name} ({field.type}) {field.required ? '*' : ''}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
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
  );
};

export default RelationshipDebug;
