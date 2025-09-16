'use client';

import React from 'react';
import { PostNodeView } from './PostNodeView';
import { NODE_TYPES } from '@shared/nodeTypes';

/**
 * Test component to demonstrate PostNodeView displaying author relationships
 * This component shows how PostNodeView now uses getRelatives() to find authors
 */
export const PostNodeViewTest: React.FC<{ postNodeId: string }> = ({ postNodeId }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">PostNodeView with Author Relationship Test</h2>
      <p className="text-gray-600">
        This PostNodeView now uses getRelatives() to find the author via synaptic relationships
        instead of relying on the createdBy field directly.
      </p>
      
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-2">Post with Author Relationship:</h3>
        <PostNodeView 
          nodeId={postNodeId}
          showAuthor={true}
          compact={false}
        />
      </div>
      
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-2">Post with Author Relationship (Compact):</h3>
        <PostNodeView 
          nodeId={postNodeId}
          showAuthor={true}
          compact={true}
        />
      </div>
      
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-2">Post without Author Display:</h3>
        <PostNodeView 
          nodeId={postNodeId}
          showAuthor={false}
          compact={false}
        />
      </div>
      
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-2">Custom Render with Relatives Access:</h3>
        <PostNodeView nodeId={postNodeId}>
          {(postNode, isLoading, error, editProps, relatives, getRelatives) => {
            if (isLoading) return <div>Loading post...</div>;
            if (error) return <div>Error: {error}</div>;
            if (!postNode) return <div>Post not found</div>;
            
            // Demonstrate using getRelatives to find the createdBy node as author
            const createdByNode = postNode.createdBy ? getRelatives({ 
              kind: NODE_TYPES.USER,
              filter: (relative: any) => {
                return relative._id.toString() === postNode.createdBy!.toString();
              }
            })[0] : null;
            
            const authoredSynapses = getRelatives({ 
              synaptic: { role: 'authored', dir: 'in' } 
            });
            
            const createdBySynapses = postNode.createdBy ? authoredSynapses.filter((synapse: any) => 
              synapse._relationshipType === 'synaptic' && 
              synapse.role === 'authored' &&
              synapse.from && synapse.from.toString() === postNode.createdBy!.toString()
            ) : [];
            
            return (
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <div className="font-medium text-blue-900 mb-2">
                  Custom Post Display with Synaptic Author Relationship
                </div>
                <div className="text-sm text-blue-800">
                  <div><strong>Post Content:</strong> {postNode.content}</div>
                  <div><strong>CreatedBy ID:</strong> {postNode.createdBy ? postNode.createdBy.toString() : 'No createdBy'}</div>
                  <div><strong>CreatedBy Node Found:</strong> {createdByNode ? createdByNode.name : 'Not found in relatives'}</div>
                  <div><strong>CreatedBy Synapses:</strong> {createdBySynapses.length}</div>
                  <div><strong>Total Authored Synapses:</strong> {authoredSynapses.length}</div>
                  <div><strong>Total Relatives:</strong> {relatives.length}</div>
                </div>
              </div>
            );
          }}
        </PostNodeView>
      </div>
    </div>
  );
};

export default PostNodeViewTest;
