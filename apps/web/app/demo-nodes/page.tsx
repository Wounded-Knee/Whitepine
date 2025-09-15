'use client';

import React, { useState, useEffect } from 'react';
import { BaseNodeView, UserNodeView } from '@web/components/NodeView';
import { useAppDispatch } from '@web/store/hooks';
import { createNode, fetchNodes } from '@web/store/slices/nodesSlice';
import { apiClient } from '@web/lib/api-client';

export default function NodeViewDemo() {
  const dispatch = useAppDispatch();
  const [createdNodeId, setCreatedNodeId] = useState<string | null>(null);
  const [realNodeId, setRealNodeId] = useState<string | null>(null);
  const [isLoadingRealNode, setIsLoadingRealNode] = useState(true);
  const [realNodeError, setRealNodeError] = useState<string | null>(null);

  // Fetch a real node from the database on component mount
  useEffect(() => {
    const fetchRealNode = async () => {
      try {
        setIsLoadingRealNode(true);
        setRealNodeError(null);
        
        // Try to fetch nodes from the API
        const { nodes } = await apiClient.getNodes({ limit: 1 });
        
        if (nodes && nodes.length > 0) {
          // Use the first node found
          setRealNodeId(nodes[0]._id.toString());
        } else {
          // No nodes found in database
          setRealNodeError('No nodes found in database');
        }
      } catch (error) {
        console.error('Failed to fetch real node:', error);
        setRealNodeError(error instanceof Error ? error.message : 'Failed to fetch nodes from database');
      } finally {
        setIsLoadingRealNode(false);
      }
    };

    fetchRealNode();
  }, []);

  // Create a sample BaseNode for demonstration
  const createSampleNode = async () => {
    try {
      const nodeData = {
        kind: 'BaseNode',
        createdBy: '507f1f77bcf86cd799439011',
        ownerId: '507f1f77bcf86cd799439011',
      };
      
      const result = await dispatch(createNode(nodeData)).unwrap();
      setCreatedNodeId(result._id.toString());
    } catch (error) {
      console.error('Failed to create sample node:', error);
    }
  };

  // Create a sample UserNode for demonstration
  const createSampleUserNode = async () => {
    try {
      const userNodeData = {
        kind: 'User',
        email: 'demo@example.com',
        name: 'Demo User',
        bio: 'This is a demo user created for testing the UserNodeView component.',
        isActive: true,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        preferences: {
          theme: 'dark',
          language: 'en',
          notifications: {
            email: true,
            push: false,
          },
        },
        createdBy: '507f1f77bcf86cd799439011',
        ownerId: '507f1f77bcf86cd799439011',
      };
      
      const result = await dispatch(createNode(userNodeData)).unwrap();
      setCreatedNodeId(result._id.toString());
    } catch (error) {
      console.error('Failed to create sample user node:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            BaseNodeView Component Demonstration
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            This page demonstrates the BaseNodeView component and its extensibility pattern.
            The component automatically fetches nodes from Redux store or API and displays them.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={createSampleNode}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Sample BaseNode
          </button>
          <button
            onClick={createSampleUserNode}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Create Sample UserNode
          </button>
        </div>

        {/* Show real node from database */}
        {isLoadingRealNode && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              🔍 Fetching Real Node from Database...
            </h3>
            <p className="text-blue-700">Looking for existing nodes in the database...</p>
          </div>
        )}

        {realNodeError && (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              ⚠️ Database Connection Issue
            </h3>
            <p className="text-yellow-700 mb-2">{realNodeError}</p>
            <p className="text-sm text-yellow-600">
              This might be because the API server is not running or there are no nodes in the database yet.
              Try creating a sample node below to see the components in action.
            </p>
          </div>
        )}

        {realNodeId && !realNodeError && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              ✅ Real Node Found in Database!
            </h3>
            <p className="text-green-700">
              Using real node ID: <code className="bg-green-100 px-2 py-1 rounded">{realNodeId}</code>
            </p>
            <p className="text-sm text-green-600 mt-2">
              The examples below are now using this real node from your database.
            </p>
          </div>
        )}

        {/* Show created node if available */}
        {createdNodeId && (
          <div className="mb-8 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-800 mb-2">
              ✅ Sample Node Created Successfully!
            </h3>
            <p className="text-purple-700">
              Created node ID: <code className="bg-purple-100 px-2 py-1 rounded">{createdNodeId}</code>
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* BaseNodeView Examples */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">BaseNodeView Examples</h2>
            
            {/* Example 1: Basic BaseNodeView */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">
                1. Basic BaseNodeView {realNodeId && <span className="text-green-600">(Real Node)</span>}
              </h3>
              <BaseNodeView nodeId={realNodeId || "507f1f77bcf86cd799439011"} />
            </div>

            {/* Example 2: BaseNodeView with Custom Styling */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">
                2. With Custom Styling {realNodeId && <span className="text-green-600">(Real Node)</span>}
              </h3>
              <BaseNodeView 
                nodeId={realNodeId || "507f1f77bcf86cd799439012"} 
                className="max-w-md mx-auto"
              />
            </div>

            {/* Example 3: BaseNodeView with Render Prop */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">
                3. With Custom Render Prop {realNodeId && <span className="text-green-600">(Real Node)</span>}
              </h3>
              <BaseNodeView nodeId={realNodeId || "507f1f77bcf86cd799439013"}>
                {(node, isLoading, error) => {
                  if (isLoading) {
                    return (
                      <div className="flex items-center justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600">Loading node...</span>
                      </div>
                    );
                  }
                  
                  if (error) {
                    return (
                      <div className="bg-red-50 border border-red-200 rounded p-4">
                        <p className="text-red-600">❌ Error: {error}</p>
                      </div>
                    );
                  }
                  
                  if (!node) {
                    return (
                      <div className="bg-gray-50 border border-gray-200 rounded p-4">
                        <p className="text-gray-600">📭 No node found</p>
                      </div>
                    );
                  }
                  
                  return (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">N</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Custom Node Display</h4>
                          <p className="text-sm text-gray-600">ID: {node._id.toString().slice(-8)}</p>
                          <p className="text-xs text-gray-500">
                            Created: {new Date(node.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }}
              </BaseNodeView>
            </div>

            {/* Example 4: Show Created Node */}
            {createdNodeId && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">4. Recently Created Sample Node</h3>
                <BaseNodeView nodeId={createdNodeId} />
              </div>
            )}

            {/* Example 5: Show Real Node from Database */}
            {realNodeId && !realNodeError && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">
                  5. Real Node from Database
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Live Data
                  </span>
                </h3>
                <BaseNodeView nodeId={realNodeId} />
              </div>
            )}
          </div>

          {/* UserNodeView Examples */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">UserNodeView Examples</h2>
            
            {/* Example 1: Basic UserNodeView */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">
                1. Basic UserNodeView {realNodeId && <span className="text-green-600">(Real Node)</span>}
              </h3>
              <UserNodeView nodeId={realNodeId || "507f1f77bcf86cd799439021"} />
            </div>

            {/* Example 2: UserNodeView with Custom Styling */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">
                2. With Custom Styling {realNodeId && <span className="text-green-600">(Real Node)</span>}
              </h3>
              <UserNodeView 
                nodeId={realNodeId || "507f1f77bcf86cd799439022"} 
                className="max-w-md mx-auto"
              />
            </div>

            {/* Example 3: UserNodeView with Render Prop */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">
                3. With Custom Render Prop {realNodeId && <span className="text-green-600">(Real Node)</span>}
              </h3>
              <UserNodeView nodeId={realNodeId || "507f1f77bcf86cd799439023"}>
                {(userNode, isLoading, error) => {
                  if (isLoading) {
                    return (
                      <div className="flex items-center justify-center p-8">
                        <div className="animate-pulse flex space-x-4 w-full">
                          <div className="rounded-full bg-gray-300 h-12 w-12"></div>
                          <div className="flex-1 space-y-2 py-1">
                            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                            <div className="space-y-2">
                              <div className="h-4 bg-gray-300 rounded"></div>
                              <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  if (error) {
                    return (
                      <div className="bg-red-50 border border-red-200 rounded p-4">
                        <p className="text-red-600">❌ Error: {error}</p>
                      </div>
                    );
                  }
                  
                  if (!userNode) {
                    return (
                      <div className="bg-gray-50 border border-gray-200 rounded p-4">
                        <p className="text-gray-600">👤 No user found</p>
                      </div>
                    );
                  }
                  
                  return (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-4">
                        {userNode.avatar && (
                          <img
                            src={userNode.avatar}
                            alt={userNode.name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-green-200"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 text-lg">{userNode.name}</h4>
                          <p className="text-green-600 font-medium">{userNode.email}</p>
                          {userNode.bio && (
                            <p className="text-sm text-gray-600 mt-1 italic">"{userNode.bio}"</p>
                          )}
                          <div className="flex items-center mt-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              userNode.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {userNode.isActive ? '🟢 Active' : '🔴 Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }}
              </UserNodeView>
            </div>

            {/* Example 4: Show Created User Node */}
            {createdNodeId && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">4. Recently Created Sample User Node</h3>
                <UserNodeView nodeId={createdNodeId} />
              </div>
            )}

            {/* Example 5: Show Real User Node from Database */}
            {realNodeId && !realNodeError && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">
                  5. Real User Node from Database
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Live Data
                  </span>
                </h3>
                <UserNodeView nodeId={realNodeId} />
              </div>
            )}
          </div>
        </div>

        {/* Architecture Information */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Architecture Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-blue-600">Data Flow & Caching</h3>
              <ol className="space-y-2 text-sm text-gray-600">
                <li>1. Component checks Redux store for node data</li>
                <li>2. If not found, checks if already fetching</li>
                <li>3. If not fetching, dispatches fetchNodeById action</li>
                <li>4. API client checks cache before making request</li>
                <li>5. Redux store is updated with new data</li>
                <li>6. All components using same node get updated data</li>
              </ol>
              {realNodeId && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm text-green-700">
                    <strong>Live Demo:</strong> The examples above are using real node ID <code>{realNodeId}</code> from your database!
                  </p>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3 text-green-600">Request Deduplication</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• <strong>Redux Condition:</strong> Prevents duplicate fetches</li>
                <li>• <strong>Loading State:</strong> Tracks individual operations</li>
                <li>• <strong>API Cache:</strong> 5-minute TTL for responses</li>
                <li>• <strong>Store Cache:</strong> Immediate access to cached data</li>
                <li>• <strong>Cache Invalidation:</strong> Updates clear stale data</li>
              </ul>
              {realNodeError && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-700">
                    <strong>Note:</strong> Using placeholder IDs since no real nodes were found in the database.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">🚀 Performance Optimizations</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700">
              <div>
                <strong>Request Deduplication:</strong><br/>
                Multiple components requesting the same node will only trigger one API call
              </div>
              <div>
                <strong>Smart Caching:</strong><br/>
                API responses cached for 5 minutes, Redux store provides instant access
              </div>
              <div>
                <strong>Loading States:</strong><br/>
                Components show loading only when actually fetching, not when data exists
              </div>
            </div>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3 text-blue-800">How to Use</h3>
          <div className="text-sm text-blue-700 space-y-2">
            <p><strong>1. Basic Usage:</strong> <code>&lt;BaseNodeView nodeId="your-node-id" /&gt;</code></p>
            <p><strong>2. Custom Styling:</strong> Add <code>className</code> prop for custom CSS</p>
            <p><strong>3. Custom Rendering:</strong> Use <code>children</code> render prop function</p>
            <p><strong>4. Extend for Other Types:</strong> Follow UserNodeView pattern</p>
            {realNodeId && (
              <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded">
                <p className="text-sm text-green-800">
                  <strong>💡 Pro Tip:</strong> This demo is using real data from your database! 
                  The node ID <code>{realNodeId}</code> was fetched from your MongoDB collection.
                </p>
              </div>
            )}
            {realNodeError && (
              <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>💡 Tip:</strong> To see real data, make sure your API server is running and has some nodes in the database.
                  You can create sample nodes using the buttons above.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
