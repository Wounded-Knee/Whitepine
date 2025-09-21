'use client';

import React from 'react';
import { UserNodeView } from './UserNodeView';
import { PostNodeView } from './PostNodeView';
import { BaseNodeView } from './BaseNode';
import { Button } from '@web/components/ui/button';
import { NODE_TYPES } from '@whitepine/types/client';
import type { BaseNode } from '@whitepine/types/client';

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
  compact = false,
  showRelationshipInfo = false
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
          <UserNodeView 
            nodeId={relative._id.toString()} 
            compact={compact}
          />
        </div>
      );

    case NODE_TYPES.POST:
      return (
        <div className={className}>
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
          <BaseNodeView nodeId={relative._id.toString()} />
        </div>
      );
  }
};

export default RelativeNodeView;
