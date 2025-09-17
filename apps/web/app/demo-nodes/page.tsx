'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppDispatch } from '@web/store/hooks';
import { createNode, fetchNodes } from '@web/store/slices/nodesSlice';
import { apiClient } from '@web/lib/api-client';
import { NODE_TYPES } from '@whitepine/types';
import { ExternalLink, Database, Plus, Users, FileText, Package } from 'lucide-react';

type NodeType = 'BaseNode' | 'UserNode' | 'PostNode';

export default function NodeViewDemo() {
  const dispatch = useAppDispatch();
  const [selectedNodeType, setSelectedNodeType] = useState<NodeType>('BaseNode');
  const [createdNodeId, setCreatedNodeId] = useState<string | null>(null);
  const [availableNodes, setAvailableNodes] = useState<any[]>([]);
  const [isLoadingNodes, setIsLoadingNodes] = useState(true);
  const [nodesError, setNodesError] = useState<string | null>(null);
  
  // State for isolated PostNodes
  const [isolatedPostNodes, setIsolatedPostNodes] = useState<any[]>([]);
  const [isLoadingIsolatedPosts, setIsLoadingIsolatedPosts] = useState(false);
  const [isolatedPostsError, setIsolatedPostsError] = useState<string | null>(null);
  
  // State for creating new PostNodes
  const [newPostContent, setNewPostContent] = useState('');
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [createPostError, setCreatePostError] = useState<string | null>(null);

  // Function to fetch isolated PostNodes
  const fetchIsolatedPostNodes = async () => {
    try {
      setIsLoadingIsolatedPosts(true);
      setIsolatedPostsError(null);
      const posts = await apiClient.getIsolatedPostNodes();
      setIsolatedPostNodes(posts);
    } catch (error: any) {
      setIsolatedPostsError(error.message || 'Failed to fetch isolated posts');
      console.error('Error fetching isolated posts:', error);
    } finally {
      setIsLoadingIsolatedPosts(false);
    }
  };

  // Function to create a new PostNode
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    try {
      setIsCreatingPost(true);
      setCreatePostError(null);
      
      const newPost = await apiClient.createPostNode(newPostContent.trim());
      setNewPostContent('');
      
      // Refresh the list of isolated posts
      await fetchIsolatedPostNodes();
      
      console.log('Created new post:', newPost);
    } catch (error: any) {
      setCreatePostError(error.message || 'Failed to create post');
      console.error('Error creating post:', error);
    } finally {
      setIsCreatingPost(false);
    }
  };

  // Fetch isolated PostNodes on component mount
  useEffect(() => {
    fetchIsolatedPostNodes();
  }, []);

  // Fetch available nodes from the database on component mount
  useEffect(() => {
    const fetchAvailableNodes = async () => {
      try {
        setIsLoadingNodes(true);
        setNodesError(null);
        
        // Try to fetch nodes from the API
        const { nodes } = await apiClient.getNodes({ limit: 20 });
        
        if (nodes && nodes.length > 0) {
          setAvailableNodes(nodes);
        } else {
          // No nodes found in database
          setNodesError('No nodes found in database');
        }
      } catch (error) {
        console.error('Failed to fetch nodes:', error);
        setNodesError(error instanceof Error ? error.message : 'Failed to fetch nodes from database');
      } finally {
        setIsLoadingNodes(false);
      }
    };

    fetchAvailableNodes();
  }, []);

  // Create a sample node based on selected type
  const createSampleNode = async () => {
    try {
      let nodeData: any = {
        // Note: All relationships are now handled via SynapseNode connections
      };

      switch (selectedNodeType) {
        case 'BaseNode':
          nodeData.kind = NODE_TYPES.POST; // Use post as default since BaseNode isn't a valid kind
          nodeData.content = 'This is a sample base node created for testing.';
          break;
        case 'UserNode':
          nodeData = {
            ...nodeData,
            kind: NODE_TYPES.USER,
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
          };
          break;
        case 'PostNode':
          nodeData = {
            ...nodeData,
            kind: NODE_TYPES.POST,
            content: 'This is a sample post created for testing the PostNodeView component.',
            title: 'Sample Post Title',
            tags: ['demo', 'sample', 'testing'],
          };
          break;
      }
      
      const result = await dispatch(createNode(nodeData)).unwrap();
      setCreatedNodeId(result._id.toString());
    } catch (error) {
      console.error('Failed to create sample node:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            NodeView Components Demonstration
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Browse and inspect nodes from your database. Click on any node to view it in detail
            and explore its relationships with other nodes.
          </p>
        </div>

        {/* Available Nodes Section */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Available Nodes ({availableNodes.length})
              </h2>
              <button
                onClick={() => window.location.reload()}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Refresh
              </button>
            </div>

            {isLoadingNodes ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse bg-gray-200 rounded h-16 w-full"></div>
                ))}
              </div>
            ) : nodesError ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  ⚠️ Database Connection Issue
                </h3>
                <p className="text-yellow-700 mb-2">{nodesError}</p>
                <p className="text-sm text-yellow-600">
                  This might be because the API server is not running or there are no nodes in the database yet.
                  Try creating a sample node below to see the components in action.
                </p>
              </div>
            ) : availableNodes.length === 0 ? (
              <div className="text-center py-8">
                <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Nodes Found</h3>
                <p className="text-gray-600">Create some sample nodes below to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableNodes.map((node) => {
                  const nodeId = typeof node._id === 'string' ? node._id : node._id.toString();
                  return (
                  <Link
                    key={nodeId}
                    href={`/demo-nodes/${nodeId}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center">
                        {node.kind === 'User' && <Users className="w-4 h-4 text-blue-600 mr-2" />}
                        {node.kind === 'Post' && <FileText className="w-4 h-4 text-green-600 mr-2" />}
                        {node.kind === 'BaseNode' && <Package className="w-4 h-4 text-gray-600 mr-2" />}
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {node.kind || 'Unknown'}
                        </span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                    
                    <div className="text-xs text-gray-500 font-mono mb-2">
                      {nodeId.substring(0, 12)}...
                    </div>
                    
                    {node.name && (
                      <div className="text-sm text-gray-700 font-medium truncate">
                        {node.name}
                      </div>
                    )}
                    
                    {node.title && (
                      <div className="text-sm text-gray-700 font-medium truncate">
                        {node.title}
                      </div>
                    )}
                    
                    {node.content && (
                      <div className="text-sm text-gray-600 truncate">
                        {node.content.substring(0, 60)}...
                      </div>
                    )}
                  </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Node Type Selector and Create Button */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Create Sample Nodes
          </h2>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="bg-gray-50 rounded-lg p-1">
              <div className="flex">
                {(['BaseNode', 'UserNode', 'PostNode'] as NodeType[]).map((nodeType) => (
                  <button
                    key={nodeType}
                    onClick={() => setSelectedNodeType(nodeType)}
                    className={`px-4 py-2 rounded-md font-medium transition-all duration-200 text-sm ${
                      selectedNodeType === nodeType
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {nodeType === 'BaseNode' ? 'Base Node' : 
                     nodeType === 'UserNode' ? 'User Node' : 'Post Node'}
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={createSampleNode}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Sample {selectedNodeType === 'BaseNode' ? 'Base' : 
                            selectedNodeType === 'UserNode' ? 'User' : 'Post'} Node
            </button>
          </div>
          
          {createdNodeId && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm">
                ✅ Created node: <code className="bg-green-100 px-2 py-1 rounded">{createdNodeId}</code>
                <Link 
                  href={`/demo-nodes/${createdNodeId}`}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  View Node →
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Quick Start Guide */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Start Guide</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-blue-600">How to Use</h3>
              <ol className="space-y-2 text-sm text-gray-600">
                <li>1. Browse available nodes in the grid above</li>
                <li>2. Click any node to inspect it in detail</li>
                <li>3. View relationships and connected nodes</li>
                <li>4. Click on related node IDs to navigate</li>
                <li>5. Create sample nodes to test functionality</li>
              </ol>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3 text-green-600">Features</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• <strong>Dynamic Routing:</strong> Navigate between nodes via URL</li>
                <li>• <strong>Relationship Discovery:</strong> See synaptic and attribute connections</li>
                <li>• <strong>Smart Caching:</strong> Fast loading with request deduplication</li>
                <li>• <strong>Interactive UI:</strong> Click node IDs to explore relationships</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">💡 Pro Tip</h4>
            <p className="text-sm text-blue-700">
              All node IDs in the NodeView components are clickable links that will take you to that node's detail page. 
              This makes it easy to explore the relationships between nodes in your database.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
