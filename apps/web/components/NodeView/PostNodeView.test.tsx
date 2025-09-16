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
            
            // Demonstrate using getRelatives to find author
            const authoredSynapses = getRelatives({ 
              synaptic: { role: 'authored', dir: 'in' } 
            });
            
            const author = getRelatives({ 
              kind: NODE_TYPES.USER,
              filter: (relative: any) => {
                return authoredSynapses.some((synapse: any) => 
                  synapse._relationshipType === 'synaptic' && 
                  synapse.role === 'authored' &&
                  synapse.from && synapse.from.toString() === relative._id.toString()
                );
              }
            })[0];
            
            return (
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <div className="font-medium text-blue-900 mb-2">
                  Custom Post Display with Synaptic Author Relationship
                </div>
                <div className="text-sm text-blue-800">
                  <div><strong>Post Content:</strong> {postNode.content}</div>
                  <div><strong>Author Found via getRelatives():</strong> {author ? author.name : 'No author found'}</div>
                  <div><strong>Authored Synapses:</strong> {authoredSynapses.length}</div>
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
