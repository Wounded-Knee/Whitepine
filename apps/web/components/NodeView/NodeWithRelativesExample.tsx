import React from 'react';
import { BaseNodeView } from './BaseNode';
import type { BaseNode } from '@whitepine/types';

interface NodeWithRelativesExampleProps {
  nodeId: string;
}

/**
 * Example component demonstrating how to use the getRelatives function
 * with the enhanced BaseNodeView component
 */
export const NodeWithRelativesExample: React.FC<NodeWithRelativesExampleProps> = ({ nodeId }) => {
  return (
    <BaseNodeView nodeId={nodeId}>
      {(node, isLoading, error, editProps, relatives, getRelatives) => {
        if (isLoading) return <div>Loading...</div>;
        if (error) return <div>Error: {error}</div>;
        if (!node) return <div>Node not found</div>;

        // Example usage of getRelatives with different selectors
        const synapticRelatives = getRelatives({ synaptic: { role: '*' } });
        const authorRelatives = getRelatives({ attribute: 'createdBy' });
        const postRelatives = getRelatives({ kind: 'post' });
        const customRelatives = getRelatives({ 
          filter: (relative) => relative.kind === 'user' && relative.isActive 
        });

        return (
          <div className="space-y-6">
            {/* Main node display */}
            <div className="bg-white border rounded-lg p-4">
              <h2 className="text-xl font-bold">{node.kind} Node</h2>
              <p className="text-gray-600">ID: {node._id}</p>
            </div>

            {/* Synaptic relatives */}
            {synapticRelatives.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800">Synaptic Connections</h3>
                <div className="mt-2 space-y-1">
                  {synapticRelatives.map((relative, index) => (
                    <div key={relative._id || index} className="text-sm">
                      <span className="font-medium">{relative.role}</span> 
                      {relative.dir && <span className="text-gray-600"> ({relative.dir})</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attribute-based relatives */}
            {authorRelatives.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800">Author/Creator</h3>
                <div className="mt-2 space-y-1">
                  {authorRelatives.map((relative, index) => (
                    <div key={relative._id || index} className="text-sm">
                      {relative.name || relative.email || relative._id}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Post relatives */}
            {postRelatives.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800">Related Posts</h3>
                <div className="mt-2 space-y-1">
                  {postRelatives.map((relative, index) => (
                    <div key={relative._id || index} className="text-sm">
                      {relative.title || relative.content || relative._id}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom filtered relatives */}
            {customRelatives.length > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-800">Active Users</h3>
                <div className="mt-2 space-y-1">
                  {customRelatives.map((relative, index) => (
                    <div key={relative._id || index} className="text-sm">
                      {relative.name || relative.email || relative._id}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800">Summary</h3>
              <div className="mt-2 text-sm text-gray-600">
                <p>Total relatives: {relatives.length}</p>
                <p>Synaptic connections: {synapticRelatives.length}</p>
                <p>Attribute references: {authorRelatives.length}</p>
                <p>Post nodes: {postRelatives.length}</p>
                <p>Active users: {customRelatives.length}</p>
              </div>
            </div>
          </div>
        );
      }}
    </BaseNodeView>
  );
};

export default NodeWithRelativesExample;
