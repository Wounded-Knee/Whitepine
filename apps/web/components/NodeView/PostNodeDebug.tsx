'use client';

import React from 'react';
import { PostNodeView } from './PostNodeView';
import { NODE_TYPES } from '@shared/nodeTypes';

/**
 * Debug component to help troubleshoot PostNodeView relationships
 * This shows detailed information about what getRelatives() returns
 */
export const PostNodeDebug: React.FC<{ postNodeId: string }> = ({ postNodeId }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">PostNodeView Debug Information</h2>
      
      <PostNodeView nodeId={postNodeId}>
        {(postNode, isLoading, error, editProps, relatives, getRelatives) => {
          if (isLoading) return <div>Loading...</div>;
          if (error) return <div>Error: {error}</div>;
          if (!postNode) return <div>Post not found</div>;
          
          // Debug information
          const allRelatives = getRelatives({});
          const synapticRelatives = getRelatives({ relationshipType: 'synaptic' });
          const authoredSynapses = getRelatives({ 
            synaptic: { role: 'authored', dir: 'in' } 
          });
          const userRelatives = getRelatives({ kind: NODE_TYPES.USER });
          
          return (
            <div className="space-y-4">
              {/* Post Content */}
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Post Content:</h3>
                <p>{postNode.content}</p>
              </div>
              
              {/* Debug Information */}
              <div className="bg-gray-50 border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Debug Information:</h3>
                <div className="text-sm space-y-2">
                  <div><strong>Total Relatives:</strong> {allRelatives.length}</div>
                  <div><strong>Synaptic Relatives:</strong> {synapticRelatives.length}</div>
                  <div><strong>Authored Synapses (incoming):</strong> {authoredSynapses.length}</div>
                  <div><strong>User Relatives:</strong> {userRelatives.length}</div>
                </div>
              </div>
              
              {/* All Relatives */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold mb-2">All Relatives:</h3>
                <div className="text-sm space-y-1">
                  {allRelatives.map((relative, index) => (
                    <div key={index} className="bg-white p-2 rounded border">
                      <div><strong>Kind:</strong> {relative.kind}</div>
                      <div><strong>ID:</strong> {relative._id?.toString()}</div>
                      <div><strong>Relationship Type:</strong> {relative._relationshipType}</div>
                      <div><strong>Direction:</strong> {relative._direction}</div>
                      {relative.kind === NODE_TYPES.SYNAPSE && (
                        <div>
                          <div><strong>Role:</strong> {relative.role}</div>
                          <div><strong>From:</strong> {relative.from?.toString()}</div>
                          <div><strong>To:</strong> {relative.to?.toString()}</div>
                        </div>
                      )}
                      {relative.kind === NODE_TYPES.USER && (
                        <div>
                          <div><strong>Name:</strong> {relative.name}</div>
                          <div><strong>Email:</strong> {relative.email}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Authored Synapses Detail */}
              {authoredSynapses.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Authored Synapses:</h3>
                  <div className="text-sm space-y-1">
                    {authoredSynapses.map((synapse, index) => (
                      <div key={index} className="bg-white p-2 rounded border">
                        <div><strong>Role:</strong> {synapse.role}</div>
                        <div><strong>Direction:</strong> {synapse._direction}</div>
                        <div><strong>From:</strong> {synapse.from?.toString()}</div>
                        <div><strong>To:</strong> {synapse.to?.toString()}</div>
                        <div><strong>Weight:</strong> {synapse.weight}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* CreatedBy Node Detection */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold mb-2">CreatedBy Node Detection:</h3>
                {(() => {
                  const createdByNode = postNode.createdBy ? getRelatives({ 
                    kind: NODE_TYPES.USER,
                    filter: (relative: any) => {
                      return relative._id.toString() === postNode.createdBy!.toString();
                    }
                  })[0] : null;
                  
                  const createdBySynapses = postNode.createdBy ? authoredSynapses.filter((synapse: any) => 
                    synapse._relationshipType === 'synaptic' && 
                    synapse.role === 'authored' &&
                    synapse.from && synapse.from.toString() === postNode.createdBy!.toString()
                  ) : [];
                  
                  return (
                    <div className="text-sm space-y-2">
                      <div><strong>Post CreatedBy ID:</strong> {postNode.createdBy ? postNode.createdBy.toString() : 'No createdBy'}</div>
                      {createdByNode ? (
                        <div>
                          <div><strong>CreatedBy Node Found:</strong> {createdByNode.name}</div>
                          <div><strong>CreatedBy Email:</strong> {createdByNode.email}</div>
                          <div><strong>CreatedBy ID:</strong> {createdByNode._id?.toString()}</div>
                        </div>
                      ) : (
                        <div className="text-red-600">
                          <strong>CreatedBy node not found in relatives</strong>
                        </div>
                      )}
                      <div><strong>CreatedBy Synapses:</strong> {createdBySynapses.length}</div>
                      {createdBySynapses.length > 0 && (
                        <div>
                          <strong>Synapse Details:</strong>
                          {createdBySynapses.map((synapse, index) => (
                            <div key={index} className="ml-4 text-xs">
                              Role: {synapse.role}, From: {synapse.from?.toString()}, To: {synapse.to?.toString()}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          );
        }}
      </PostNodeView>
    </div>
  );
};

export default PostNodeDebug;
