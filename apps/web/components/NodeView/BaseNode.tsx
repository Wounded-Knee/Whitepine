'use client';

import React, { useEffect, useState } from 'react';
import { useNodeRequest } from '@web/hooks/useNodeRequest';
import type { BaseNode } from '@whitepine/types';

export interface BaseNodeViewProps {
  nodeId: string;
  className?: string;
  children?: (node: BaseNode | null, isLoading: boolean, error: string | null) => React.ReactNode;
}

/**
 * BaseNodeView component for displaying BaseNode instances.
 * 
 * This component handles fetching a node from Redux store, cache, or API.
 * It supports only the BaseNode schema and can be extended by other views
 * like UserNodeView to support polymorphic derivative node schemas.
 * 
 * @param nodeId - The ID of the node to fetch and display
 * @param className - Optional CSS class name for styling
 * @param children - Render prop function that receives (node, isLoading, error)
 */
export const BaseNodeView: React.FC<BaseNodeViewProps> = ({
  nodeId,
  className,
  children
}) => {
  // Use the custom hook for request management with deduplication
  const { node, isLoading, error, fetchNode } = useNodeRequest(nodeId);
  
  useEffect(() => {
    fetchNode();
  }, [nodeId, fetchNode]);
  
  // If children is provided as a render prop, use it
  if (children) {
    return (
      <div className={className}>
        {children(node, isLoading, error)}
      </div>
    );
  }
  
  // Default rendering for BaseNode
  if (isLoading) {
    return (
      <div className={className}>
        <div className="animate-pulse bg-gray-200 rounded h-20 w-full"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={className}>
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-600">Error loading node: {error}</p>
        </div>
      </div>
    );
  }
  
  if (!node) {
    return (
      <div className={className}>
        <div className="bg-gray-50 border border-gray-200 rounded p-4">
          <p className="text-gray-600">Node not found</p>
        </div>
      </div>
    );
  }
  
  // Ensure we're dealing with a BaseNode (not a derived type)
  if (node.kind !== 'BaseNode' && !node.kind) {
    return (
      <div className={className}>
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
          <p className="text-yellow-600">
            This component only supports BaseNode instances. 
            Node type: {node.kind || 'unknown'}
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={className}>
      <div className="bg-white border border-gray-200 rounded p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium text-gray-900">
            Base Node
          </h3>
          <span className="text-sm text-gray-500">
            ID: {node._id.toString()}
          </span>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Created:</span>
            <span className="text-gray-900">
              {new Date(node.createdAt).toLocaleDateString()}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Updated:</span>
            <span className="text-gray-900">
              {new Date(node.updatedAt).toLocaleDateString()}
            </span>
          </div>
          
          {node.deletedAt && (
            <div className="flex justify-between">
              <span className="text-gray-600">Deleted:</span>
              <span className="text-red-600">
                {new Date(node.deletedAt).toLocaleDateString()}
              </span>
            </div>
          )}
          
          {node.ownerId && (
            <div className="flex justify-between">
              <span className="text-gray-600">Owner:</span>
              <span className="text-gray-900">
                {node.ownerId.toString()}
              </span>
            </div>
          )}
          
          {node.createdBy && (
            <div className="flex justify-between">
              <span className="text-gray-600">Created By:</span>
              <span className="text-gray-900">
                {node.createdBy.toString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BaseNodeView;
