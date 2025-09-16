'use client';

import React from 'react';
import { PostNodeViewTest } from '@web/components/NodeView/PostNodeView.test';
import { PostNodeDebug } from '@web/components/NodeView/PostNodeDebug';

/**
 * Demo page showing PostNodeView with synaptic author relationships
 * 
 * This page demonstrates how PostNodeView now uses getRelatives() to find
 * authors via synaptic relationships instead of relying on the createdBy field.
 * 
 * To test this page:
 * 1. Make sure you have a PostNode in your database with an authored synapse
 * 2. Replace the example post ID below with a real PostNode ID
 * 3. Navigate to /demo-postnode-relationships
 */
export default function DemoPostNodeRelationshipsPage() {
  // TODO: Replace with a real PostNode ID that has an authored synapse
  const examplePostId = '507f1f77bcf86cd799439011'; // Example ObjectId
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          PostNodeView with Synaptic Author Relationships
        </h1>
        
        <div className="prose mb-8">
          <p>
            This demo shows how the <code>PostNodeView</code> component now uses the 
            <code>getRelatives()</code> function to find and display the <code>createdBy</code> node 
            as the author via synaptic relationships.
          </p>
          
          <h2>Key Changes:</h2>
          <ul>
            <li>
              <strong>AuthorInfo Component:</strong> Now specifically looks for the <code>createdBy</code> node 
              in relatives, either directly or via authored synapses
            </li>
            <li>
              <strong>AuthorName Component:</strong> Similarly updated to find the <code>createdBy</code> node 
              through synaptic relationships
            </li>
            <li>
              <strong>Two-Step Process:</strong> First tries to find the <code>createdBy</code> node directly 
              in relatives, then falls back to looking for authored synapses that connect to that node
            </li>
            <li>
              <strong>Interface Update:</strong> PostNodeView now accepts <code>relatives</code> and 
              <code>getRelatives</code> parameters in its children render prop
            </li>
            <li>
              <strong>Null Safety:</strong> Properly handles cases where <code>createdBy</code> is undefined
            </li>
          </ul>
          
          <h2>How It Works:</h2>
          <ol>
            <li>Gets the <code>createdBy</code> ID from the PostNode</li>
            <li>Uses <code>getRelatives()</code> to find that specific UserNode in the relatives array</li>
            <li>If not found directly, looks for authored synapses that connect the <code>createdBy</code> node to the post</li>
            <li>Displays the author's avatar and name from the found UserNode</li>
          </ol>
          
          <h2>Benefits:</h2>
          <ul>
            <li>Specifically targets the <code>createdBy</code> node as the author</li>
            <li>Uses synaptic relationships for flexible relationship modeling</li>
            <li>Consistent with the overall synaptic relationship system</li>
            <li>Better separation of concerns between data and display</li>
            <li>Easier to extend with additional relationship types</li>
          </ul>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <h3 className="font-semibold text-yellow-800 mb-2">Note:</h3>
          <p className="text-yellow-700">
            To see this demo in action, you need a PostNode with an authored synapse. 
            The test we wrote earlier ensures this relationship works correctly in the backend.
            Replace the example PostNode ID below with a real one from your database.
          </p>
        </div>
        
        <PostNodeViewTest postNodeId={examplePostId} />
        
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Debug Information</h2>
          <PostNodeDebug postNodeId={examplePostId} />
        </div>
        
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">How to Test:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Create a PostNode in your database</li>
            <li>Create a UserNode (author)</li>
            <li>Create a SynapseNode with role "authored" connecting the user to the post</li>
            <li>Replace the example PostNode ID above with your real PostNode ID</li>
            <li>Refresh this page to see the relationship displayed</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
