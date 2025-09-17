'use client';

import React from 'react';
import { UserNodeView } from './UserNodeView';
import { PostNodeView } from './PostNodeView';
import { BaseNodeView } from './BaseNode';
import { NODE_TYPES } from '@shared/nodeTypes';
import type { BaseNode } from '@whitepine/types';

export interface RelativeNodeViewProps {
  relative: any;
  className?: string;
  compact?: boolean;
  showRelationshipInfo?: boolean;
}

/**
 * Component that renders a relative node using the appropriate NodeView
 * based on its discriminator type (UserNode, PostNode, etc.)
 */
export const RelativeNodeView: React.FC<RelativeNodeViewProps> = ({
  relative,
  className,
  compact = true,
  showRelationshipInfo = true
}) => {
  // Don't render synapses as they don't have their own view
  if (relative.kind === NODE_TYPES.SYNAPSE) {
    return (
      <div className={`p-3 bg-gray-50 border border-gray-200 rounded-lg ${className || ''}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-gray-800">Synapse</div>
            <div className="text-sm text-gray-600">
              Role: {relative.role} | Direction: {relative.dir}
            </div>
            {showRelationshipInfo && (
              <div className="text-xs text-gray-500 mt-1">
                {relative._relationshipType === 'synaptic' && 'Synaptic connection'}
                {relative._attribute && ` | Via: ${relative._attribute}`}
              </div>
            )}
          </div>
          <div className="text-xs text-gray-400">
            {relative._id?.toString().slice(-8)}
          </div>
        </div>
      </div>
    );
  }

  // Render the appropriate NodeView based on the relative's kind
  switch (relative.kind) {
    case NODE_TYPES.USER:
      return (
        <div className={className}>
          {showRelationshipInfo && (
            <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
              <div className="text-blue-800 font-medium">User Node</div>
              <div className="text-blue-600">
                {relative._relationshipType === 'attribute' && `Referenced by: ${relative._attribute}`}
                {relative._relationshipType === 'synaptic' && `Synaptic connection`}
                {relative.role && ` | Role: ${relative.role}`}
                {relative.dir && ` | Direction: ${relative.dir}`}
              </div>
            </div>
          )}
          <UserNodeView 
            nodeId={relative._id.toString()} 
            compact={compact}
          />
        </div>
      );

    case NODE_TYPES.POST:
      return (
        <div className={className}>
          {showRelationshipInfo && (
            <div className="mb-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
              <div className="text-green-800 font-medium">Post Node</div>
              <div className="text-green-600">
                {relative._relationshipType === 'attribute' && `Referenced by: ${relative._attribute}`}
                {relative._relationshipType === 'synaptic' && `Synaptic connection`}
                {relative.role && ` | Role: ${relative.role}`}
                {relative.dir && ` | Direction: ${relative.dir}`}
              </div>
            </div>
          )}
          <PostNodeView 
            nodeId={relative._id.toString()} 
            compact={compact}
          />
        </div>
      );

    default:
      // For unknown node types, use BaseNodeView
      return (
        <div className={className}>
          {showRelationshipInfo && (
            <div className="mb-2 p-2 bg-gray-50 border border-gray-200 rounded text-xs">
              <div className="text-gray-800 font-medium">{relative.kind || 'Unknown'} Node</div>
              <div className="text-gray-600">
                {relative._relationshipType === 'attribute' && `Referenced by: ${relative._attribute}`}
                {relative._relationshipType === 'synaptic' && `Synaptic connection`}
                {relative.role && ` | Role: ${relative.role}`}
                {relative.dir && ` | Direction: ${relative.dir}`}
              </div>
            </div>
          )}
          <BaseNodeView nodeId={relative._id.toString()}>
            {(node, isLoading, error) => {
              if (isLoading) {
                return <div className="animate-pulse bg-gray-200 rounded h-16 w-full"></div>;
              }
              if (error) {
                return <div className="text-red-500 text-sm">Error loading node: {error}</div>;
              }
              if (!node) {
                return <div className="text-gray-500 text-sm">Node not found</div>;
              }
              
              return (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="font-medium text-gray-800">{node.kind}</div>
                  <div className="text-sm text-gray-600">
                    {node.name && <span>{node.name}</span>}
                    {node.content && <span>{node.content.slice(0, 100)}...</span>}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {node._id?.toString().slice(-8)}
                  </div>
                </div>
              );
            }}
          </BaseNodeView>
        </div>
      );
  }
};

export default RelativeNodeView;
